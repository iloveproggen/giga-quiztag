import {
  type BuzzerWinner,
  type QuizState,
  type Team,
} from '@/components/quiz/config';
import { readQuizState, updateQuizState } from '@/lib/quiz-state-store';

export const runtime = 'nodejs';

type TeamRegistrationPayload = {
  teamId?: unknown;
  name?: unknown;
  icon?: unknown;
  color?: unknown;
};

type BuzzPayload = {
  teamId?: unknown;
};

type BuzzerAdminPayload =
  | {
      action?: unknown;
      isEnabled?: unknown;
    }
  | unknown;

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}

function createEventId() {
  return crypto.randomUUID();
}

function appendServerEvent(
  current: QuizState,
  eventInput: Omit<QuizState['gameEvents'][number], 'id' | 'timestamp'>,
) {
  return [
    ...current.gameEvents,
    {
      id: createEventId(),
      timestamp: Date.now(),
      ...eventInput,
    },
  ];
}

function normalizeTeamColor(value: unknown) {
  if (typeof value !== 'string') {
    return '#d77a7a';
  }

  const trimmedValue = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmedValue) ? trimmedValue : '#d77a7a';
}

function normalizeTeamName(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, 40);
}

function normalizeTeamIcon(value: unknown) {
  if (typeof value !== 'string') {
    return 'B';
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue.slice(0, 6) : 'B';
}

function buildBuzzerWinner(team: Team): BuzzerWinner {
  return {
    teamId: team.id,
    teamName: team.name,
    teamIcon: team.icon,
    teamColor: team.color,
    buzzedAt: Date.now(),
  };
}

export async function GET() {
  try {
    const state = await readQuizState();
    return Response.json({ state });
  } catch (error) {
    console.error('Failed to read buzzer state.', error);
    return Response.json(
      {
        error: `Buzzer state could not be loaded: ${toErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as TeamRegistrationPayload;
    const name = normalizeTeamName(payload.name);

    if (!name) {
      return Response.json(
        { error: 'Please provide a team name.' },
        { status: 400 },
      );
    }

    const icon = normalizeTeamIcon(payload.icon);
    const color = normalizeTeamColor(payload.color);
    const requestedTeamId =
      typeof payload.teamId === 'string' && payload.teamId.trim()
        ? payload.teamId.trim()
        : crypto.randomUUID();

    const result = await updateQuizState((currentState) => {
      const existingTeam = currentState.teams.find(
        (team) => team.id === requestedTeamId,
      );
      const nextTeam: Team = existingTeam
        ? {
            ...existingTeam,
            name,
            icon,
            color,
          }
        : {
            id: requestedTeamId,
            name,
            score: 0,
            color,
            icon,
            members: [],
          };

      const nextState: QuizState = {
        ...currentState,
        teams: existingTeam
          ? currentState.teams.map((team) =>
              team.id === requestedTeamId ? nextTeam : team,
            )
          : [...currentState.teams, nextTeam],
        gameEvents: appendServerEvent(currentState, {
          label: 'Team',
          teamId: nextTeam.id,
          teamName: nextTeam.name,
          pointsChanged: 0,
          note: existingTeam
            ? `${nextTeam.name} hat sein Handy-Teamprofil aktualisiert.`
            : `${nextTeam.name} hat sich ueber den Buzzer registriert.`,
        }),
        updatedAt: Date.now(),
      };

      return {
        nextState,
        result: {
          state: nextState,
          team: nextTeam,
        },
      };
    });

    return Response.json(result);
  } catch (error) {
    console.error('Failed to register buzzer team.', error);
    return Response.json(
      {
        error: `Buzzer team could not be saved: ${toErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BuzzPayload;
    const teamId =
      typeof payload.teamId === 'string' ? payload.teamId.trim() : '';

    if (!teamId) {
      return Response.json(
        { error: 'Please provide a valid team id.' },
        { status: 400 },
      );
    }

    const result = await updateQuizState<
      | {
          status: 'disabled';
          state: QuizState;
        }
      | {
          status: 'missing-team';
          state: QuizState;
        }
      | {
          status: 'locked';
          winner: BuzzerWinner;
          state: QuizState;
        }
      | {
          status: 'accepted';
          winner: BuzzerWinner;
          state: QuizState;
        }
    >((currentState) => {
      const team = currentState.teams.find((entry) => entry.id === teamId);

      if (!currentState.buzzer.isEnabled) {
        return {
          nextState: currentState,
          result: {
            status: 'disabled' as const,
            state: currentState,
          },
        };
      }

      if (!team) {
        return {
          nextState: currentState,
          result: {
            status: 'missing-team' as const,
            state: currentState,
          },
        };
      }

      if (currentState.buzzer.winner) {
        return {
          nextState: currentState,
          result: {
            status: 'locked' as const,
            winner: currentState.buzzer.winner,
            state: currentState,
          },
        };
      }

      const winner = buildBuzzerWinner(team);
      const nextState: QuizState = {
        ...currentState,
        buzzer: {
          ...currentState.buzzer,
          winner,
        },
        gameEvents: appendServerEvent(currentState, {
          label: 'Buzzer',
          teamId: team.id,
          teamName: team.name,
          pointsChanged: 0,
          note: `${team.name} hat als erstes gebuzzert.`,
        }),
        updatedAt: Date.now(),
      };

      return {
        nextState,
        result: {
          status: 'accepted' as const,
          winner,
          state: nextState,
        },
      };
    });

    if (result.status === 'missing-team') {
      return Response.json(
        { error: 'This team is no longer registered.', state: result.state },
        { status: 404 },
      );
    }

    if (result.status === 'disabled') {
      return Response.json(
        { error: 'The buzzer is currently disabled.', state: result.state },
        { status: 409 },
      );
    }

    if (result.status === 'locked') {
      return Response.json(
        {
          error: 'A team has already buzzed first.',
          winner: result.winner,
          state: result.state,
        },
        { status: 409 },
      );
    }

    return Response.json(result);
  } catch (error) {
    console.error('Failed to process buzzer press.', error);
    return Response.json(
      {
        error: `Buzzer press could not be processed: ${toErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as BuzzerAdminPayload;
    const action =
      typeof payload === 'object' &&
      payload !== null &&
      'action' in payload &&
      typeof payload.action === 'string'
        ? payload.action
        : null;

    if (action !== 'set-enabled' && action !== 'reset-winner') {
      return Response.json(
        { error: 'Please provide a valid buzzer admin action.' },
        { status: 400 },
      );
    }

    if (action === 'set-enabled') {
      const isEnabled =
        typeof payload === 'object' &&
        payload !== null &&
        'isEnabled' in payload &&
        typeof payload.isEnabled === 'boolean'
          ? payload.isEnabled
          : null;

      if (isEnabled === null) {
        return Response.json(
          { error: 'Please provide a boolean buzzer enabled value.' },
          { status: 400 },
        );
      }

      const result = await updateQuizState((currentState) => {
        if (currentState.buzzer.isEnabled === isEnabled) {
          return {
            nextState: currentState,
            result: {
              state: currentState,
            },
          };
        }

        const nextState: QuizState = {
          ...currentState,
          buzzer: {
            ...currentState.buzzer,
            isEnabled,
          },
          gameEvents: appendServerEvent(currentState, {
            label: 'Buzzer',
            pointsChanged: 0,
            note: isEnabled ? 'Buzzer wurde aktiviert.' : 'Buzzer wurde deaktiviert.',
          }),
          updatedAt: Date.now(),
        };

        return {
          nextState,
          result: {
            state: nextState,
          },
        };
      });

      return Response.json(result);
    }

    const result = await updateQuizState((currentState) => {
      if (!currentState.buzzer.winner) {
        return {
          nextState: currentState,
          result: {
            state: currentState,
          },
        };
      }

      const nextState: QuizState = {
        ...currentState,
        buzzer: {
          ...currentState.buzzer,
          winner: null,
        },
        gameEvents: appendServerEvent(currentState, {
          label: 'Buzzer',
          pointsChanged: 0,
          note: 'Buzzer-Ergebnis wurde zurueckgesetzt.',
        }),
        updatedAt: Date.now(),
      };

      return {
        nextState,
        result: {
          state: nextState,
        },
      };
    });

    return Response.json(result);
  } catch (error) {
    console.error('Failed to update buzzer admin state.', error);

    const status = error instanceof SyntaxError ? 400 : 500;
    const message =
      status === 400
        ? 'Buzzer admin payload is not valid JSON.'
        : `Buzzer admin state could not be saved: ${toErrorMessage(error)}`;

    return Response.json({ error: message }, { status });
  }
}

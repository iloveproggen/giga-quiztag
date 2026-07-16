'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { QuizState, Team } from '@/components/quiz/config';
import { HydrationPlaceholder, StatusPill, TeamAvatar } from '@/components/quiz/ui';
import { normalizeQuizState } from '@/lib/quiz-state';

const BUZZER_TEAM_STORAGE_KEY = 'giga-quiz-buzzer-team';
const BUZZER_API_ROUTE = '/api/buzzer';
const BUZZER_POLL_INTERVAL_MS = 1000;

type StoredBuzzerTeam = {
  teamId: string | null;
  name: string;
  icon: string;
  color: string;
};

type BuzzerApiResponse = {
  error?: string;
  state?: unknown;
  team?: Team;
};

const defaultStoredTeam: StoredBuzzerTeam = {
  teamId: null,
  name: '',
  icon: '⚡',
  color: '#d77a7a',
};

function readStoredBuzzerTeam() {
  if (typeof window === 'undefined') {
    return defaultStoredTeam;
  }

  const rawValue = window.localStorage.getItem(BUZZER_TEAM_STORAGE_KEY);
  if (!rawValue) {
    return defaultStoredTeam;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<StoredBuzzerTeam>;
    return {
      teamId:
        typeof parsedValue.teamId === 'string' ? parsedValue.teamId : null,
      name: typeof parsedValue.name === 'string' ? parsedValue.name : '',
      icon: typeof parsedValue.icon === 'string' ? parsedValue.icon : '⚡',
      color:
        typeof parsedValue.color === 'string' ? parsedValue.color : '#d77a7a',
    };
  } catch (error) {
    console.error('Failed to parse local buzzer team.', error);
    return defaultStoredTeam;
  }
}

function persistStoredBuzzerTeam(value: StoredBuzzerTeam) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(BUZZER_TEAM_STORAGE_KEY, JSON.stringify(value));
}

export function BuzzerPage() {
  const [storedTeam, setStoredTeam] = useState<StoredBuzzerTeam>(() =>
    readStoredBuzzerTeam(),
  );
  const [teamName, setTeamName] = useState(storedTeam.name);
  const [teamIcon, setTeamIcon] = useState(storedTeam.icon);
  const [teamColor, setTeamColor] = useState(storedTeam.color);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [isEditing, setIsEditing] = useState(storedTeam.teamId === null);
  const [isSaving, setIsSaving] = useState(false);
  const [isBuzzing, setIsBuzzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const response = await fetch(BUZZER_API_ROUTE, { cache: 'no-store' });
      const payload = (await response.json()) as BuzzerApiResponse;

      if (!response.ok || !payload.state) {
        throw new Error(payload.error ?? 'Buzzer state could not be loaded.');
      }

      const nextState = normalizeQuizState(payload.state);
      setQuizState(nextState);
    } catch (error) {
      console.error('Failed to refresh buzzer state.', error);
    }
  }, []);

  useEffect(() => {
    const initialFetchTimer = window.setTimeout(() => {
      void fetchState();
    }, 0);

    const intervalId = window.setInterval(() => {
      void fetchState();
    }, BUZZER_POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialFetchTimer);
      window.clearInterval(intervalId);
    };
  }, [fetchState]);

  const registeredTeam = useMemo(() => {
    if (!quizState || !storedTeam.teamId) {
      return null;
    }

    return quizState.teams.find((team) => team.id === storedTeam.teamId) ?? null;
  }, [quizState, storedTeam.teamId]);

  const winner = quizState?.buzzer.winner ?? null;
  const canBuzz =
    Boolean(registeredTeam) &&
    Boolean(quizState?.buzzer.isEnabled) &&
    winner === null &&
    !isBuzzing;

  async function saveTeamProfile() {
    const trimmedName = teamName.trim();

    if (!trimmedName) {
      setStatusMessage('Bitte gib zuerst einen Teamnamen ein.');
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const response = await fetch(BUZZER_API_ROUTE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: storedTeam.teamId,
          name: trimmedName,
          icon: teamIcon,
          color: teamColor,
        }),
      });
      const payload = (await response.json()) as BuzzerApiResponse;

      if (!response.ok || !payload.team || !payload.state) {
        throw new Error(payload.error ?? 'Team profile could not be saved.');
      }

      const nextStoredTeam: StoredBuzzerTeam = {
        teamId: payload.team.id,
        name: payload.team.name,
        icon: payload.team.icon ?? teamIcon,
        color: payload.team.color ?? teamColor,
      };

      persistStoredBuzzerTeam(nextStoredTeam);
      setStoredTeam(nextStoredTeam);
      setTeamName(nextStoredTeam.name);
      setTeamIcon(nextStoredTeam.icon);
      setTeamColor(nextStoredTeam.color);
      setQuizState(normalizeQuizState(payload.state));
      setIsEditing(false);
      setStatusMessage('Team gespeichert. Ihr seid bereit.');
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Team konnte nicht gespeichert werden.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function submitBuzz() {
    if (!registeredTeam) {
      setStatusMessage('Speichere zuerst euer Teamprofil.');
      return;
    }

    setIsBuzzing(true);
    setStatusMessage(null);

    try {
      const response = await fetch(BUZZER_API_ROUTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: registeredTeam.id,
        }),
      });
      const payload = (await response.json()) as BuzzerApiResponse & {
        winner?: QuizState['buzzer']['winner'];
      };

      if (payload.state) {
        setQuizState(normalizeQuizState(payload.state));
      }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Buzz could not be registered.');
      }

      setStatusMessage('Buzz angekommen.');
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Buzz konnte nicht abgeschickt werden.',
      );
    } finally {
      setIsBuzzing(false);
    }
  }

  if (!quizState) {
    return (
      <HydrationPlaceholder
        title="Buzzer wird verbunden"
        message="Der Handy-Buzzer verbindet sich gerade mit dem Quiz-Backend."
      />
    );
  }

  if (isEditing || !registeredTeam) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 p-4 text-white">
        <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-md flex-col justify-center gap-6">
          <div className="space-y-3 text-center">
            <StatusPill tone="dark">Buzzer Setup</StatusPill>
            <h1 className="text-4xl font-black tracking-tight">Team anlegen</h1>
            <p className="text-base leading-7 text-slate-300">
              Jedes Team legt auf dem Handy seinen Namen, sein Emoji und seine Farbe selbst fest.
            </p>
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900 p-5">
            <div className="mb-5 flex justify-center">
              <TeamAvatar
                color={teamColor}
                label={teamIcon.trim() || teamName.trim().charAt(0) || '⚡'}
                size="large"
              />
            </div>

            <div className="grid gap-4">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Teamname
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg text-white outline-none focus:border-red-500"
                  value={teamName}
                  placeholder="Team Rakete"
                  onChange={(event) => setTeamName(event.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Emoji
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg text-white outline-none focus:border-red-500"
                  value={teamIcon}
                  placeholder="🚀"
                  onChange={(event) => setTeamIcon(event.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Farbe
                </span>
                <div className="flex gap-3">
                  <input
                    type="color"
                    className="h-14 w-14 rounded-2xl border border-slate-700 bg-slate-950"
                    value={teamColor}
                    onChange={(event) => setTeamColor(event.target.value)}
                  />
                  <input
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg text-white outline-none focus:border-red-500"
                    value={teamColor}
                    onChange={(event) => setTeamColor(event.target.value)}
                  />
                </div>
              </label>
            </div>
          </div>

          {statusMessage ? (
            <p className="text-center text-sm text-slate-300">{statusMessage}</p>
          ) : null}

          <button
            className="w-full rounded-[32px] bg-red-500 px-6 py-5 text-2xl font-black uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:bg-red-300"
            onClick={saveTeamProfile}
            disabled={isSaving}
          >
            {isSaving ? 'Speichern...' : 'Team speichern'}
          </button>
        </div>
      </div>
    );
  }

  const isWinner = winner?.teamId === registeredTeam.id;
  const buttonLabel = !quizState.buzzer.isEnabled
    ? 'Buzzer aus'
    : winner
      ? isWinner
        ? 'Ihr wart zuerst'
        : `${winner.teamName} war zuerst`
      : 'Buzzer';

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white">
      <div className="flex min-h-[100dvh] flex-col">
        <header className="flex items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <TeamAvatar
              color={registeredTeam.color}
              label={registeredTeam.icon ?? registeredTeam.name.charAt(0)}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Team
              </p>
              <p className="text-lg font-bold text-white">{registeredTeam.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <StatusPill tone={quizState.buzzer.isEnabled ? 'success' : 'warning'}>
              {quizState.buzzer.isEnabled ? 'Aktiv' : 'Inaktiv'}
            </StatusPill>
            <button
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-200"
              onClick={() => {
                setTeamName(registeredTeam.name);
                setTeamIcon(registeredTeam.icon ?? '⚡');
                setTeamColor(registeredTeam.color ?? '#d77a7a');
                setIsEditing(true);
              }}
            >
              Bearbeiten
            </button>
          </div>
        </header>

        <button
          className="flex flex-1 items-center justify-center px-6 py-10"
          onClick={submitBuzz}
          disabled={!canBuzz}
        >
          <div
            className={`flex h-full w-full items-center justify-center rounded-[40px] border text-center shadow-2xl transition ${
              canBuzz
                ? 'border-red-300 bg-red-500 active:scale-[0.99]'
                : isWinner
                  ? 'border-emerald-300 bg-emerald-500'
                  : 'border-slate-700 bg-slate-900'
            }`}
          >
            <div className="space-y-4">
              <p className="text-5xl font-black uppercase tracking-[0.12em] md:text-7xl">
                {buttonLabel}
              </p>
              <p className="mx-auto max-w-md text-base leading-7 text-white/85">
                {quizState.buzzer.isEnabled && !winner
                  ? 'Einmal tippen, um fuer euer Team zu buzzern.'
                  : quizState.buzzer.isEnabled
                    ? 'Der erste Buzz bleibt stehen, bis der Admin ihn zuruecksetzt.'
                    : 'Der Admin muss den Buzzer erst aktivieren.'}
              </p>
            </div>
          </div>
        </button>

        {statusMessage ? (
          <p className="px-6 pb-6 text-center text-sm text-slate-300">
            {statusMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

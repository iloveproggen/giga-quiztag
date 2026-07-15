'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  createDefaultQuizState,
  getDefaultTeam,
  getQuestionKey,
  getTotalQuestionCount,
  type GameEvent,
  type GameStatus,
  type PresentationView,
  type QuizState,
  type SelectedQuestion,
  type Team,
  sortRanking,
} from '@/components/quiz/config';

const STORAGE_KEY = 'giga-quiz-state-v2';
const CHANNEL_NAME = 'giga-quiz-state';

type TeamUpdate = {
  name?: string;
  color?: string;
  icon?: string;
  members?: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeSelectedQuestion(value: unknown): SelectedQuestion | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.categoryId !== 'string' ||
    typeof value.categoryName !== 'string' ||
    typeof value.categoryTint !== 'string' ||
    typeof value.categoryOrder !== 'number' ||
    typeof value.questionId !== 'string' ||
    typeof value.questionText !== 'string' ||
    typeof value.answerText !== 'string' ||
    typeof value.points !== 'number' ||
    typeof value.type !== 'string'
  ) {
    return null;
  }

  return {
    categoryId: value.categoryId,
    categoryName: value.categoryName,
    categoryTint: value.categoryTint,
    categoryOrder: value.categoryOrder,
    questionId: value.questionId,
    questionText: value.questionText,
    answerText: value.answerText,
    points: value.points,
    type: value.type as SelectedQuestion['type'],
    mediaUrl: typeof value.mediaUrl === 'string' ? value.mediaUrl : undefined,
    mediaKind:
      value.mediaKind === 'image' ||
      value.mediaKind === 'audio' ||
      value.mediaKind === 'video'
        ? value.mediaKind
        : undefined,
    options: Array.isArray(value.options)
      ? value.options.filter((item): item is string => typeof item === 'string')
      : undefined,
    music: isRecord(value.music)
      ? {
          songTitle:
            typeof value.music.songTitle === 'string'
              ? value.music.songTitle
              : '',
          artist:
            typeof value.music.artist === 'string' ? value.music.artist : '',
          clipLengths: Array.isArray(value.music.clipLengths)
            ? value.music.clipLengths.filter(
                (item): item is number => typeof item === 'number',
              )
            : [],
          bonusPrompts: Array.isArray(value.music.bonusPrompts)
            ? value.music.bonusPrompts.filter(
                (item): item is string => typeof item === 'string',
              )
            : undefined,
        }
      : undefined,
  };
}

function normalizeTeam(team: unknown, index: number): Team | null {
  if (!isRecord(team)) {
    return null;
  }

  return {
    id: typeof team.id === 'string' ? team.id : `team-${index + 1}`,
    name:
      typeof team.name === 'string' ? team.name : `Team ${index + 1}`,
    score:
      typeof team.score === 'number' && Number.isFinite(team.score)
        ? Math.max(0, team.score)
        : 0,
    color: typeof team.color === 'string' ? team.color : '#d77a7a',
    icon: typeof team.icon === 'string' ? team.icon : 'T',
    members: Array.isArray(team.members)
      ? team.members.filter((item): item is string => typeof item === 'string')
      : [],
  };
}

function normalizeGameEvent(value: unknown): GameEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== 'string' ||
    typeof value.timestamp !== 'number' ||
    typeof value.label !== 'string' ||
    typeof value.pointsChanged !== 'number' ||
    typeof value.note !== 'string'
  ) {
    return null;
  }

  return {
    id: value.id,
    timestamp: value.timestamp,
    label: value.label,
    teamId: typeof value.teamId === 'string' ? value.teamId : undefined,
    teamName: typeof value.teamName === 'string' ? value.teamName : undefined,
    questionId:
      typeof value.questionId === 'string' ? value.questionId : undefined,
    questionText:
      typeof value.questionText === 'string' ? value.questionText : undefined,
    categoryName:
      typeof value.categoryName === 'string' ? value.categoryName : undefined,
    pointsChanged: value.pointsChanged,
    note: value.note,
  };
}

function normalizeState(value: unknown): QuizState {
  const fallback = createDefaultQuizState();

  if (!isRecord(value)) {
    return fallback;
  }

  const teams = Array.isArray(value.teams)
    ? value.teams
        .map((team, index) => normalizeTeam(team, index))
        .filter((team): team is Team => team !== null)
    : fallback.teams;

  const answered = isRecord(value.answered)
    ? Object.fromEntries(
        Object.entries(value.answered).filter(
          (entry): entry is [string, boolean] => typeof entry[1] === 'boolean',
        ),
      )
    : {};

  const gameEvents = Array.isArray(value.gameEvents)
    ? value.gameEvents
        .map(normalizeGameEvent)
        .filter((event): event is GameEvent => event !== null)
    : [];

  return {
    teams: teams.length > 0 ? teams : fallback.teams,
    answered,
    selectedQuestion: normalizeSelectedQuestion(value.selectedQuestion),
    presentationView: normalizePresentationView(value.presentationView),
    gameStatus: normalizeGameStatus(value.gameStatus),
    showScores:
      typeof value.showScores === 'boolean' ? value.showScores : true,
    answersRevealed:
      typeof value.answersRevealed === 'boolean'
        ? value.answersRevealed
        : false,
    finalModeActive:
      typeof value.finalModeActive === 'boolean'
        ? value.finalModeActive
        : false,
    finalTeams: Array.isArray(value.finalTeams)
      ? value.finalTeams.filter((item): item is string => typeof item === 'string')
      : [],
    finalWinnerId:
      typeof value.finalWinnerId === 'string' ? value.finalWinnerId : null,
    gameEvents,
    updatedAt:
      typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt)
        ? value.updatedAt
        : fallback.updatedAt,
  };
}

function normalizePresentationView(value: unknown): PresentationView {
  switch (value) {
    case 'question':
    case 'answer':
    case 'scores':
    case 'top3':
    case 'final':
      return value;
    default:
      return 'board';
  }
}

function normalizeGameStatus(value: unknown): GameStatus {
  switch (value) {
    case 'running':
    case 'paused':
    case 'finished':
      return value;
    default:
      return 'idle';
  }
}

function readStoredState() {
  if (typeof window === 'undefined') {
    return createDefaultQuizState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultQuizState();
  }

  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return createDefaultQuizState();
  }
}

function createEventId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `event-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

function appendEvent(
  current: QuizState,
  eventInput: Omit<GameEvent, 'id' | 'timestamp'>,
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

function getRoundLabel(current: QuizState) {
  return `Runde ${Object.keys(current.answered).length + 1}`;
}

export function useQuizStore() {
  const [state, setState] = useState<QuizState>(readStoredState);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        setState(normalizeState(JSON.parse(event.newValue)));
      } catch {
        setState(createDefaultQuizState());
      }
    };

    window.addEventListener('storage', handleStorage);

    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        setState(normalizeState(event.data));
      };
      channelRef.current = channel;
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  const commit = useCallback((updater: (current: QuizState) => QuizState) => {
    setState((current) => {
      const next = {
        ...updater(current),
        updatedAt: Date.now(),
      };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        channelRef.current?.postMessage(next);
      }

      return next;
    });
  }, []);

  const ranking = useMemo(() => sortRanking(state.teams), [state.teams]);
  const answeredCount = useMemo(
    () => Object.keys(state.answered).length,
    [state.answered],
  );
  const remainingQuestions = getTotalQuestionCount() - answeredCount;

  const actions = useMemo(
    () => ({
      startNewGame() {
        commit(() => ({
          ...createDefaultQuizState(),
          gameStatus: 'running',
          presentationView: 'board',
        }));
      },
      resumeGame() {
        commit((current) => ({
          ...current,
          gameStatus: 'running',
          presentationView:
            current.selectedQuestion && current.answersRevealed
              ? 'answer'
              : current.selectedQuestion
                ? 'question'
                : current.presentationView === 'board'
                  ? 'board'
                  : current.presentationView,
        }));
      },
      pauseGame() {
        commit((current) => ({
          ...current,
          gameStatus: 'paused',
          gameEvents: appendEvent(current, {
            label: 'Pause',
            pointsChanged: 0,
            note: 'Spiel wurde pausiert.',
          }),
        }));
      },
      endGame() {
        commit((current) => ({
          ...current,
          gameStatus: 'finished',
          presentationView: current.finalModeActive ? 'final' : 'scores',
          gameEvents: appendEvent(current, {
            label: 'Spielende',
            pointsChanged: 0,
            note: 'Spiel wurde beendet.',
          }),
        }));
      },
      selectQuestion(question: SelectedQuestion) {
        commit((current) => ({
          ...current,
          selectedQuestion: question,
          answersRevealed: false,
          presentationView: 'question',
          gameStatus: current.gameStatus === 'idle' ? 'running' : current.gameStatus,
        }));
      },
      revealAnswer() {
        commit((current) => {
          if (!current.selectedQuestion) {
            return current;
          }

          return {
            ...current,
            answersRevealed: true,
            presentationView: 'answer',
          };
        });
      },
      clearQuestion() {
        commit((current) => ({
          ...current,
          selectedQuestion: null,
          answersRevealed: false,
          presentationView: 'board',
        }));
      },
      closeQuestionWithoutPoints() {
        commit((current) => {
          const selectedQuestion = current.selectedQuestion;

          if (!selectedQuestion) {
            return current;
          }

          return {
            ...current,
            answered: {
              ...current.answered,
              [
                getQuestionKey(
                  selectedQuestion.categoryId,
                  selectedQuestion.questionId,
                )
              ]: true,
            },
            selectedQuestion: null,
            answersRevealed: false,
            presentationView: 'board',
            gameEvents: appendEvent(current, {
              label: getRoundLabel(current),
              questionId: selectedQuestion.questionId,
              questionText: selectedQuestion.questionText,
              categoryName: selectedQuestion.categoryName,
              pointsChanged: 0,
              note: `${selectedQuestion.categoryName} | ${selectedQuestion.points} Punkte | Keine Punkte vergeben`,
            }),
          };
        });
      },
      awardSelectedQuestion(teamId: string) {
        commit((current) => {
          const selectedQuestion = current.selectedQuestion;
          const team = current.teams.find((entry) => entry.id === teamId);

          if (!selectedQuestion || !team) {
            return current;
          }

          return {
            ...current,
            teams: current.teams.map((entry) =>
              entry.id === teamId
                ? {
                    ...entry,
                    score: entry.score + selectedQuestion.points,
                  }
                : entry,
            ),
            answered: {
              ...current.answered,
              [
                getQuestionKey(
                  selectedQuestion.categoryId,
                  selectedQuestion.questionId,
                )
              ]: true,
            },
            selectedQuestion: null,
            answersRevealed: false,
            presentationView: 'board',
            gameEvents: appendEvent(current, {
              label: getRoundLabel(current),
              teamId: team.id,
              teamName: team.name,
              questionId: selectedQuestion.questionId,
              questionText: selectedQuestion.questionText,
              categoryName: selectedQuestion.categoryName,
              pointsChanged: selectedQuestion.points,
              note: `${selectedQuestion.categoryName} | ${selectedQuestion.points} Punkte | ${team.name} | +${selectedQuestion.points}`,
            }),
          };
        });
      },
      adjustTeamScore(teamId: string, delta: number) {
        commit((current) => {
          const team = current.teams.find((entry) => entry.id === teamId);
          if (!team) {
            return current;
          }

          return {
            ...current,
            teams: current.teams.map((entry) =>
              entry.id === teamId
                ? {
                    ...entry,
                    score: Math.max(0, entry.score + delta),
                  }
                : entry,
            ),
            gameEvents: appendEvent(current, {
              label: 'Korrektur',
              teamId: team.id,
              teamName: team.name,
              pointsChanged: delta,
              note: `${team.name} | ${delta >= 0 ? '+' : ''}${delta} Punkte`,
            }),
          };
        });
      },
      resetScores() {
        commit((current) => ({
          ...current,
          teams: current.teams.map((team) => ({
            ...team,
            score: 0,
          })),
          gameEvents: appendEvent(current, {
            label: 'Reset',
            pointsChanged: 0,
            note: 'Punktestand wurde auf null gesetzt.',
          }),
        }));
      },
      addTeam() {
        commit((current) => {
          const newTeam = getDefaultTeam(current.teams.length);
          return {
            ...current,
            teams: [...current.teams, newTeam],
            gameEvents: appendEvent(current, {
              label: 'Team',
              teamId: newTeam.id,
              teamName: newTeam.name,
              pointsChanged: 0,
              note: `${newTeam.name} wurde angelegt.`,
            }),
          };
        });
      },
      updateTeam(teamId: string, updates: TeamUpdate) {
        commit((current) => {
          const existingTeam = current.teams.find((team) => team.id === teamId);
          if (!existingTeam) {
            return current;
          }

          return {
            ...current,
            teams: current.teams.map((team) =>
              team.id === teamId
                ? {
                    ...team,
                    name: updates.name ?? team.name,
                    color: updates.color ?? team.color,
                    icon: updates.icon ?? team.icon,
                    members: updates.members ?? team.members,
                  }
                : team,
            ),
            gameEvents: appendEvent(current, {
              label: 'Team',
              teamId,
              teamName: updates.name ?? existingTeam.name,
              pointsChanged: 0,
              note: `${existingTeam.name} wurde aktualisiert.`,
            }),
          };
        });
      },
      deleteTeam(teamId: string) {
        commit((current) => {
          if (current.teams.length <= 1) {
            return current;
          }

          const team = current.teams.find((entry) => entry.id === teamId);
          if (!team) {
            return current;
          }

          return {
            ...current,
            teams: current.teams.filter((entry) => entry.id !== teamId),
            finalTeams: current.finalTeams.filter((id) => id !== teamId),
            finalWinnerId:
              current.finalWinnerId === teamId ? null : current.finalWinnerId,
            gameEvents: appendEvent(current, {
              label: 'Team',
              teamId,
              teamName: team.name,
              pointsChanged: 0,
              note: `${team.name} wurde geloescht.`,
            }),
          };
        });
      },
      setPresentationView(view: PresentationView) {
        commit((current) => ({
          ...current,
          presentationView: view,
        }));
      },
      toggleShowScores() {
        commit((current) => ({
          ...current,
          showScores: !current.showScores,
        }));
      },
      setFinalTeams(teamIds: string[]) {
        commit((current) => ({
          ...current,
          finalModeActive: teamIds.length > 0,
          finalTeams: teamIds,
          finalWinnerId:
            current.finalWinnerId && teamIds.includes(current.finalWinnerId)
              ? current.finalWinnerId
              : null,
          presentationView: teamIds.length > 0 ? 'final' : current.presentationView,
        }));
      },
      chooseFinalWinner(teamId: string) {
        commit((current) => {
          const team = current.teams.find((entry) => entry.id === teamId);
          if (!team) {
            return current;
          }

          return {
            ...current,
            finalModeActive: true,
            finalWinnerId: teamId,
            presentationView: 'final',
            gameStatus: 'finished',
            gameEvents: appendEvent(current, {
              label: 'Finale',
              teamId,
              teamName: team.name,
              pointsChanged: 0,
              note: `${team.name} wurde als Sieger des Stechens gesetzt.`,
            }),
          };
        });
      },
      clearFinalMode() {
        commit((current) => ({
          ...current,
          finalModeActive: false,
          finalTeams: [],
          finalWinnerId: null,
          presentationView: current.selectedQuestion ? 'question' : 'board',
        }));
      },
      resetGame() {
        commit(() => createDefaultQuizState());
      },
    }),
    [commit],
  );

  return {
    state,
    ranking,
    answeredCount,
    remainingQuestions,
    isHydrated,
    actions,
  };
}

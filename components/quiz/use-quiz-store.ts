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
  isSubquizView,
  type GameEvent,
  type PresentationView,
  type QuizState,
  type SelectedQuestion,
  sortRanking,
} from '@/components/quiz/config';
import { normalizeQuizState } from '@/lib/quiz-state';

const STORAGE_KEY = 'giga-quiz-state-v3';
const CHANNEL_NAME = 'giga-quiz-state';
const QUIZ_STATE_API_ROUTE = '/api/quiz-state';
const BUZZER_API_ROUTE = '/api/buzzer';
const SERVER_POLL_INTERVAL_MS = 1500;

type TeamUpdate = {
  name?: string;
  color?: string;
  icon?: string;
  members?: string[];
};

type StoredStateSnapshot = {
  hasStoredValue: boolean;
  state: QuizState;
};

type SyncResponse = {
  error?: string;
  state?: unknown;
};

type BuzzerAdminRequest =
  | {
      action: 'set-enabled';
      isEnabled: boolean;
    }
  | {
      action: 'reset-winner';
    };

type ApplyStateOptions = {
  broadcast?: boolean;
  persistLocal?: boolean;
};

function readStoredSnapshot(): StoredStateSnapshot {
  if (typeof window === 'undefined') {
    return {
      hasStoredValue: false,
      state: createDefaultQuizState(),
    };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      hasStoredValue: false,
      state: createDefaultQuizState(),
    };
  }

  try {
    return {
      hasStoredValue: true,
      state: normalizeQuizState(JSON.parse(raw)),
    };
  } catch (error) {
    console.error('Failed to parse quiz state from localStorage.', error);
    return {
      hasStoredValue: false,
      state: createDefaultQuizState(),
    };
  }
}

function persistLocalState(
  state: QuizState,
  channel: BroadcastChannel | null,
  broadcast: boolean,
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  if (broadcast) {
    channel?.postMessage(state);
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
  const [initialSnapshot] = useState<StoredStateSnapshot>(() => readStoredSnapshot());
  const [state, setState] = useState<QuizState>(() => initialSnapshot.state);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const latestStateRef = useRef<QuizState>(initialSnapshot.state);
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const applyState = useCallback(
    (nextState: QuizState, options: ApplyStateOptions = {}) => {
      latestStateRef.current = nextState;

      if (options.persistLocal ?? true) {
        persistLocalState(
          nextState,
          channelRef.current,
          options.broadcast ?? true,
        );
      }

      setState(nextState);
    },
    [],
  );

  const adoptExternalState = useCallback(
    (candidateState: QuizState, broadcast = false) => {
      if (candidateState.updatedAt <= latestStateRef.current.updatedAt) {
        return;
      }

      applyState(candidateState, {
        broadcast,
        persistLocal: true,
      });
    },
    [applyState],
  );

  const fetchStateFromServer = useCallback(
    async (preferRemote: boolean) => {
      try {
        const response = await fetch(QUIZ_STATE_API_ROUTE, {
          cache: 'no-store',
        });
        const payload = (await response.json()) as SyncResponse;

        if (!response.ok) {
          console.error(
            payload.error ?? 'Quiz state could not be loaded from backend.',
          );
          return;
        }

        if (!payload.state) {
          console.error('Quiz state response did not include a state payload.');
          return;
        }

        const remoteState = normalizeQuizState(payload.state);

        if (preferRemote || remoteState.updatedAt > latestStateRef.current.updatedAt) {
          applyState(remoteState, {
            broadcast: false,
            persistLocal: true,
          });
        }
      } catch (error) {
        console.error('Failed to load quiz state from backend.', error);
      }
    },
    [applyState],
  );

  const saveStateToServer = useCallback(
    async (nextState: QuizState, baseUpdatedAt: number) => {
      try {
        const response = await fetch(QUIZ_STATE_API_ROUTE, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          body: JSON.stringify({
            state: nextState,
            baseUpdatedAt,
          }),
        });
        const payload = (await response.json()) as SyncResponse;

        if (response.ok) {
          return;
        }

        if (response.status === 409 && payload.state) {
          adoptExternalState(normalizeQuizState(payload.state));
          return;
        }

        console.error(payload.error ?? 'Quiz state could not be saved to backend.');
      } catch (error) {
        console.error('Failed to save quiz state to backend.', error);
      }
    },
    [adoptExternalState],
  );

  const updateBuzzerState = useCallback(
    async (payload: BuzzerAdminRequest) => {
      try {
        const response = await fetch(BUZZER_API_ROUTE, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          body: JSON.stringify(payload),
        });
        const result = (await response.json()) as SyncResponse;

        if (!response.ok || !result.state) {
          console.error(result.error ?? 'Buzzer state could not be saved to backend.');
          void fetchStateFromServer(false);
          return;
        }

        applyState(normalizeQuizState(result.state), {
          broadcast: true,
          persistLocal: true,
        });
      } catch (error) {
        console.error('Failed to save buzzer state to backend.', error);
        void fetchStateFromServer(false);
      }
    },
    [applyState, fetchStateFromServer],
  );

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        adoptExternalState(normalizeQuizState(JSON.parse(event.newValue)));
      } catch (error) {
        console.error('Failed to parse quiz state from storage event.', error);
      }
    };

    window.addEventListener('storage', handleStorage);

    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.onmessage = (event) => {
        adoptExternalState(normalizeQuizState(event.data));
      };
      channelRef.current = channel;
    }

    const initialFetchTimer = window.setTimeout(() => {
      void fetchStateFromServer(!initialSnapshot.hasStoredValue);
    }, 0);

    const intervalId = window.setInterval(() => {
      void fetchStateFromServer(false);
    }, SERVER_POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialFetchTimer);
      window.clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [adoptExternalState, fetchStateFromServer, initialSnapshot.hasStoredValue]);

  const commit = useCallback(
    (updater: (current: QuizState) => QuizState) => {
      const currentState = latestStateRef.current;
      const candidateState = updater(currentState);

      if (candidateState === currentState) {
        return;
      }

      const nextState = {
        ...candidateState,
        updatedAt: Date.now(),
      };

      applyState(nextState, {
        broadcast: true,
        persistLocal: true,
      });
      void saveStateToServer(nextState, currentState.updatedAt);
    },
    [applyState, saveStateToServer],
  );

  const ranking = useMemo(() => sortRanking(state.teams), [state.teams]);
  const answeredCount = useMemo(
    () => Object.keys(state.answered).length,
    [state.answered],
  );
  const remainingQuestions = Math.max(getTotalQuestionCount() - answeredCount, 0);

  const actions = useMemo(
    () => ({
      startNewGame() {
        commit((current) => ({
          ...createDefaultQuizState(),
          teams: current.teams.map((team) => ({
            ...team,
            score: 0,
            members: [...(team.members ?? [])],
          })),
          gameStatus: 'idle',
          presentationView: 'board',
        }));
      },
      startGame() {
        commit((current) => ({
          ...current,
          gameStatus: 'running',
          selectedQuestion: null,
          answersRevealed: false,
          activeSubquiz: current.activeSubquiz,
          presentationView: current.activeSubquiz ?? 'board',
        }));
      },
      openQuizzesSelection() {
        commit((current) => ({
          ...current,
          gameStatus: current.gameStatus === 'idle' ? 'running' : current.gameStatus,
          selectedQuestion: null,
          answersRevealed: false,
          activeSubquiz: null,
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
          activeSubquiz: isSubquizView(question.categoryId)
            ? question.categoryId
            : current.activeSubquiz,
          presentationView: 'question',
          gameStatus: 'running',
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
            gameStatus: 'running',
          };
        });
      },
      clearQuestion() {
        commit((current) => ({
          ...current,
          selectedQuestion: null,
          answersRevealed: false,
          presentationView: current.activeSubquiz ?? 'board',
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
                  selectedQuestion.sourceQuestionId,
                )
              ]: true,
            },
            selectedQuestion: null,
            answersRevealed: false,
            presentationView: current.activeSubquiz ?? 'board',
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
                  selectedQuestion.sourceQuestionId,
                )
              ]: true,
            },
            selectedQuestion: null,
            answersRevealed: false,
            presentationView: current.activeSubquiz ?? 'board',
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
      syncTeam(teamId: string, updates: TeamUpdate) {
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
          };
        });
      },
      deleteTeam(teamId: string) {
        commit((current) => {
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
            buzzer:
              current.buzzer.winner?.teamId === teamId
                ? {
                    ...current.buzzer,
                    winner: null,
                  }
                : current.buzzer,
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
      deleteAllTeams() {
        commit((current) => {
          if (current.teams.length === 0) {
            return current;
          }

          return {
            ...current,
            teams: [],
            finalModeActive: false,
            finalTeams: [],
            finalWinnerId: null,
            buzzer: {
              isEnabled: false,
              winner: null,
            },
            gameEvents: appendEvent(current, {
              label: 'Team',
              pointsChanged: 0,
              note: 'Alle Teams wurden geloescht.',
            }),
          };
        });
      },
      setPresentationView(view: PresentationView) {
        commit((current) => ({
          ...current,
          activeSubquiz: isSubquizView(view) ? view : current.activeSubquiz,
          presentationView: view,
          gameStatus: current.gameStatus === 'paused' ? 'running' : current.gameStatus,
        }));
      },
      toggleShowScores() {
        commit((current) => ({
          ...current,
          showScores: !current.showScores,
        }));
      },
      setBuzzerEnabled(isEnabled: boolean) {
        void updateBuzzerState({
          action: 'set-enabled',
          isEnabled,
        });
      },
      resetBuzzerWinner() {
        void updateBuzzerState({
          action: 'reset-winner',
        });
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
        commit((current) => ({
          ...createDefaultQuizState(),
          teams: current.teams.map((team) => ({
            ...team,
            score: 0,
            members: [...(team.members ?? [])],
          })),
        }));
      },
    }),
    [commit, updateBuzzerState],
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

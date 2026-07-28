import {
  type BuzzerState,
  type BuzzerWinner,
  createDefaultQuizState,
  isSubquizView,
  type GameEvent,
  type PresentationView,
  type QuizState,
  type SelectedQuestion,
  type Team,
} from '@/components/quiz/config';

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
    sourceQuestionId:
      typeof value.sourceQuestionId === 'string'
        ? value.sourceQuestionId
        : value.questionId,
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
    name: typeof team.name === 'string' ? team.name : `Team ${index + 1}`,
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

function normalizeBuzzerWinner(value: unknown): BuzzerWinner | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.teamId !== 'string' ||
    typeof value.teamName !== 'string' ||
    typeof value.buzzedAt !== 'number' ||
    !Number.isFinite(value.buzzedAt)
  ) {
    return null;
  }

  return {
    teamId: value.teamId,
    teamName: value.teamName,
    teamIcon: typeof value.teamIcon === 'string' ? value.teamIcon : undefined,
    teamColor:
      typeof value.teamColor === 'string' ? value.teamColor : undefined,
    buzzedAt: value.buzzedAt,
  };
}

function normalizeBuzzerState(value: unknown): BuzzerState {
  if (!isRecord(value)) {
    return {
      isEnabled: false,
      winner: null,
    };
  }

  return {
    isEnabled: typeof value.isEnabled === 'boolean' ? value.isEnabled : false,
    winner: normalizeBuzzerWinner(value.winner),
  };
}

function normalizePresentationView(value: unknown): PresentationView {
  switch (value) {
    case 'question':
    case 'answer':
    case 'scores':
    case 'top3':
    case 'final':
    case 'gaming':
    case 'musik':
    case 'allgemeinwissen':
    case 'filme-serien':
    case 'vodafone-schaetzfragen':
      return value;
    default:
      return 'board';
  }
}

function normalizeSubquizView(
  value: unknown,
  fallbackQuestionCategoryId?: string,
  fallbackPresentationView?: unknown,
) {
  if (typeof value === 'string' && isSubquizView(value)) {
    return value;
  }

  if (
    typeof fallbackQuestionCategoryId === 'string' &&
    isSubquizView(fallbackQuestionCategoryId)
  ) {
    return fallbackQuestionCategoryId;
  }

  if (
    typeof fallbackPresentationView === 'string' &&
    isSubquizView(fallbackPresentationView)
  ) {
    return fallbackPresentationView;
  }

  return null;
}

function normalizeGameStatus(value: unknown): QuizState['gameStatus'] {
  switch (value) {
    case 'running':
    case 'paused':
    case 'finished':
      return value;
    default:
      return 'idle';
  }
}

export function normalizeQuizState(value: unknown): QuizState {
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

  const selectedQuestion = normalizeSelectedQuestion(value.selectedQuestion);

  return {
    teams: teams.length > 0 ? teams : fallback.teams,
    answered,
    selectedQuestion,
    presentationView: normalizePresentationView(value.presentationView),
    activeSubquiz: normalizeSubquizView(
      value.activeSubquiz,
      selectedQuestion?.categoryId,
      value.presentationView,
    ),
    gameStatus: normalizeGameStatus(value.gameStatus),
    showScores: typeof value.showScores === 'boolean' ? value.showScores : true,
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
    isBuzzerSignupOverlayVisible:
      typeof value.isBuzzerSignupOverlayVisible === 'boolean'
        ? value.isBuzzerSignupOverlayVisible
        : true,
    buzzer: normalizeBuzzerState(value.buzzer),
    gameEvents,
    updatedAt:
      typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt)
        ? value.updatedAt
        : fallback.updatedAt,
  };
}

export function isQuizStatePayload(
  value: unknown,
): value is Record<keyof QuizState, unknown> {
  return (
    isRecord(value) &&
    Array.isArray(value.teams) &&
    isRecord(value.answered) &&
    Array.isArray(value.gameEvents) &&
    isRecord(value.buzzer) &&
    'presentationView' in value &&
    'gameStatus' in value &&
    typeof value.updatedAt === 'number'
  );
}

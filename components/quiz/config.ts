import quizData from '@/data/quiz-questions.json';

export const quizMeta = {
  title: 'IOA GigaQuiz 2026',
  subtitle: 'Giga oder gar nicht!',
} as const;

export type AdminSection =
  | 'start'
  | 'teams'
  | 'questions'
  | 'moderator'
  | 'scores'
  | 'final';

export type PresentationView =
  | 'board'
  | 'question'
  | 'answer'
  | 'scores'
  | 'top3'
  | 'final';

export type GameStatus = 'idle' | 'running' | 'paused' | 'finished';

export type QuestionType =
  | 'freitext'
  | 'multiple-choice'
  | 'bildfrage'
  | 'musikfrage'
  | 'schaetzfrage';

export type MediaKind = 'image' | 'audio' | 'video';

export type MusicQuestionConfig = {
  songTitle: string;
  artist: string;
  clipLengths: number[];
  bonusPrompts?: string[];
};

export type QuizQuestion = {
  id: string;
  points: number;
  questionText: string;
  answerText: string;
  type: QuestionType;
  mediaUrl?: string;
  mediaKind?: MediaKind;
  options?: string[];
  music?: MusicQuestionConfig;
};

export type Category = {
  id: string;
  name: string;
  order: number;
  eyebrow: string;
  blurb: string;
  tint: string;
  questions: QuizQuestion[];
};

export type Team = {
  id: string;
  name: string;
  score: number;
  color?: string;
  icon?: string;
  members?: string[];
};

export type SelectedQuestion = {
  categoryId: string;
  categoryName: string;
  categoryTint: string;
  categoryOrder: number;
  questionId: string;
  questionText: string;
  answerText: string;
  points: number;
  type: QuestionType;
  mediaUrl?: string;
  mediaKind?: MediaKind;
  options?: string[];
  music?: MusicQuestionConfig;
};

export type GameEvent = {
  id: string;
  timestamp: number;
  label: string;
  teamId?: string;
  teamName?: string;
  questionId?: string;
  questionText?: string;
  categoryName?: string;
  pointsChanged: number;
  note: string;
};

export type QuizState = {
  teams: Team[];
  answered: Record<string, boolean>;
  selectedQuestion: SelectedQuestion | null;
  presentationView: PresentationView;
  gameStatus: GameStatus;
  showScores: boolean;
  answersRevealed: boolean;
  finalModeActive: boolean;
  finalTeams: string[];
  finalWinnerId: string | null;
  gameEvents: GameEvent[];
  updatedAt: number;
};

type RawTint =
  | 'olive'
  | 'sage'
  | 'salmon'
  | 'peach'
  | 'lime'
  | 'sky'
  | 'steel'
  | 'periwinkle';

type RawQuizQuestion = {
  id: string;
  points: number;
  questionText: string;
  answerText: string;
  type: QuestionType;
  mediaUrl?: string;
  mediaKind?: MediaKind;
  options?: string[];
  music?: MusicQuestionConfig;
};

type RawCategory = {
  id: string;
  name: string;
  order: number;
  eyebrow: string;
  blurb: string;
  tint: RawTint;
  questions: RawQuizQuestion[];
};

type RawQuizData = {
  categories: RawCategory[];
};

const tintMap: Record<RawTint, string> = {
  olive: 'var(--color-tint-olive)',
  sage: 'var(--color-tint-sage)',
  salmon: 'var(--color-tint-salmon)',
  peach: 'var(--color-tint-peach)',
  lime: 'var(--color-tint-lime)',
  sky: 'var(--color-tint-sky)',
  steel: 'var(--color-tint-steel)',
  periwinkle: 'var(--color-tint-periwinkle)',
};

const rawQuizData = quizData as RawQuizData;

export const categories: Category[] = rawQuizData.categories
  .map((category) => ({
    id: category.id,
    name: category.name,
    order: category.order,
    eyebrow: category.eyebrow,
    blurb: category.blurb,
    tint: tintMap[category.tint],
    questions: category.questions.map((question) => ({
      id: question.id,
      points: question.points,
      questionText: question.questionText,
      answerText: question.answerText,
      type: question.type,
      mediaUrl: question.mediaUrl,
      mediaKind: question.mediaKind,
      options: question.options,
      music: question.music,
    })),
  }))
  .sort((a, b) => a.order - b.order);

export const initialTeams: Team[] = [
  {
    id: 'team1',
    name: 'Team Giga',
    score: 0,
    color: '#e91d2a',
    icon: 'G',
    members: [],
  },
  {
    id: 'team2',
    name: 'Quizards',
    score: 0,
    color: '#8c9ae0',
    icon: 'Q',
    members: [],
  },
  {
    id: 'team3',
    name: 'Packet Loss',
    score: 0,
    color: '#9ab6c8',
    icon: 'P',
    members: [],
  },
  {
    id: 'team4',
    name: 'GigaBrains',
    score: 0,
    color: '#c0d4a7',
    icon: 'B',
    members: [],
  },
];

export function getQuestionKey(categoryId: string, questionId: string) {
  return `${categoryId}-${questionId}`;
}

export function getTotalQuestionCount() {
  return categories.reduce(
    (total, category) => total + category.questions.length,
    0,
  );
}

export function getDefaultTeam(index: number): Team {
  return {
    id: `team-${Date.now()}-${index}`,
    name: `Team ${index + 1}`,
    score: 0,
    color: '#d77a7a',
    icon: 'T',
    members: [],
  };
}

export function createSelectedQuestion(
  category: Category,
  question: QuizQuestion,
): SelectedQuestion {
  return {
    categoryId: category.id,
    categoryName: category.name,
    categoryTint: category.tint,
    categoryOrder: category.order,
    questionId: question.id,
    questionText: question.questionText,
    answerText: question.answerText,
    points: question.points,
    type: question.type,
    mediaUrl: question.mediaUrl,
    mediaKind: question.mediaKind,
    options: question.options,
    music: question.music,
  };
}

export function createDefaultQuizState(): QuizState {
  return {
    teams: initialTeams.map((team) => ({
      ...team,
      members: [...(team.members ?? [])],
    })),
    answered: {},
    selectedQuestion: null,
    presentationView: 'board',
    gameStatus: 'idle',
    showScores: true,
    answersRevealed: false,
    finalModeActive: false,
    finalTeams: [],
    finalWinnerId: null,
    gameEvents: [],
    updatedAt: Date.now(),
  };
}

export function sortRanking(teams: Team[]) {
  return [...teams].sort((a, b) => b.score - a.score);
}

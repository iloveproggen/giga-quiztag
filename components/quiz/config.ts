import quizData from '@/data/quiz-questions.json';
import { getSubquizQuestionCount } from '@/components/quiz/presentation/subquiz-content';

export const quizMeta = {
  title: 'IOA GigaQuiz 2026',
  subtitle: 'Giga oder gar nicht!',
} as const;

export type AdminSection =
  | 'dashboard'
  | 'teams'
  | 'quizzes'
  | 'history'
  | 'scores'
  | 'final';

export type PresentationView =
  | 'board'
  | 'question'
  | 'answer'
  | 'scores'
  | 'top3'
  | 'final'
  | 'gaming'
  | 'musik'
  | 'allgemeinwissen'
  | 'filme-serien'
  | 'vodafone-schaetzfragen';

export type SubquizView =
  | 'gaming'
  | 'musik'
  | 'allgemeinwissen'
  | 'filme-serien'
  | 'vodafone-schaetzfragen';

export const defaultSubquizView: SubquizView = 'gaming';

export function isSubquizView(value: string): value is SubquizView {
  switch (value) {
    case 'gaming':
    case 'musik':
    case 'allgemeinwissen':
    case 'filme-serien':
    case 'vodafone-schaetzfragen':
      return true;
    default:
      return false;
  }
}

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
  category: string;
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
  sourceQuestionId: string;
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

export type BuzzerWinner = {
  teamId: string;
  teamName: string;
  teamIcon?: string;
  teamColor?: string;
  buzzedAt: number;
};

export type BuzzerState = {
  isEnabled: boolean;
  winner: BuzzerWinner | null;
};

export type QuizState = {
  teams: Team[];
  answered: Record<string, boolean>;
  selectedQuestion: SelectedQuestion | null;
  presentationView: PresentationView;
  activeSubquiz: SubquizView | null;
  gameStatus: GameStatus;
  showScores: boolean;
  answersRevealed: boolean;
  finalModeActive: boolean;
  finalTeams: string[];
  finalWinnerId: string | null;
  isBuzzerSignupOverlayVisible: boolean;
  buzzer: BuzzerState;
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
  category?: string;
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
  olive: '#fef3c7',
  sage: '#dcfce7',
  salmon: '#fee2e2',
  peach: '#ffedd5',
  lime: '#ecfccb',
  sky: '#e0f2fe',
  steel: '#e5e7eb',
  periwinkle: '#eef2ff',
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
      category: question.category ?? category.name,
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

export const initialTeams: Team[] = [];

export function getQuestionKey(categoryId: string, questionId: string) {
  return `${categoryId}-${questionId}`;
}

export function getTotalQuestionCount() {
  return getSubquizQuestionCount();
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
    categoryName: question.category,
    categoryTint: category.tint,
    categoryOrder: category.order,
    questionId: question.id,
    sourceQuestionId: question.id,
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
    activeSubquiz: null,
    gameStatus: 'idle',
    showScores: true,
    answersRevealed: false,
    finalModeActive: false,
    finalTeams: [],
    finalWinnerId: null,
    isBuzzerSignupOverlayVisible: true,
    buzzer: {
      isEnabled: false,
      winner: null,
    },
    gameEvents: [],
    updatedAt: Date.now(),
  };
}

export function sortRanking(teams: Team[]) {
  return [...teams].sort((a, b) => b.score - a.score);
}

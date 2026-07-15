import type {
  AdminSection,
  GameStatus,
  MusicQuestionConfig,
  PresentationView,
  QuestionType,
  SelectedQuestion,
  SubquizView,
  Team,
} from '@/components/quiz/config';
import { formatPresentationViewLabel } from '@/components/quiz/presentation/presentation-utils';

export type TeamDraft = {
  name: string;
  color: string;
  icon: string;
  members: string;
};

export function buildTeamDraft(team: Team): TeamDraft {
  return {
    name: team.name,
    color: team.color ?? '#d77a7a',
    icon: team.icon ?? 'T',
    members: (team.members ?? []).join(', '),
  };
}

export function getStatusTone(
  status: string,
): 'neutral' | 'success' | 'warning' | 'danger' | 'dark' {
  switch (status) {
    case 'running':
      return 'success';
    case 'paused':
      return 'warning';
    case 'finished':
      return 'dark';
    default:
      return 'neutral';
  }
}

const subquizTintMap: Record<
  'gaming' | 'musik' | 'allgemeinwissen' | 'filme-serien' | 'vodafone-schaetzfragen',
  string
> = {
  gaming: '#ffedd5',
  musik: '#fee2e2',
  allgemeinwissen: '#dcfce7',
  'filme-serien': '#ecfccb',
  'vodafone-schaetzfragen': '#e0f2fe',
};

export function createLiveSelectedQuestion({
  moduleId,
  categoryName,
  questionId,
  sourceQuestionId,
  questionText,
  answerText,
  points,
  type,
  options,
  music,
}: {
  moduleId: 'gaming' | 'musik' | 'allgemeinwissen' | 'filme-serien' | 'vodafone-schaetzfragen';
  categoryName: string;
  questionId: string;
  sourceQuestionId?: string;
  questionText: string;
  answerText: string;
  points: number;
  type: QuestionType;
  options?: string[];
  music?: MusicQuestionConfig;
}): SelectedQuestion {
  return {
    categoryId: moduleId,
    categoryName,
    categoryTint: subquizTintMap[moduleId],
    categoryOrder: 0,
    questionId,
    sourceQuestionId: sourceQuestionId ?? questionId,
    questionText,
    answerText,
    points,
    type,
    options,
    music,
  };
}

export function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(timestamp);
}

export type SetAdminSection = (section: AdminSection) => void;

export function getAdminSectionStatus(
  section: AdminSection,
  context?: {
    gameStatus: GameStatus;
    activeSubquiz: SubquizView | null;
    activeQuestion: SelectedQuestion | null;
    presentationView: PresentationView;
  },
): {
  label: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'dark';
} {
  if (context && section === 'quizzes') {
    if (context.activeQuestion) {
      return {
        label: `Live: ${context.activeQuestion.categoryName}`,
        tone: getStatusTone(context.gameStatus),
      };
    }

    if (context.activeSubquiz) {
      return {
        label: `${formatPresentationViewLabel(context.activeSubquiz)} aktiv`,
        tone: getStatusTone(context.gameStatus),
      };
    }

    return {
      label: 'Unterquiz waehlen',
      tone: 'neutral',
    };
  }

  if (context && section === 'scores') {
    return {
      label:
        context.presentationView === 'top3'
          ? 'Top 3 live'
          : 'Punktestand',
      tone: getStatusTone(context.gameStatus),
    };
  }

  switch (section) {
    case 'teams':
      return { label: 'in preparation', tone: 'neutral' };
    case 'quizzes':
    case 'final':
      return { label: 'ongoing', tone: 'success' };
    case 'history':
    case 'scores':
    case 'dashboard':
    default:
      return { label: 'paused', tone: 'warning' };
  }
}

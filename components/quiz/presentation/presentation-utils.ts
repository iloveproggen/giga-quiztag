import type {
  GameStatus,
  PresentationView,
  QuestionType,
} from '@/components/quiz/config';

export function renderScoreValue(showScores: boolean, score: number) {
  return showScores ? score : '???';
}

export function getStatusTone(
  status: GameStatus,
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

export function formatQuestionTypeLabel(type: QuestionType) {
  switch (type) {
    case 'multiple-choice':
      return 'Multiple Choice';
    case 'bildfrage':
      return 'Bildfrage';
    case 'musikfrage':
      return 'Musikfrage';
    case 'schaetzfrage':
      return 'Schaetzfrage';
    default:
      return 'Freitext';
  }
}

export function formatPresentationViewLabel(view: PresentationView) {
  switch (view) {
    case 'board':
      return 'Quizmodule';
    case 'question':
      return 'Frage';
    case 'answer':
      return 'Antwort';
    case 'scores':
      return 'Punktestand';
    case 'top3':
      return 'Top 3';
    case 'final':
      return 'Finale';
    case 'gaming':
      return 'Gaming';
    case 'musik':
      return 'Musik';
    case 'allgemeinwissen':
      return 'Allgemeinwissen';
    case 'filme-serien':
      return 'Filme & Serien';
    case 'vodafone-schaetzfragen':
      return 'Vodafone Schaetzfragen';
    default:
      return view;
  }
}

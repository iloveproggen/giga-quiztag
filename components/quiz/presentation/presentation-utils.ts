import type {
  GameStatus,
  PresentationView,
  QuestionType,
  SubquizView,
} from '@/components/quiz/config';

type SubquizPalette = {
  accent: string;
  sectionBackground: string;
  sectionBorder: string;
  headerBackground: string;
  headerBorder: string;
  cardBackground: string;
  cardBorder: string;
  answeredBackground: string;
  answeredBorder: string;
  ghostBackground: string;
};

const subquizAccentMap: Record<SubquizView, string> = {
  'vodafone-schaetzfragen': '#EF476F',
  musik: '#FFD166',
  allgemeinwissen: '#06D6A0',
  gaming: '#118AB2',
  'filme-serien': '#54428E',
};

function toRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

function withAlpha(hex: string, alpha: number) {
  return `rgba(${toRgb(hex)}, ${alpha})`;
}

function darken(hex: string, factor: number) {
  const normalized = hex.replace('#', '');
  const r = Math.max(
    0,
    Math.min(255, Math.round(Number.parseInt(normalized.slice(0, 2), 16) * factor)),
  );
  const g = Math.max(
    0,
    Math.min(255, Math.round(Number.parseInt(normalized.slice(2, 4), 16) * factor)),
  );
  const b = Math.max(
    0,
    Math.min(255, Math.round(Number.parseInt(normalized.slice(4, 6), 16) * factor)),
  );

  const toHex = (value: number) => value.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getSubquizPalette(subquiz: SubquizView): SubquizPalette {
  const accent = subquizAccentMap[subquiz];
  const darkBase = darken(accent, 0.42);

  return {
    accent,
    sectionBackground: darkBase,
    sectionBorder: withAlpha(accent, 0.78),
    headerBackground: withAlpha(accent, 0.32),
    headerBorder: withAlpha(accent, 0.58),
    cardBackground: withAlpha(accent, 0.28),
    cardBorder: withAlpha(accent, 0.56),
    answeredBackground: withAlpha(accent, 0.5),
    answeredBorder: accent,
    ghostBackground: withAlpha(accent, 0.2),
  };
}

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

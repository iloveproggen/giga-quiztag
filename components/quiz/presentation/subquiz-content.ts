export const subquizModules = [
  {
    id: 'gaming',
    title: 'Gaming',
    description: 'Fragen mit vier Antwortmoeglichkeiten und schnellem Multiple-Choice-Fokus.',
    detail: '4 Antwortoptionen',
  },
  {
    id: 'musik',
    title: 'Musik',
    description: 'Fuenf Jahrzehnte mit je sechs Tracks und drei Clip-Laengen pro Song.',
    detail: '3 / 7 / 15 Sekunden',
  },
  {
    id: 'allgemeinwissen',
    title: 'Allgemeinwissen',
    description: 'Personen, Kunstwerke und Sehenswuerdigkeiten mit Reveal-Varianten.',
    detail: 'Pixel / Zoom',
  },
  {
    id: 'filme-serien',
    title: 'Filme & Serien',
    description: 'Jeopardy-Board mit neun Kategorien und je drei Fragen.',
    detail: '9 x 3 Board',
  },
  {
    id: 'vodafone-schaetzfragen',
    title: 'Vodafone Schaetzfragen',
    description: 'Vodafone-zentrierte Schaetzfragen fuer den grossen Zahlenwurf.',
    detail: 'Estimate Mode',
  },
] as const;

export const gamingQuestions = [
  {
    id: 'gaming-1',
    category: 'Konsolen',
    title: 'Platzhalterfrage Gaming 1',
    prompt: 'Platzhalterprompt Gaming 1',
    options: ['Platzhalter A', 'Platzhalter B', 'Platzhalter C', 'Platzhalter D'],
    answer: 'Platzhalter A',
  },
  {
    id: 'gaming-2',
    category: 'Franchises',
    title: 'Platzhalterfrage Gaming 2',
    prompt: 'Platzhalterprompt Gaming 2',
    options: ['Platzhalter A', 'Platzhalter B', 'Platzhalter C', 'Platzhalter D'],
    answer: 'Platzhalter B',
  },
  {
    id: 'gaming-3',
    category: 'Releases',
    title: 'Platzhalterfrage Gaming 3',
    prompt: 'Platzhalterprompt Gaming 3',
    options: ['Platzhalter A', 'Platzhalter B', 'Platzhalter C', 'Platzhalter D'],
    answer: 'Platzhalter C',
  },
  {
    id: 'gaming-4',
    category: 'Esports',
    title: 'Platzhalterfrage Gaming 4',
    prompt: 'Platzhalterprompt Gaming 4',
    options: ['Platzhalter A', 'Platzhalter B', 'Platzhalter C', 'Platzhalter D'],
    answer: 'Platzhalter D',
  },
  {
    id: 'gaming-5',
    category: 'Soundtracks',
    title: 'Platzhalterfrage Gaming 5',
    prompt: 'Platzhalterprompt Gaming 5',
    options: ['Platzhalter A', 'Platzhalter B', 'Platzhalter C', 'Platzhalter D'],
    answer: 'Platzhalter A',
  },
  {
    id: 'gaming-6',
    category: 'Retro',
    title: 'Platzhalterfrage Gaming 6',
    prompt: 'Platzhalterprompt Gaming 6',
    options: ['Platzhalter A', 'Platzhalter B', 'Platzhalter C', 'Platzhalter D'],
    answer: 'Platzhalter B',
  },
  {
    id: 'gaming-7',
    category: 'Mechaniken',
    title: 'Platzhalterfrage Gaming 7',
    prompt: 'Platzhalterprompt Gaming 7',
    options: ['Platzhalter A', 'Platzhalter B', 'Platzhalter C', 'Platzhalter D'],
    answer: 'Platzhalter C',
  },
  {
    id: 'gaming-8',
    category: 'Studios',
    title: 'Platzhalterfrage Gaming 8',
    prompt: 'Platzhalterprompt Gaming 8',
    options: ['Platzhalter A', 'Platzhalter B', 'Platzhalter C', 'Platzhalter D'],
    answer: 'Platzhalter D',
  },
] as const;

const musicDecadeLabels = ['80er', '90er', '2000er', '2010er', '2020er'] as const;

export const musicDecades = musicDecadeLabels.map((label) => ({
  id: label.toLowerCase(),
  label,
  questions: Array.from({ length: 6 }, (_, index) => ({
    id: `${label}-${index + 1}`,
    category: label,
    slot: index + 1,
    songTitle: `Platzhalter Song ${index + 1}`,
    artist: `Platzhalter Interpret ${index + 1}`,
    hint: `Platzhalterhinweis ${label} ${index + 1}`,
    clipOptions: [
      { seconds: 3, points: 300 },
      { seconds: 7, points: 200 },
      { seconds: 15, points: 100 },
    ],
  })),
})) as Array<{
  id: string;
  label: string;
  questions: Array<{
    id: string;
    category: string;
    slot: number;
    songTitle: string;
    artist: string;
    hint: string;
    clipOptions: Array<{ seconds: number; points: number }>;
  }>;
}>;

export const generalKnowledgeSections = [
  {
    id: 'personen',
    title: 'Personen',
    description: 'Verpixelt fuer 300 Punkte oder unverpixelt fuer 100 Punkte.',
    revealModes: [
      { id: 'pixel', label: 'Verpixelt', points: 300 },
      { id: 'full', label: 'Unverpixelt', points: 100 },
    ],
    items: Array.from({ length: 6 }, (_, index) => ({
      id: `person-${index + 1}`,
      category: 'Personen',
      label: `Platzhalter Person ${index + 1}`,
      prompt: `Platzhalterfrage Person ${index + 1}`,
      answer: `Platzhalterantwort Person ${index + 1}`,
    })),
  },
  {
    id: 'kunstwerke',
    title: 'Kunstwerke',
    description: 'Eingezoomt fuer 300 Punkte oder in der Gesamtansicht fuer 100 Punkte.',
    revealModes: [
      { id: 'zoom', label: 'Eingezoomt', points: 300 },
      { id: 'full', label: 'Gesamtansicht', points: 100 },
    ],
    items: Array.from({ length: 6 }, (_, index) => ({
      id: `art-${index + 1}`,
      category: 'Kunstwerke',
      label: `Platzhalter Kunstwerk ${index + 1}`,
      prompt: `Platzhalterfrage Kunstwerk ${index + 1}`,
      answer: `Platzhalterantwort Kunstwerk ${index + 1}`,
    })),
  },
  {
    id: 'sehenswuerdigkeiten',
    title: 'Sehenswuerdigkeiten',
    description: 'Eingezoomt fuer 300 Punkte oder komplett gezeigt fuer 100 Punkte.',
    revealModes: [
      { id: 'zoom', label: 'Eingezoomt', points: 300 },
      { id: 'full', label: 'Gesamtansicht', points: 100 },
    ],
    items: Array.from({ length: 6 }, (_, index) => ({
      id: `place-${index + 1}`,
      category: 'Sehenswuerdigkeiten',
      label: `Platzhalter Ort ${index + 1}`,
      prompt: `Platzhalterfrage Sehenswuerdigkeit ${index + 1}`,
      answer: `Platzhalterantwort Sehenswuerdigkeit ${index + 1}`,
    })),
  },
] as const;

const movieCategoryLabels = [
  'Sci-Fi',
  'Sitcoms',
  'Fantasy',
  'Krimi',
  'Animation',
  'Superhelden',
  'Kultfilme',
  'Streaming',
  'Deutsche Serien',
] as const;

export const movieJeopardyCategories = movieCategoryLabels.map((label) => ({
  id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  label,
  questions: [100, 200, 300].map((points, index) => ({
    id: `${label}-${points}`,
    category: label,
    points,
    prompt: `Platzhalterfrage ${label} ${index + 1}`,
    answer: `Platzhalterantwort ${label} ${points}`,
  })),
})) as Array<{
  id: string;
  label: string;
  questions: Array<{
    id: string;
    category: string;
    points: number;
    prompt: string;
    answer: string;
  }>;
}>;

export const vodafoneEstimateQuestions = [
  {
    id: 'vf-1',
    category: 'Mobilfunk',
    title: 'Platzhalter Schaetzfrage 1',
    points: 100,
    prompt: 'Platzhalterprompt Schaetzfrage 1',
    answer: 'Platzhalterantwort Schaetzfrage 1',
  },
  {
    id: 'vf-2',
    category: 'Netz',
    title: 'Platzhalter Schaetzfrage 2',
    points: 200,
    prompt: 'Platzhalterprompt Schaetzfrage 2',
    answer: 'Platzhalterantwort Schaetzfrage 2',
  },
  {
    id: 'vf-3',
    category: 'Tarife',
    title: 'Platzhalter Schaetzfrage 3',
    points: 300,
    prompt: 'Platzhalterprompt Schaetzfrage 3',
    answer: 'Platzhalterantwort Schaetzfrage 3',
  },
  {
    id: 'vf-4',
    category: 'Infrastruktur',
    title: 'Platzhalter Schaetzfrage 4',
    points: 400,
    prompt: 'Platzhalterprompt Schaetzfrage 4',
    answer: 'Platzhalterantwort Schaetzfrage 4',
  },
  {
    id: 'vf-5',
    category: 'Kund:innen',
    title: 'Platzhalter Schaetzfrage 5',
    points: 500,
    prompt: 'Platzhalterprompt Schaetzfrage 5',
    answer: 'Platzhalterantwort Schaetzfrage 5',
  },
] as const;

export function getSubquizQuestionCount() {
  return (
    gamingQuestions.length +
    musicDecades.reduce((total, decade) => total + decade.questions.length, 0) +
    generalKnowledgeSections.reduce(
      (total, section) => total + section.items.length,
      0,
    ) +
    movieJeopardyCategories.reduce(
      (total, category) => total + category.questions.length,
      0,
    ) +
    vodafoneEstimateQuestions.length
  );
}

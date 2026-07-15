'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  categories,
  createSelectedQuestion,
  getQuestionKey,
  quizMeta,
  type AdminSection,
  type QuizQuestion,
  type Team,
} from '@/components/quiz/config';
import {
  FrameButton,
  HydrationPlaceholder,
  MetricCard,
  SectionCard,
  StatusPill,
  TeamAvatar,
} from '@/components/quiz/ui';
import { useQuizStore } from '@/components/quiz/use-quiz-store';

type TeamDraft = {
  name: string;
  color: string;
  icon: string;
  members: string;
};

const adminSections: Array<{ id: AdminSection; label: string }> = [
  { id: 'start', label: 'Dashboard' },
  { id: 'teams', label: 'Teams' },
  { id: 'questions', label: 'Fragen' },
  { id: 'moderator', label: 'Moderation' },
  { id: 'scores', label: 'Punkte' },
  { id: 'final', label: 'Finale' },
];

function buildTeamDraft(team: Team): TeamDraft {
  return {
    name: team.name,
    color: team.color ?? '#d77a7a',
    icon: team.icon ?? 'T',
    members: (team.members ?? []).join(', '),
  };
}

function formatQuestionType(type: QuizQuestion['type']) {
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

function formatTimestamp(timestamp: number) {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(timestamp);
}

function downloadExport(payload: unknown) {
  if (typeof window === 'undefined') {
    return;
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ioa-gigaquiz-export-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function getFirstQuestionKey() {
  const firstCategory = categories[0];
  const firstQuestion = firstCategory?.questions[0];

  if (!firstCategory || !firstQuestion) {
    return '';
  }

  return getQuestionKey(firstCategory.id, firstQuestion.id);
}

function getSelectedCatalogQuestion(selectedQuestionKey: string) {
  for (const category of categories) {
    for (const question of category.questions) {
      if (getQuestionKey(category.id, question.id) === selectedQuestionKey) {
        return { category, question };
      }
    }
  }

  const fallbackCategory = categories[0];
  const fallbackQuestion = fallbackCategory?.questions[0];

  return fallbackCategory && fallbackQuestion
    ? { category: fallbackCategory, question: fallbackQuestion }
    : null;
}

function getStatusTone(
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

export function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('start');
  const [teamDrafts, setTeamDrafts] = useState<Record<string, TeamDraft>>({});
  const [selectedQuestionKey, setSelectedQuestionKey] = useState(getFirstQuestionKey);
  const {
    state,
    ranking,
    answeredCount,
    remainingQuestions,
    isHydrated,
    actions,
  } = useQuizStore();

  const activeQuestion = state.selectedQuestion;
  const leader = ranking[0];
  const selectedCatalogQuestion = getSelectedCatalogQuestion(selectedQuestionKey);
  const finalTeams = state.teams.filter((team) => state.finalTeams.includes(team.id));
  const finalWinner =
    state.teams.find((team) => team.id === state.finalWinnerId) ?? null;
  const totalQuestions = answeredCount + remainingQuestions;

  if (!isHydrated) {
    return (
      <HydrationPlaceholder
        title="Quiz wird geladen"
        message="Die Admin-Oberflaeche verbindet sich gerade mit dem gemeinsamen Quiz-Zustand."
      />
    );
  }

  function updateDraft(team: Team, updates: Partial<TeamDraft>) {
    setTeamDrafts((current) => ({
      ...current,
      [team.id]: {
        ...(current[team.id] ?? buildTeamDraft(team)),
        ...updates,
      },
    }));
  }

  function saveTeam(team: Team) {
    const draft = teamDrafts[team.id] ?? buildTeamDraft(team);
    actions.updateTeam(team.id, {
      name: draft.name.trim() || team.name,
      color: draft.color.trim() || team.color,
      icon: draft.icon.trim() || team.icon,
      members: draft.members
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
    });
  }

  function handleExport() {
    downloadExport({
      exportedAt: new Date().toISOString(),
      quizMeta,
      state,
      ranking,
      categories,
    });
  }

  function renderStartSection() {
    return (
      <div className="space-y-6">
        <section className="ui-panel grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div className="space-y-5">
            <div className="space-y-3">
              <StatusPill tone="dark">Quizverwaltung</StatusPill>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                  {quizMeta.title}
                </h1>
                <p className="mt-3 text-lg font-medium text-slate-600 md:text-xl">
                  {quizMeta.subtitle}
                </p>
              </div>
              <p className="max-w-3xl text-base leading-7 text-slate-600">
                Komplett neu aufgebautes Admin-Frontend fuer Steuerung,
                Teamverwaltung, Fragenauswahl und Live-Betrieb im selben Flow.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusPill tone={getStatusTone(state.gameStatus)}>
                Status {state.gameStatus}
              </StatusPill>
              <StatusPill>Ansicht {state.presentationView}</StatusPill>
              <StatusPill>{state.teams.length} Teams aktiv</StatusPill>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <FrameButton
                size="large"
                className="h-auto min-h-[132px] flex-col items-start justify-between rounded-3xl px-5 py-5 text-left normal-case"
                onClick={() => {
                  actions.startNewGame();
                  setActiveSection('moderator');
                }}
              >
                <span className="text-base font-semibold text-white">
                  Neues Spiel starten
                </span>
                <span className="text-sm leading-6 text-slate-200">
                  Reset, Start und direkt weiter in die Moderation.
                </span>
              </FrameButton>

              <FrameButton
                variant="secondary"
                size="large"
                className="h-auto min-h-[132px] flex-col items-start justify-between rounded-3xl px-5 py-5 text-left normal-case"
                onClick={() => {
                  actions.resumeGame();
                  setActiveSection('moderator');
                }}
              >
                <span className="text-base font-semibold">Spiel fortsetzen</span>
                <span className="text-sm leading-6 text-slate-600">
                  Nutzt den aktuellen Stand und springt in die Steuerung.
                </span>
              </FrameButton>

              <FrameButton
                variant="secondary"
                size="large"
                className="h-auto min-h-[132px] flex-col items-start justify-between rounded-3xl px-5 py-5 text-left normal-case"
                onClick={() => setActiveSection('questions')}
              >
                <span className="text-base font-semibold">Fragen vorbereiten</span>
                <span className="text-sm leading-6 text-slate-600">
                  Fragen sichten, previewen und live schalten.
                </span>
              </FrameButton>

              <FrameButton
                variant="secondary"
                size="large"
                className="h-auto min-h-[132px] flex-col items-start justify-between rounded-3xl px-5 py-5 text-left normal-case"
                onClick={() => setActiveSection('teams')}
              >
                <span className="text-base font-semibold">Teams verwalten</span>
                <span className="text-sm leading-6 text-slate-600">
                  Namen, Farben, Mitglieder und Reihenfolge pflegen.
                </span>
              </FrameButton>
            </div>
          </div>

          <div className="grid gap-4">
            <MetricCard
              label="Gespielte Fragen"
              value={answeredCount}
              helper={`${remainingQuestions} von ${totalQuestions} offen`}
            />
            <MetricCard
              label="Fuehrung"
              value={leader ? leader.name : 'Noch offen'}
              helper={
                leader && state.showScores ? `${leader.score} Punkte` : 'Kein Team vorne'
              }
            />
            <SectionCard
              title="Praesentation"
              subtitle="Die Live-Ansicht laeuft separat und wird vollstaendig von hier gesteuert."
              actions={
                <Link
                  href="/quiz"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white no-underline"
                >
                  Oeffnen
                </Link>
              }
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={getStatusTone(state.gameStatus)}>
                  {state.gameStatus}
                </StatusPill>
                <StatusPill>{state.presentationView}</StatusPill>
              </div>
            </SectionCard>
          </div>
        </section>
      </div>
    );
  }

  function renderTeamsSection() {
    return (
      <div className="space-y-6">
        <SectionCard
          title="Teams"
          subtitle="Jedes Team kann direkt bearbeitet werden. Aenderungen werden sofort im gemeinsamen Quiz-Zustand gespeichert."
          actions={
            <FrameButton onClick={actions.addTeam}>Team anlegen</FrameButton>
          }
        >
          <div className="grid gap-4 xl:grid-cols-2">
            {state.teams.map((team, index) => {
              const draft = teamDrafts[team.id] ?? buildTeamDraft(team);

              return (
                <article key={team.id} className="ui-panel rounded-3xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <TeamAvatar
                        color={draft.color}
                        label={draft.icon || team.name.charAt(0)}
                      />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                          Team {index + 1}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-950">
                          {team.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Punkte
                      </p>
                      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                        {team.score}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Teamname
                      </span>
                      <input
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                        value={draft.name}
                        onChange={(event) =>
                          updateDraft(team, { name: event.target.value })
                        }
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Team-Icon
                      </span>
                      <input
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                        value={draft.icon}
                        onChange={(event) =>
                          updateDraft(team, { icon: event.target.value })
                        }
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Farbe
                      </span>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          className="h-12 w-14 rounded-2xl border border-slate-300 bg-white p-1"
                          value={draft.color}
                          onChange={(event) =>
                            updateDraft(team, { color: event.target.value })
                          }
                        />
                        <input
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                          value={draft.color}
                          onChange={(event) =>
                            updateDraft(team, { color: event.target.value })
                          }
                        />
                      </div>
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Mitglieder
                      </span>
                      <input
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                        value={draft.members}
                        placeholder="Anna, Ben, Chris"
                        onChange={(event) =>
                          updateDraft(team, { members: event.target.value })
                        }
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <FrameButton onClick={() => saveTeam(team)}>
                      Speichern
                    </FrameButton>
                    <FrameButton
                      variant="secondary"
                      onClick={() => actions.deleteTeam(team.id)}
                    >
                      Team loeschen
                    </FrameButton>
                  </div>
                </article>
              );
            })}
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderQuestionsSection() {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          {categories.map((category) => (
            <SectionCard
              key={category.id}
              title={category.name}
              subtitle={category.blurb}
              sticker={category.eyebrow}
              bodyStyle={{ backgroundColor: category.tint }}
            >
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {category.questions.map((question) => {
                  const questionKey = getQuestionKey(category.id, question.id);
                  const isAnswered = state.answered[questionKey];
                  const isFocused = selectedQuestionKey === questionKey;

                  return (
                    <FrameButton
                      key={question.id}
                      variant={isFocused ? 'secondary' : 'primary'}
                      active={isFocused}
                      className="flex min-h-[104px] flex-col items-start justify-between rounded-3xl px-4 py-4 text-left normal-case"
                      onClick={() => setSelectedQuestionKey(questionKey)}
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.08em]">
                        {question.points} Punkte
                      </span>
                      <span className="text-sm leading-6">
                        {question.questionText}
                      </span>
                      <span className="text-xs uppercase tracking-[0.08em] opacity-80">
                        {isAnswered ? 'Beantwortet' : 'Offen'}
                      </span>
                    </FrameButton>
                  );
                })}
              </div>
            </SectionCard>
          ))}
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          {selectedCatalogQuestion ? (
            <SectionCard
              title="Fragenvorschau"
              subtitle="Alle Inhalte der ausgewaehlten Frage auf einen Blick."
              sticker={formatQuestionType(selectedCatalogQuestion.question.type)}
              bodyStyle={{ backgroundColor: selectedCatalogQuestion.category.tint }}
            >
              <div className="space-y-4">
                <div className="ui-panel rounded-3xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Kategorie
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-950">
                    {selectedCatalogQuestion.category.name}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Punktwert
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {selectedCatalogQuestion.question.points}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Status
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {state.answered[
                          getQuestionKey(
                            selectedCatalogQuestion.category.id,
                            selectedCatalogQuestion.question.id,
                          )
                        ]
                          ? 'Beantwortet'
                          : 'Offen'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ui-panel rounded-3xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Frage
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    {selectedCatalogQuestion.question.questionText}
                  </p>
                </div>

                <div className="ui-panel rounded-3xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Antwort
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    {selectedCatalogQuestion.question.answerText}
                  </p>
                </div>

                {selectedCatalogQuestion.question.options?.length ? (
                  <div className="ui-panel rounded-3xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Antwortoptionen
                    </p>
                    <div className="mt-3 space-y-2">
                      {selectedCatalogQuestion.question.options.map((option) => (
                        <p key={option} className="text-sm text-slate-700">
                          - {option}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedCatalogQuestion.question.music ? (
                  <div className="ui-panel rounded-3xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Musikdetails
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <p>
                        Song: {selectedCatalogQuestion.question.music.songTitle}
                      </p>
                      <p>
                        Interpret: {selectedCatalogQuestion.question.music.artist}
                      </p>
                      <p>
                        Clips:{' '}
                        {selectedCatalogQuestion.question.music.clipLengths.join(', ')}{' '}
                        Sekunden
                      </p>
                      <p>
                        Bonus:{' '}
                        {selectedCatalogQuestion.question.music.bonusPrompts?.join(', ') ||
                          '-'}
                      </p>
                    </div>
                  </div>
                ) : null}

                {selectedCatalogQuestion.question.mediaUrl ? (
                  <div className="ui-panel rounded-3xl border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Medieninhalt
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      <p>
                        Typ: {selectedCatalogQuestion.question.mediaKind || 'image'}
                      </p>
                      <p className="break-all">
                        URL: {selectedCatalogQuestion.question.mediaUrl}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <FrameButton
                    onClick={() =>
                      actions.selectQuestion(
                        createSelectedQuestion(
                          selectedCatalogQuestion.category,
                          selectedCatalogQuestion.question,
                        ),
                      )
                    }
                  >
                    Frage live schalten
                  </FrameButton>
                  <FrameButton
                    variant="secondary"
                    onClick={() => {
                      actions.selectQuestion(
                        createSelectedQuestion(
                          selectedCatalogQuestion.category,
                          selectedCatalogQuestion.question,
                        ),
                      );
                      actions.revealAnswer();
                    }}
                  >
                    Direkt Antwort zeigen
                  </FrameButton>
                </div>
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>
    );
  }

  function renderModeratorSection() {
    return (
      <div className="space-y-6">
        <SectionCard
          title="Live-Steuerung"
          subtitle="Steuere den Ablauf, waehle Ansichten und springe direkt in den naechsten Schritt."
        >
          <div className="flex flex-wrap gap-2">
            <FrameButton onClick={actions.startNewGame}>Spiel starten</FrameButton>
            <FrameButton variant="secondary" onClick={actions.resumeGame}>
              Fortsetzen
            </FrameButton>
            <FrameButton variant="secondary" onClick={actions.pauseGame}>
              Pausieren
            </FrameButton>
            <FrameButton variant="secondary" onClick={actions.endGame}>
              Beenden
            </FrameButton>
            <FrameButton variant="secondary" onClick={() => actions.setPresentationView('board')}>
              Board
            </FrameButton>
            <FrameButton variant="secondary" onClick={() => actions.setPresentationView('scores')}>
              Punkte
            </FrameButton>
            <FrameButton variant="secondary" onClick={() => actions.setPresentationView('top3')}>
              Top 3
            </FrameButton>
            <FrameButton variant="secondary" onClick={() => actions.setPresentationView('final')}>
              Finale
            </FrameButton>
            <FrameButton variant="secondary" onClick={handleExport}>
              Export
            </FrameButton>
            <FrameButton variant="secondary" onClick={actions.resetGame}>
              Reset
            </FrameButton>
          </div>
        </SectionCard>

        {activeQuestion ? (
          <SectionCard
            title="Aktive Frage"
            subtitle="Vergib Punkte direkt oder wechsle zwischen Frage und Antwort."
            sticker={state.answersRevealed ? 'Antwort' : 'Live'}
            bodyStyle={{ backgroundColor: activeQuestion.categoryTint }}
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                <div className="ui-panel rounded-3xl border border-slate-200 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Kategorie
                      </p>
                      <p className="mt-1 text-base font-semibold text-slate-950">
                        {activeQuestion.categoryName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Punkte
                      </p>
                      <p className="mt-1 text-base font-semibold text-slate-950">
                        {activeQuestion.points}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Fragetext
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      {activeQuestion.questionText}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Antwort
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      {activeQuestion.answerText}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <FrameButton onClick={actions.revealAnswer}>
                    Antwort zeigen
                  </FrameButton>
                  <FrameButton
                    variant="secondary"
                    onClick={() => actions.setPresentationView('question')}
                  >
                    Nur Frage zeigen
                  </FrameButton>
                  <FrameButton variant="secondary" onClick={actions.clearQuestion}>
                    Zurueck aufs Board
                  </FrameButton>
                  <FrameButton
                    variant="secondary"
                    onClick={actions.closeQuestionWithoutPoints}
                  >
                    Ohne Punkte schliessen
                  </FrameButton>
                </div>
              </div>

              <div className="space-y-2">
                {state.teams.map((team) => (
                  <FrameButton
                    key={team.id}
                    className="w-full justify-between rounded-2xl px-4 py-4 normal-case"
                    onClick={() => actions.awardSelectedQuestion(team.id)}
                  >
                    <span className="text-sm font-semibold">{team.name}</span>
                    <span className="text-xs uppercase tracking-[0.08em]">
                      +{activeQuestion.points}
                    </span>
                  </FrameButton>
                ))}
              </div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="Aktive Frage"
            subtitle="Derzeit ist keine Frage live. Waehle im Board oder in der Fragenansicht die naechste Frage aus."
          >
            <div className="flex flex-wrap gap-2">
              <FrameButton onClick={() => setActiveSection('questions')}>
                Zur Fragenauswahl
              </FrameButton>
              <FrameButton
                variant="secondary"
                onClick={() => actions.setPresentationView('board')}
              >
                Board anzeigen
              </FrameButton>
            </div>
          </SectionCard>
        )}

        <SectionCard
          title="Board-Auswahl"
          subtitle="Hier koennen Fragen direkt live geschaltet werden, ohne in die Detailansicht zu wechseln."
        >
          <div className="space-y-5">
            {categories.map((category) => (
              <div key={category.id} className="ui-panel rounded-3xl border border-slate-200 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {category.eyebrow}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {category.name}
                    </p>
                  </div>
                  <StatusPill>{category.questions.length} Fragen</StatusPill>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {category.questions.map((question) => {
                    const questionKey = getQuestionKey(category.id, question.id);
                    const isAnswered = state.answered[questionKey];

                    return (
                      <FrameButton
                        key={question.id}
                        variant="secondary"
                        disabled={isAnswered}
                        className="flex min-h-[84px] flex-col items-start justify-between rounded-3xl px-4 py-4 text-left normal-case"
                        onClick={() =>
                          actions.selectQuestion(createSelectedQuestion(category, question))
                        }
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.08em]">
                          {question.points} Punkte
                        </span>
                        <span className="text-sm leading-6">
                          {isAnswered ? 'Bereits beantwortet' : question.questionText}
                        </span>
                      </FrameButton>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Verlauf"
          subtitle="Letzte Aktionen im Quiz, zuletzt oben."
        >
          <div className="space-y-2">
            {state.gameEvents.length === 0 ? (
              <p className="text-sm text-slate-600">Noch keine Ereignisse gespeichert.</p>
            ) : (
              [...state.gameEvents].reverse().map((event) => (
                <div
                  key={event.id}
                  className="ui-panel rounded-2xl border border-slate-200 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {event.label}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{event.note}</p>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderScoresSection() {
    return (
      <div className="space-y-6">
        <SectionCard
          title="Punktestand"
          subtitle="Live-Anzeige steuern und bei Bedarf manuelle Korrekturen ausfuehren."
        >
          <div className="flex flex-wrap gap-2">
            <FrameButton onClick={() => actions.setPresentationView('scores')}>
              Punktestand anzeigen
            </FrameButton>
            <FrameButton
              variant="secondary"
              onClick={() => actions.setPresentationView('top3')}
            >
              Top 3 anzeigen
            </FrameButton>
            <FrameButton variant="secondary" onClick={actions.toggleShowScores}>
              Punkte {state.showScores ? 'verbergen' : 'anzeigen'}
            </FrameButton>
            <FrameButton variant="secondary" onClick={actions.resetScores}>
              Punkte resetten
            </FrameButton>
            <FrameButton variant="secondary" onClick={() => setActiveSection('final')}>
              Finale vorbereiten
            </FrameButton>
          </div>

          <div className="mt-5 space-y-3">
            {ranking.map((team, index) => (
              <article
                key={team.id}
                className="ui-panel flex flex-col gap-4 rounded-3xl border border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <TeamAvatar
                      size="small"
                      color={team.color}
                      label={team.icon || team.name.charAt(0)}
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Platz {index + 1}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        {team.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <p className="min-w-[80px] text-right text-3xl font-bold tracking-tight text-slate-950">
                    {state.showScores ? team.score : '???'}
                  </p>
                  <FrameButton
                    variant="secondary"
                    size="compact"
                    onClick={() => actions.adjustTeamScore(team.id, -100)}
                  >
                    -100
                  </FrameButton>
                  <FrameButton
                    variant="secondary"
                    size="compact"
                    onClick={() => actions.adjustTeamScore(team.id, 100)}
                  >
                    +100
                  </FrameButton>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderFinalSection() {
    return (
      <div className="space-y-6">
        <SectionCard
          title="Finale / Stechen"
          subtitle="Waehle die Finalteams, schalte die Praesi auf Finale und setze den Sieger."
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2">
                {state.teams.map((team) => {
                  const isSelected = state.finalTeams.includes(team.id);

                  return (
                    <label
                      key={team.id}
                      className="ui-panel flex items-center gap-3 rounded-3xl border border-slate-200 px-4 py-3"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...state.finalTeams, team.id]
                            : state.finalTeams.filter((id) => id !== team.id);
                          actions.setFinalTeams(next);
                        }}
                      />
                      <TeamAvatar
                        size="small"
                        color={team.color}
                        label={team.icon || team.name.charAt(0)}
                      />
                      <span className="text-sm font-medium text-slate-800">
                        {team.name}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                <FrameButton onClick={() => actions.setPresentationView('final')}>
                  Finale anzeigen
                </FrameButton>
                <FrameButton variant="secondary" onClick={actions.clearFinalMode}>
                  Finale zuruecksetzen
                </FrameButton>
              </div>

              {finalTeams.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {finalTeams.map((team) => (
                    <div
                      key={team.id}
                      className="ui-panel rounded-3xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <TeamAvatar
                          color={team.color}
                          label={team.icon || team.name.charAt(0)}
                        />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                            Finalteam
                          </p>
                          <p className="mt-1 text-base font-semibold text-slate-950">
                            {team.name}
                          </p>
                        </div>
                      </div>
                      <FrameButton
                        className="mt-4 w-full"
                        onClick={() => actions.chooseFinalWinner(team.id)}
                      >
                        Als Sieger setzen
                      </FrameButton>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <MetricCard
                label="Finalteams"
                value={finalTeams.length}
                helper="Anzahl der ausgewaehlten Teams fuer das Stechen."
              />
              <MetricCard
                label="Gesetzter Sieger"
                value={finalWinner ? finalWinner.name : 'Noch keiner'}
                helper="Der Sieger wird sofort in der Praesentation angezeigt."
              />
              <SectionCard title="Ablauf">
                <ol className="space-y-2 text-sm leading-6 text-slate-700">
                  <li>1. Finalteams ankreuzen.</li>
                  <li>2. Praesentation auf Finale schalten.</li>
                  <li>3. Gewinner manuell setzen.</li>
                </ol>
              </SectionCard>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderSection() {
    switch (activeSection) {
      case 'teams':
        return renderTeamsSection();
      case 'questions':
        return renderQuestionsSection();
      case 'moderator':
        return renderModeratorSection();
      case 'scores':
        return renderScoresSection();
      case 'final':
        return renderFinalSection();
      default:
        return renderStartSection();
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="ui-shell space-y-6">
        <header className="ui-panel bg-slate-950 px-6 py-6 text-white">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
            <div className="space-y-4">
              <StatusPill tone="dark" className="border border-slate-700 bg-slate-900">
                Admin
              </StatusPill>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-300">
                  localhost:3000
                </p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
                  {quizMeta.title}
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                  {quizMeta.subtitle} - neues Frontend fuer Moderation,
                  Quizsteuerung und Live-Betrieb.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusPill tone={getStatusTone(state.gameStatus)}>
                  {state.gameStatus}
                </StatusPill>
                <StatusPill>{state.presentationView}</StatusPill>
                <StatusPill>{remainingQuestions} offen</StatusPill>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Teams
                </p>
                <p className="mt-2 text-3xl font-bold">{state.teams.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Fragen
                </p>
                <p className="mt-2 text-3xl font-bold">{answeredCount}</p>
                <p className="mt-1 text-sm text-slate-400">gespielt</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Spitze
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {leader ? leader.name : '-'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2">
          {adminSections.map((section) => (
            <FrameButton
              key={section.id}
              variant={activeSection === section.id ? 'primary' : 'secondary'}
              active={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </FrameButton>
          ))}

          <Link
            href="/quiz"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] text-slate-900 no-underline"
          >
            Praesi oeffnen
          </Link>
        </nav>

        {renderSection()}
      </div>
    </div>
  );
}

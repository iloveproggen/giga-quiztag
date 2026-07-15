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
  SectionCard,
} from '@/components/quiz/ui';
import { useQuizStore } from '@/components/quiz/use-quiz-store';

type TeamDraft = {
  name: string;
  color: string;
  icon: string;
  members: string;
};

const adminSections: Array<{ id: AdminSection; label: string }> = [
  { id: 'start', label: 'Startscreen' },
  { id: 'teams', label: 'Teams' },
  { id: 'questions', label: 'Quizfragen' },
  { id: 'moderator', label: 'Moderator' },
  { id: 'scores', label: 'Scores' },
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

export function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('start');
  const [teamDrafts, setTeamDrafts] = useState<Record<string, TeamDraft>>({});
  const [selectedQuestionKey, setSelectedQuestionKey] = useState(getFirstQuestionKey);
  const {
    state,
    ranking,
    answeredCount,
    isHydrated,
    actions,
  } = useQuizStore();

  const activeQuestion = state.selectedQuestion;
  const leader = ranking[0];
  const selectedCatalogQuestion = getSelectedCatalogQuestion(selectedQuestionKey);

  const finalTeams = state.teams.filter((team) => state.finalTeams.includes(team.id));
  const finalWinner =
    state.teams.find((team) => team.id === state.finalWinnerId) ?? null;

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
      <div className="space-y-5">
        <section
          className="dell-panel dell-shadow px-[var(--space-section)] py-[var(--space-section)]"
          style={{ backgroundColor: 'var(--color-tint-salmon)' }}
        >
          <p className="font-dell-display text-[clamp(38px,5vw,70px)] leading-none uppercase">
            {quizMeta.title}
          </p>
          <p className="font-dell-ui mt-3 text-[18px] font-bold uppercase">
            {quizMeta.subtitle}
          </p>
          <p className="font-dell-body mt-4 max-w-[760px] text-[16px] leading-[1.5]">
            Startscreen fuer Michelle als Quizmaster: neues Spiel starten,
            bestehende Runde fortsetzen oder direkt in Team- und
            Fragenverwaltung springen.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FrameButton
            size="large"
            className="dell-shadow h-auto min-h-[120px] flex-col items-start justify-between px-[var(--space-lg)] py-[var(--space-lg)] text-left normal-case"
            onClick={() => {
              actions.startNewGame();
              setActiveSection('moderator');
            }}
          >
            <span className="font-dell-ui text-[18px] font-bold uppercase">
              Neues Spiel starten
            </span>
            <span className="font-dell-body text-[14px] leading-[1.4]">
              Setzt Punkte, Verlauf und Fragenstatus zurueck und startet mit dem
              Quizboard im Praesi-Fenster.
            </span>
          </FrameButton>

          <FrameButton
            variant="secondary"
            size="large"
            className="dell-shadow h-auto min-h-[120px] flex-col items-start justify-between px-[var(--space-lg)] py-[var(--space-lg)] text-left normal-case"
            onClick={() => {
              actions.resumeGame();
              setActiveSection('moderator');
            }}
          >
            <span className="font-dell-ui text-[18px] font-bold uppercase">
              Spiel fortsetzen
            </span>
            <span className="font-dell-body text-[14px] leading-[1.4]">
              Springt direkt in die Moderatoransicht und behaelt den aktuellen
              Spielstand.
            </span>
          </FrameButton>

          <FrameButton
            variant="secondary"
            size="large"
            className="dell-shadow h-auto min-h-[120px] flex-col items-start justify-between px-[var(--space-lg)] py-[var(--space-lg)] text-left normal-case"
            onClick={() => setActiveSection('teams')}
          >
            <span className="font-dell-ui text-[18px] font-bold uppercase">
              Teams verwalten
            </span>
            <span className="font-dell-body text-[14px] leading-[1.4]">
              Namen, Farben, Icons und Mitglieder pflegen sowie Teams anlegen
              oder loeschen.
            </span>
          </FrameButton>

          <FrameButton
            variant="secondary"
            size="large"
            className="dell-shadow h-auto min-h-[120px] flex-col items-start justify-between px-[var(--space-lg)] py-[var(--space-lg)] text-left normal-case"
            onClick={() => setActiveSection('questions')}
          >
            <span className="font-dell-ui text-[18px] font-bold uppercase">
              Quizfragen verwalten
            </span>
            <span className="font-dell-body text-[14px] leading-[1.4]">
              Fragen aus der JSON-Datenbank pruefen, Details anzeigen und live
              auf die Praesi schalten.
            </span>
          </FrameButton>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <SectionCard
            title="Spielstatus"
            bodyStyle={{ backgroundColor: 'var(--color-tint-sage)' }}
          >
            <div className="space-y-2">
              <p className="font-dell-body text-[14px]">
                Status: <strong>{state.gameStatus}</strong>
              </p>
              <p className="font-dell-body text-[14px]">
                Aktive Praesi: <strong>{state.presentationView}</strong>
              </p>
              <p className="font-dell-body text-[14px]">
                Fragen beantwortet: <strong>{answeredCount}</strong>
              </p>
            </div>
          </SectionCard>

          <SectionCard
            title="Fuehrendes Team"
            bodyStyle={{ backgroundColor: 'var(--color-tint-sky)' }}
          >
            <p className="font-dell-body text-[14px]">
              {leader
                ? `${leader.name}${state.showScores ? ` mit ${leader.score} Punkten` : ''}`
                : 'Noch kein Team aktiv.'}
            </p>
          </SectionCard>

          <SectionCard
            title="Praesi"
            bodyStyle={{ backgroundColor: 'var(--color-tint-lime)' }}
          >
            <p className="font-dell-body text-[14px] leading-[1.4]">
              Das Beamer-Fenster bleibt unter{' '}
              <Link href="/quiz" target="_blank" className="dell-link">
                localhost:3000/quiz
              </Link>{' '}
              und wird komplett aus dieser Admin-Oberflaeche gesteuert.
            </p>
          </SectionCard>
        </section>
      </div>
    );
  }

  function renderTeamsSection() {
    return (
      <div className="space-y-5">
        <SectionCard
          title="Teamverwaltung"
          bodyStyle={{ backgroundColor: 'var(--color-tint-sky)' }}
        >
          <div className="mb-4 flex flex-wrap gap-3">
            <FrameButton onClick={actions.addTeam}>Team anlegen</FrameButton>
            <FrameButton variant="secondary" onClick={() => setActiveSection('scores')}>
              Zum Punktestand
            </FrameButton>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {state.teams.map((team, index) => {
              const draft = teamDrafts[team.id] ?? buildTeamDraft(team);

              return (
                <article
                  key={team.id}
                  className="dell-panel bg-[var(--color-canvas)] p-[var(--space-md)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-dell-ui text-[11px] font-bold uppercase">
                        Team {index + 1}
                      </p>
                      <p className="font-dell-body text-[14px]">
                        Aktuell: {team.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="dell-panel flex h-10 w-10 items-center justify-center"
                        style={{ backgroundColor: draft.color }}
                      >
                        <span className="font-dell-ui text-[16px] font-bold uppercase">
                          {draft.icon || 'T'}
                        </span>
                      </div>
                      <p className="font-dell-ui text-[16px] font-bold uppercase">
                        {team.score}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className="font-dell-ui text-[11px] font-bold uppercase">
                        Teamname
                      </span>
                      <input
                        className="dell-input mt-1 w-full"
                        value={draft.name}
                        onChange={(event) =>
                          updateDraft(team, { name: event.target.value })
                        }
                      />
                    </label>

                    <label className="block">
                      <span className="font-dell-ui text-[11px] font-bold uppercase">
                        Team-Icon
                      </span>
                      <input
                        className="dell-input mt-1 w-full"
                        value={draft.icon}
                        onChange={(event) =>
                          updateDraft(team, { icon: event.target.value })
                        }
                      />
                    </label>

                    <label className="block">
                      <span className="font-dell-ui text-[11px] font-bold uppercase">
                        Teamfarbe
                      </span>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="color"
                          className="dell-panel h-10 w-12"
                          value={draft.color}
                          onChange={(event) =>
                            updateDraft(team, { color: event.target.value })
                          }
                        />
                        <input
                          className="dell-input flex-1"
                          value={draft.color}
                          onChange={(event) =>
                            updateDraft(team, { color: event.target.value })
                          }
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="font-dell-ui text-[11px] font-bold uppercase">
                        Mitglieder
                      </span>
                      <input
                        className="dell-input mt-1 w-full"
                        value={draft.members}
                        onChange={(event) =>
                          updateDraft(team, { members: event.target.value })
                        }
                        placeholder="Anna, Ben, Chris"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <FrameButton onClick={() => saveTeam(team)}>Aenderungen speichern</FrameButton>
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
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {categories.map((category) => (
            <SectionCard
              key={category.id}
              title={category.name}
              bodyStyle={{ backgroundColor: category.tint }}
            >
              <p className="font-dell-body mb-4 text-[14px] leading-[1.4]">
                {category.blurb}
              </p>
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
                      className="flex h-auto min-h-[96px] flex-col items-start justify-between gap-2 px-[var(--space-md)] py-[var(--space-md)] text-left normal-case"
                      onClick={() => setSelectedQuestionKey(questionKey)}
                    >
                      <span className="font-dell-ui text-[11px] font-bold uppercase">
                        {question.points} Punkte
                      </span>
                      <span className="font-dell-body text-[13px] leading-[1.4]">
                        {question.questionText}
                      </span>
                      <span className="font-dell-ui text-[11px] font-bold uppercase">
                        {isAnswered ? 'Beantwortet' : 'Offen'}
                      </span>
                    </FrameButton>
                  );
                })}
              </div>
            </SectionCard>
          ))}
        </div>

        <div className="space-y-5">
          {selectedCatalogQuestion ? (
            <SectionCard
              title="Fragenansicht"
              bodyStyle={{ backgroundColor: selectedCatalogQuestion.category.tint }}
            >
              <div className="space-y-3">
                <div className="dell-panel bg-[var(--color-canvas)] p-[var(--space-md)]">
                  <p className="font-dell-ui text-[11px] font-bold uppercase">
                    Kategorie
                  </p>
                  <p className="font-dell-body text-[14px]">
                    {selectedCatalogQuestion.category.name}
                  </p>
                  <p className="font-dell-ui mt-2 text-[11px] font-bold uppercase">
                    Punktwert
                  </p>
                  <p className="font-dell-body text-[14px]">
                    {selectedCatalogQuestion.question.points}
                  </p>
                  <p className="font-dell-ui mt-2 text-[11px] font-bold uppercase">
                    Antworttyp
                  </p>
                  <p className="font-dell-body text-[14px]">
                    {formatQuestionType(selectedCatalogQuestion.question.type)}
                  </p>
                  <p className="font-dell-ui mt-2 text-[11px] font-bold uppercase">
                    Status
                  </p>
                  <p className="font-dell-body text-[14px]">
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

                <div className="dell-panel bg-[var(--color-canvas)] p-[var(--space-md)]">
                  <p className="font-dell-ui text-[11px] font-bold uppercase">
                    Fragetext
                  </p>
                  <p className="font-dell-body text-[14px] leading-[1.5]">
                    {selectedCatalogQuestion.question.questionText}
                  </p>
                </div>

                <div className="dell-panel bg-[var(--color-canvas)] p-[var(--space-md)]">
                  <p className="font-dell-ui text-[11px] font-bold uppercase">
                    Antwort
                  </p>
                  <p className="font-dell-body text-[14px] leading-[1.5]">
                    {selectedCatalogQuestion.question.answerText}
                  </p>
                </div>

                {selectedCatalogQuestion.question.options?.length ? (
                  <div className="dell-panel bg-[var(--color-canvas)] p-[var(--space-md)]">
                    <p className="font-dell-ui text-[11px] font-bold uppercase">
                      Antwortoptionen
                    </p>
                    <div className="mt-2 space-y-1">
                      {selectedCatalogQuestion.question.options.map((option) => (
                        <p key={option} className="font-dell-body text-[14px]">
                          - {option}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedCatalogQuestion.question.music ? (
                  <div className="dell-panel bg-[var(--color-canvas)] p-[var(--space-md)]">
                    <p className="font-dell-ui text-[11px] font-bold uppercase">
                      Musikdetails
                    </p>
                    <p className="font-dell-body mt-2 text-[14px]">
                      Song: {selectedCatalogQuestion.question.music.songTitle}
                    </p>
                    <p className="font-dell-body text-[14px]">
                      Interpret: {selectedCatalogQuestion.question.music.artist}
                    </p>
                    <p className="font-dell-body text-[14px]">
                      Clip-Laengen:{' '}
                      {selectedCatalogQuestion.question.music.clipLengths.join(', ')}{' '}
                      Sekunden
                    </p>
                    <p className="font-dell-body text-[14px]">
                      Bonus: {selectedCatalogQuestion.question.music.bonusPrompts?.join(', ') || '—'}
                    </p>
                  </div>
                ) : null}

                {selectedCatalogQuestion.question.mediaUrl ? (
                  <div className="dell-panel bg-[var(--color-canvas)] p-[var(--space-md)]">
                    <p className="font-dell-ui text-[11px] font-bold uppercase">
                      Medieninhalt
                    </p>
                    <p className="font-dell-body mt-2 text-[14px]">
                      Typ: {selectedCatalogQuestion.question.mediaKind || 'image'}
                    </p>
                    <p className="font-dell-body text-[14px]">
                      URL: {selectedCatalogQuestion.question.mediaUrl}
                    </p>
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
                    Antwort auf Praesi zeigen
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
      <div className="space-y-5">
        <SectionCard
          title="Moderator-Controls"
          bodyStyle={{ backgroundColor: 'var(--color-tint-steel)' }}
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
            <FrameButton variant="secondary" onClick={actions.revealAnswer}>
              Antwort anzeigen
            </FrameButton>
            <FrameButton variant="secondary" onClick={actions.closeQuestionWithoutPoints}>
              Frage als beantwortet markieren
            </FrameButton>
            <FrameButton variant="secondary" onClick={actions.resetGame}>
              Komplett resetten
            </FrameButton>
            <FrameButton variant="secondary" onClick={handleExport}>
              Daten exportieren
            </FrameButton>
          </div>
        </SectionCard>

        {activeQuestion ? (
          <SectionCard
            title="Aktive Live-Frage"
            sticker={state.answersRevealed ? 'ANTWORT' : 'LIVE'}
            bodyStyle={{ backgroundColor: activeQuestion.categoryTint }}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-3">
                <div className="dell-panel bg-[var(--color-canvas)] p-[var(--space-md)]">
                  <p className="font-dell-ui text-[11px] font-bold uppercase">
                    Kategorie
                  </p>
                  <p className="font-dell-body text-[14px]">
                    {activeQuestion.categoryName}
                  </p>
                  <p className="font-dell-ui mt-2 text-[11px] font-bold uppercase">
                    Fragetext
                  </p>
                  <p className="font-dell-body text-[14px] leading-[1.5]">
                    {activeQuestion.questionText}
                  </p>
                  <p className="font-dell-ui mt-2 text-[11px] font-bold uppercase">
                    Antwort
                  </p>
                  <p className="font-dell-body text-[14px] leading-[1.5]">
                    {activeQuestion.answerText}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <FrameButton onClick={actions.revealAnswer}>
                    Antwort einblenden
                  </FrameButton>
                  <FrameButton
                    variant="secondary"
                    onClick={() => actions.setPresentationView('question')}
                  >
                    Nur Frage anzeigen
                  </FrameButton>
                </div>
              </div>

              <div className="space-y-2">
                {state.teams.map((team) => (
                  <FrameButton
                    key={team.id}
                    className="w-full"
                    onClick={() => actions.awardSelectedQuestion(team.id)}
                  >
                    +{activeQuestion.points} an {team.name}
                  </FrameButton>
                ))}
                <FrameButton
                  variant="secondary"
                  className="w-full"
                  onClick={actions.closeQuestionWithoutPoints}
                >
                  Keine Punkte vergeben
                </FrameButton>
              </div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="Aktive Live-Frage"
            bodyStyle={{ backgroundColor: 'var(--color-tint-lime)' }}
          >
            <p className="font-dell-body text-[14px]">
              Aktuell ist keine Frage live. Waehle im Quizfragen-Bereich oder im
              Board eine Frage aus.
            </p>
          </SectionCard>
        )}

        <SectionCard
          title="Board / Fragen freischalten"
          bodyStyle={{ backgroundColor: 'var(--color-tint-sage)' }}
        >
          <div className="space-y-5">
            {categories.map((category) => (
              <div key={category.id} className="dell-panel bg-[var(--color-canvas)] p-[var(--space-md)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-dell-ui text-[11px] font-bold uppercase">
                      {category.eyebrow}
                    </p>
                    <p className="font-dell-ui text-[14px] font-bold uppercase">
                      {category.name}
                    </p>
                  </div>
                  <p className="font-dell-ui text-[11px] font-bold uppercase">
                    {category.questions.length} Fragen
                  </p>
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
                        className="flex h-auto min-h-[80px] flex-col items-start justify-between gap-2 px-[var(--space-md)] py-[var(--space-md)] text-left normal-case"
                        onClick={() =>
                          actions.selectQuestion(createSelectedQuestion(category, question))
                        }
                      >
                        <span className="font-dell-ui text-[11px] font-bold uppercase">
                          {question.points} Punkte
                        </span>
                        <span className="font-dell-body text-[13px] leading-[1.4]">
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
          bodyStyle={{ backgroundColor: 'var(--color-tint-periwinkle)' }}
        >
          <div className="space-y-2">
            {state.gameEvents.length === 0 ? (
              <p className="font-dell-body text-[14px]">
                Noch keine Ereignisse gespeichert.
              </p>
            ) : (
              [...state.gameEvents].reverse().map((event) => (
                <div
                  key={event.id}
                  className="dell-panel bg-[var(--color-canvas)] px-[var(--space-md)] py-[var(--space-sm)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-dell-ui text-[11px] font-bold uppercase">
                      {event.label}
                    </p>
                    <p className="font-dell-ui text-[11px] font-bold uppercase">
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                  <p className="font-dell-body mt-1 text-[14px]">{event.note}</p>
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
      <div className="space-y-5">
        <SectionCard
          title="Live-Punktestand"
          bodyStyle={{ backgroundColor: 'var(--color-tint-steel)' }}
        >
          <div className="mb-4 flex flex-wrap gap-2">
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
              Punktestand {state.showScores ? 'ausblenden' : 'anzeigen'}
            </FrameButton>
            <FrameButton variant="secondary" onClick={actions.resetScores}>
              Punktestand resetten
            </FrameButton>
            <FrameButton
              variant="secondary"
              onClick={() => setActiveSection('final')}
            >
              Finalmodus aktivieren
            </FrameButton>
          </div>

          <div className="space-y-3">
            {ranking.map((team, index) => (
              <article
                key={team.id}
                className="dell-panel bg-[var(--color-canvas)] px-[var(--space-md)] py-[var(--space-md)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="dell-panel flex h-10 w-10 items-center justify-center"
                      style={{ backgroundColor: team.color }}
                    >
                      <span className="font-dell-ui text-[15px] font-bold uppercase">
                        {team.icon || team.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-dell-ui text-[11px] font-bold uppercase">
                        Platz {index + 1}
                      </p>
                      <p className="font-dell-body text-[16px]">{team.name}</p>
                    </div>
                  </div>
                  <p className="font-dell-display text-[32px] leading-none">
                    {state.showScores ? team.score : '???'}
                  </p>
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
      <div className="space-y-5">
        <SectionCard
          title="Finalrunde / Stechen"
          bodyStyle={{ backgroundColor: 'var(--color-tint-peach)' }}
        >
          <div className="space-y-4">
            <p className="font-dell-body text-[14px] leading-[1.5]">
              Waehle die Teams fuer das Stechen aus und setze den Sieger
              manuell. Die Praesi kann anschliessend in den Finalmodus
              umschalten.
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              {state.teams.map((team) => {
                const isSelected = state.finalTeams.includes(team.id);

                return (
                  <label
                    key={team.id}
                    className="dell-panel flex items-center gap-3 bg-[var(--color-canvas)] px-[var(--space-md)] py-[var(--space-sm)]"
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
                    <span className="font-dell-body text-[14px]">{team.name}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <FrameButton onClick={() => actions.setPresentationView('final')}>
                Finalmodus anzeigen
              </FrameButton>
              <FrameButton
                variant="secondary"
                onClick={actions.clearFinalMode}
              >
                Finalmodus zuruecksetzen
              </FrameButton>
            </div>

            {finalTeams.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {finalTeams.map((team) => (
                  <div
                    key={team.id}
                    className="dell-panel bg-[var(--color-canvas)] px-[var(--space-md)] py-[var(--space-md)]"
                  >
                    <p className="font-dell-ui text-[11px] font-bold uppercase">
                      Finalteam
                    </p>
                    <p className="font-dell-body mt-1 text-[16px]">{team.name}</p>
                    <FrameButton
                      className="mt-3 w-full"
                      onClick={() => actions.chooseFinalWinner(team.id)}
                    >
                      Als Sieger setzen
                    </FrameButton>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="dell-panel bg-[var(--color-canvas)] p-[var(--space-md)]">
              <p className="font-dell-ui text-[11px] font-bold uppercase">
                Musik-Buzzer-Duell
              </p>
              <p className="font-dell-body mt-2 text-[14px] leading-[1.5]">
                Zwei Personen treten gegeneinander an. Der Quizmaster startet
                eine Musikfrage oder eine Stechen-Frage und setzt den Sieger
                anschliessend manuell.
              </p>
              <p className="font-dell-body mt-2 text-[14px]">
                Aktueller Sieger:{' '}
                <strong>{finalWinner ? finalWinner.name : 'Noch keiner gesetzt'}</strong>
              </p>
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
    <div className="min-h-screen bg-[var(--color-canvas)] p-4 md:p-6">
      <div className="space-y-5">
        <header
          className="dell-panel dell-shadow px-[var(--space-lg)] py-[var(--space-md)] text-[var(--color-canvas)]"
          style={{
            backgroundColor: 'var(--color-frame-ink)',
            color: 'var(--color-canvas)',
          }}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="font-dell-ui text-[16px] font-bold uppercase">
                ADMIN / LOCALHOST:3000
              </p>
              <p className="font-dell-display mt-2 text-[clamp(32px,4vw,52px)] leading-none uppercase">
                {quizMeta.title}
              </p>
              <p className="font-dell-body mt-2 text-[14px] leading-[1.4]">
                {quizMeta.subtitle} — Admin, Teamverwaltung, JSON-basierte
                Fragenverwaltung und Moderator-Steuerung in einer Oberflaeche.
              </p>
            </div>

            <div className="flex flex-wrap items-start gap-3">
              <Link
                href="/quiz"
                target="_blank"
                rel="noreferrer"
                className="dell-button dell-button-active dell-button-size-default inline-flex items-center no-underline"
              >
                Praesi in neuem Tab
              </Link>
              <div className="font-dell-ui px-[var(--space-sm)] py-[var(--space-xs)] text-[16px] font-bold text-[var(--color-primary)]">
                1-800-213-GIGA
              </div>
            </div>
          </div>
        </header>

        <nav className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
          {adminSections.map((section) => (
            <FrameButton
              key={section.id}
              variant={activeSection === section.id ? 'primary' : 'secondary'}
              active={activeSection === section.id}
              className="w-full"
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </FrameButton>
          ))}
        </nav>

        {renderSection()}
      </div>
    </div>
  );
}

'use client';

import { useState, type ReactNode } from 'react';
import {
  getQuestionKey,
  type QuizState,
  type SelectedQuestion,
} from '@/components/quiz/config';
import {
  gamingQuestions,
  generalKnowledgeSections,
  movieJeopardyCategories,
  musicDecades,
  subquizModules,
  vodafoneEstimateQuestions,
} from '@/components/quiz/presentation/subquiz-content';
import { formatPresentationViewLabel } from '@/components/quiz/presentation/presentation-utils';
import { FrameButton, StatusPill } from '@/components/quiz/ui';
import {
  createLiveSelectedQuestion,
} from '@/components/quiz/admin/shared';
import { useQuizStore } from '@/components/quiz/use-quiz-store';

type QuizActions = ReturnType<typeof useQuizStore>['actions'];
type MusicDecadeQuestion = (typeof musicDecades)[number]['questions'][number];

export function QuizzesPage({
  state,
  actions,
  activeQuestion,
  onOpenFinale,
}: {
  state: QuizState;
  actions: QuizActions;
  activeQuestion: QuizState['selectedQuestion'];
  onOpenFinale: () => void;
}) {
  const [openEntries, setOpenEntries] = useState<Record<string, string | null>>({});
  const activeSubquizKey = state.activeSubquiz ?? '__none__';
  const openEntryId = openEntries[activeSubquizKey] ?? null;

  function setOpenEntry(entryId: string | null) {
    setOpenEntries((current) => ({
      ...current,
      [activeSubquizKey]: entryId,
    }));
  }

  function toggleEntry(entryId: string) {
    setOpenEntry(openEntryId === entryId ? null : entryId);
  }

  function selectQuestion(entryId: string, question: SelectedQuestion) {
    setOpenEntry(entryId);
    actions.selectQuestion(question);
  }

  function isAnswered(moduleId: SelectedQuestion['categoryId'], questionId: string) {
    return Boolean(state.answered[getQuestionKey(moduleId, questionId)]);
  }

  function renderSubquizNavigation() {
    return (
      <section>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {subquizModules.map((module) => (
            <button
              key={module.id}
              type="button"
              className={`rounded-xl border px-5 py-5 text-left transition ${
                state.activeSubquiz === module.id
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-900'
              }`}
              onClick={() => actions.setPresentationView(module.id)}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.08em] opacity-70">
                {module.detail}
              </p>
              <p className="mt-3 text-xl font-semibold tracking-tight">
                {module.title}
              </p>
            </button>
          ))}
        </div>
      </section>
    );
  }

  function renderInlineManager(question: SelectedQuestion) {
    const requiresMusicClip =
      question.type === 'musikfrage' &&
      (question.music?.clipLengths.length ?? 0) === 0;

    return (
      <div
        className="mt-4 rounded-3xl border border-slate-200 p-4"
        style={{ backgroundColor: question.categoryTint }}
      >
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="dark">
            {state.answersRevealed ? 'Antwort live' : 'Frage live'}
          </StatusPill>
          <StatusPill>
            {requiresMusicClip ? 'Clip waehlen' : `${question.points} Punkte`}
          </StatusPill>
          <StatusPill>{formatPresentationViewLabel(state.presentationView)}</StatusPill>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white/85 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Frage
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  {question.questionText}
                </p>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Antwort
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  {question.answerText}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <FrameButton
                onClick={
                  state.answersRevealed
                    ? () => actions.setPresentationView('answer')
                    : actions.revealAnswer
                }
                disabled={requiresMusicClip}
              >
                {state.answersRevealed ? 'Antwort live' : 'Antwort zeigen'}
              </FrameButton>
              <FrameButton
                variant="secondary"
                onClick={() => actions.setPresentationView('question')}
              >
                Frage live
              </FrameButton>
              <FrameButton
                variant="secondary"
                onClick={() => {
                  if (state.activeSubquiz) {
                    actions.setPresentationView(state.activeSubquiz);
                  }
                }}
                disabled={!state.activeSubquiz}
              >
                Unterquiz zeigen
              </FrameButton>
              <FrameButton
                variant="secondary"
                onClick={actions.closeQuestionWithoutPoints}
              >
                Ohne Punkte schliessen
              </FrameButton>
            </div>
          </div>

          {requiresMusicClip ? (
            <div className="rounded-3xl border border-slate-200 bg-white/85 p-4">
              <FrameButton
                variant="secondary"
                className="w-full rounded-2xl px-4 py-4 normal-case"
                onClick={actions.clearQuestion}
              >
                Frage ausblenden
              </FrameButton>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                Punkte vergeben
              </p>
              {state.teams.map((team) => (
                <FrameButton
                  key={team.id}
                  className="w-full justify-between rounded-2xl px-4 py-4 normal-case"
                  onClick={() => actions.awardSelectedQuestion(team.id)}
                >
                  <span className="text-sm font-semibold">{team.name}</span>
                  <span className="text-xs uppercase tracking-[0.08em]">
                    +{question.points}
                  </span>
                </FrameButton>
              ))}
              <FrameButton
                variant="secondary"
                className="mt-3 w-full rounded-2xl px-4 py-4 normal-case"
                onClick={actions.clearQuestion}
              >
                Frage ausblenden
              </FrameButton>
            </div>
          )}
        </div>
      </div>
    );
  }

  function buildMusicSelectedQuestion(
    question: MusicDecadeQuestion,
    clip?: { seconds: number; points: number },
  ) {
    return createLiveSelectedQuestion({
      moduleId: 'musik',
      categoryName: `Musik / ${question.category}`,
      questionId: clip ? `${question.id}-${clip.seconds}` : question.id,
      sourceQuestionId: question.id,
      questionText: clip
        ? `${question.hint} - ${clip.seconds} Sekunden`
        : question.hint,
      answerText: `${question.songTitle} - ${question.artist}`,
      points: clip?.points ?? 0,
      type: 'musikfrage',
      music: {
        songTitle: question.songTitle,
        artist: question.artist,
        clipLengths: clip ? [clip.seconds] : [],
      },
    });
  }

  function renderQuestionListItem({
    entryId,
    title,
    detail,
    description,
    children,
    isActive,
    isAnswered,
    activeLabel,
  }: {
    entryId: string;
    title: string;
    detail?: string;
    description: string;
    children: ReactNode;
    isActive: boolean;
    isAnswered: boolean;
    activeLabel?: string;
  }) {
    const isOpen = openEntryId === entryId || isActive;

    return (
      <article
        className={`rounded-3xl border transition ${
          isActive
            ? 'border-slate-900 bg-slate-50'
            : isAnswered
              ? 'border-emerald-300 bg-emerald-50'
            : 'border-slate-200 bg-white'
        }`}
      >
        <button
          type="button"
          className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
          onClick={() => toggleEntry(entryId)}
        >
          <div className="min-w-0">
            {detail ? (
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                {detail}
              </p>
            ) : null}
            <p className="mt-1 text-base font-semibold text-slate-950">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {isActive ? (
              <StatusPill tone="dark">{activeLabel ?? 'Live'}</StatusPill>
            ) : isAnswered ? (
              <StatusPill tone="success">Erledigt</StatusPill>
            ) : null}
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              {isOpen ? 'Zuklappen' : 'Aufklappen'}
            </span>
          </div>
        </button>

        {isOpen ? (
          <div className="border-t border-slate-200 px-5 py-4">
            {children}
            {isActive && activeQuestion && activeQuestion.type !== 'musikfrage'
              ? renderInlineManager(activeQuestion)
              : null}
          </div>
        ) : null}
      </article>
    );
  }

  function renderGamingList() {
    return (
      <div className="space-y-3">
        {gamingQuestions.map((question, index) => {
          const isActive =
            activeQuestion?.categoryId === 'gaming' &&
            activeQuestion.questionId === question.id;
          const answered = isAnswered('gaming', question.id);

          return renderQuestionListItem({
            entryId: question.id,
            title: question.title,
            detail: `Frage ${index + 1}`,
            description: question.prompt,
            isActive,
            isAnswered: answered,
            activeLabel: state.answersRevealed ? 'Antwort live' : 'Frage live',
            children: (
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Antwortoptionen
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <StatusPill key={option}>{option}</StatusPill>
                    ))}
                  </div>
                </div>
                <FrameButton
                  onClick={() =>
                    selectQuestion(
                      question.id,
                      createLiveSelectedQuestion({
                        moduleId: 'gaming',
                        categoryName: `Gaming / ${question.category}`,
                        questionId: question.id,
                        sourceQuestionId: question.id,
                        questionText: question.prompt,
                        answerText: question.answer,
                        points: (index + 1) * 100,
                        type: 'multiple-choice',
                        options: [...question.options],
                      }),
                    )
                  }
                  disabled={answered}
                >
                  {answered ? 'Erledigt' : 'Frage live schalten'}
                </FrameButton>
              </div>
            ),
          });
        })}
      </div>
    );
  }

  function renderMusicList() {
    return (
      <div className="space-y-6">
        {musicDecades.map((decade) => (
          <div key={decade.id} className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Jahrzehnt
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                {decade.label}
              </h3>
            </div>

            {decade.questions.map((question) => {
              const isActive =
                activeQuestion?.categoryId === 'musik' &&
                activeQuestion.sourceQuestionId === question.id;
              const answered = isAnswered('musik', question.id);
              const selectedMusicPoints =
                isActive && activeQuestion ? activeQuestion.points : null;

              return renderQuestionListItem({
                entryId: question.id,
                title: question.songTitle,
                detail: `${decade.label} · ${question.artist}`,
                description: question.hint,
                isActive,
                isAnswered: answered,
                activeLabel: state.answersRevealed ? 'Antwort live' : 'Frage live',
                children: isActive ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {question.clipOptions.map((clip) => (
                        <FrameButton
                          key={clip.seconds}
                          variant="secondary"
                          onClick={() =>
                            selectQuestion(
                              question.id,
                              buildMusicSelectedQuestion(question, clip),
                            )
                          }
                          disabled={answered}
                        >
                          {clip.seconds}s / {clip.points}
                        </FrameButton>
                      ))}
                    </div>

                    {selectedMusicPoints && selectedMusicPoints > 0 ? (
                      <div className="space-y-2">
                        {state.teams.map((team) => (
                          <FrameButton
                            key={team.id}
                            className="w-full justify-between rounded-2xl px-4 py-4 normal-case"
                            onClick={() => actions.awardSelectedQuestion(team.id)}
                          >
                            <span className="text-sm font-semibold">{team.name}</span>
                            <span className="text-xs uppercase tracking-[0.08em]">
                              +{selectedMusicPoints}
                            </span>
                          </FrameButton>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <FrameButton
                    onClick={() =>
                      selectQuestion(
                        question.id,
                        buildMusicSelectedQuestion(question),
                      )
                    }
                    disabled={answered}
                  >
                    {answered ? 'Erledigt' : 'Frage live schalten'}
                  </FrameButton>
                ),
              });
            })}
          </div>
        ))}
      </div>
    );
  }

  function renderGeneralKnowledgeList() {
    return (
      <div className="space-y-6">
        {generalKnowledgeSections.map((section) => (
          <div key={section.id} className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Bereich
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                {section.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {section.description}
              </p>
            </div>

            {section.items.map((item) => {
              const isActive =
                activeQuestion?.categoryId === 'allgemeinwissen' &&
                activeQuestion.questionId.startsWith(`${item.id}-`);
              const answered = isAnswered('allgemeinwissen', item.id);

              return renderQuestionListItem({
                entryId: item.id,
                title: item.label,
                detail: section.title,
                description: item.prompt,
                isActive,
                isAnswered: answered,
                activeLabel: state.answersRevealed ? 'Antwort live' : 'Frage live',
                children: (
                  <div className="flex flex-wrap gap-2">
                    {section.revealModes.map((mode) => (
                      <FrameButton
                        key={mode.id}
                        variant="secondary"
                        onClick={() =>
                          selectQuestion(
                            item.id,
                            createLiveSelectedQuestion({
                              moduleId: 'allgemeinwissen',
                              categoryName: `Allgemeinwissen / ${item.category}`,
                              questionId: `${item.id}-${mode.id}`,
                              sourceQuestionId: item.id,
                              questionText: `${item.prompt} - ${mode.label}`,
                              answerText: item.answer,
                              points: mode.points,
                              type: section.id === 'personen' ? 'bildfrage' : 'freitext',
                            }),
                          )
                        }
                        disabled={answered}
                      >
                        {mode.label} / {mode.points}
                      </FrameButton>
                    ))}
                  </div>
                ),
              });
            })}
          </div>
        ))}
      </div>
    );
  }

  function renderMoviesSeriesList() {
    return (
      <div className="space-y-6">
        {movieJeopardyCategories.map((category) => (
          <div key={category.id} className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Kategorie
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                {category.label}
              </h3>
            </div>

            {category.questions.map((question) => {
              const isActive =
                activeQuestion?.categoryId === 'filme-serien' &&
                activeQuestion.questionId === question.id;
              const answered = isAnswered('filme-serien', question.id);

              return renderQuestionListItem({
                entryId: question.id,
                title: `${question.points} Punkte`,
                detail: category.label,
                description: question.prompt,
                isActive,
                isAnswered: answered,
                activeLabel: state.answersRevealed ? 'Antwort live' : 'Frage live',
                children: (
                  <FrameButton
                    onClick={() =>
                      selectQuestion(
                        question.id,
                        createLiveSelectedQuestion({
                          moduleId: 'filme-serien',
                          categoryName: `Filme & Serien / ${question.category}`,
                          questionId: question.id,
                          sourceQuestionId: question.id,
                          questionText: question.prompt,
                          answerText: question.answer,
                          points: question.points,
                          type: 'freitext',
                        }),
                      )
                    }
                    disabled={answered}
                  >
                    {answered ? 'Erledigt' : 'Frage live schalten'}
                  </FrameButton>
                ),
              });
            })}
          </div>
        ))}
      </div>
    );
  }

  function renderVodafoneList() {
    return (
      <div className="space-y-3">
        {vodafoneEstimateQuestions.map((question) => {
          const isActive =
            activeQuestion?.categoryId === 'vodafone-schaetzfragen' &&
            activeQuestion.questionId === question.id;
          const answered = isAnswered('vodafone-schaetzfragen', question.id);

          return renderQuestionListItem({
            entryId: question.id,
            title: question.title,
            detail: `${question.points} Punkte`,
            description: question.prompt,
            isActive,
            isAnswered: answered,
            activeLabel: state.answersRevealed ? 'Antwort live' : 'Frage live',
            children: (
              <FrameButton
                onClick={() =>
                  selectQuestion(
                    question.id,
                    createLiveSelectedQuestion({
                      moduleId: 'vodafone-schaetzfragen',
                      categoryName: `Vodafone Schaetzfragen / ${question.category}`,
                      questionId: question.id,
                      sourceQuestionId: question.id,
                      questionText: question.prompt,
                      answerText: question.answer,
                      points: question.points,
                      type: 'schaetzfrage',
                    }),
                  )
                }
                disabled={answered}
              >
                {answered ? 'Erledigt' : 'Frage live schalten'}
              </FrameButton>
            ),
          });
        })}
      </div>
    );
  }

  function renderActiveSubquizSection() {
    if (state.activeSubquiz === 'gaming') {
      return (
        <section className="ui-panel space-y-5 px-6 py-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Gaming
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Alle Fragen stehen in einer Liste und lassen sich direkt aufklappen und live steuern.
            </p>
          </div>
          {renderGamingList()}
        </section>
      );
    }

    if (state.activeSubquiz === 'musik') {
      return (
        <section className="ui-panel space-y-5 px-6 py-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Musik
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Songs sind pro Jahrzehnt gelistet. Beim Aufklappen wählst du die Clip-Länge und steuerst die Liveschaltung direkt dort.
            </p>
          </div>
          {renderMusicList()}
        </section>
      );
    }

    if (state.activeSubquiz === 'allgemeinwissen') {
      return (
        <section className="ui-panel space-y-5 px-6 py-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Allgemeinwissen
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Jede Frage ist aufklappbar und bietet die passenden Reveal-Stufen direkt im Eintrag.
            </p>
          </div>
          {renderGeneralKnowledgeList()}
        </section>
      );
    }

    if (state.activeSubquiz === 'filme-serien') {
      return (
        <section className="ui-panel space-y-5 px-6 py-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Filme & Serien
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Fragen sind nach Kategorie gruppiert und lassen sich einzeln aufklappen und steuern.
            </p>
          </div>
          {renderMoviesSeriesList()}
        </section>
      );
    }

    if (state.activeSubquiz === 'vodafone-schaetzfragen') {
      return (
        <section className="ui-panel space-y-5 px-6 py-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Vodafone Schaetzfragen
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Schaetzfragen sind als Liste angelegt und werden direkt im aufgeklappten Eintrag gemanagt.
            </p>
          </div>
          {renderVodafoneList()}
        </section>
      );
    }

    return (
      <section className="ui-panel px-6 py-6">
        <p className="text-sm text-slate-600">
          Wähle oben ein Unterquiz aus, um die Fragenliste zu öffnen.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="ui-panel space-y-4 px-6 py-6">
        <div className="flex flex-wrap gap-2">
          <FrameButton
            variant={
              state.activeSubquiz === null && state.presentationView === 'board'
                ? 'primary'
                : 'secondary'
            }
            onClick={actions.openQuizzesSelection}
          >
            Unterquiz-Uebersicht
          </FrameButton>
          <FrameButton
            variant={state.presentationView === 'scores' ? 'primary' : 'secondary'}
            onClick={() => actions.setPresentationView('scores')}
          >
            Punkte
          </FrameButton>
          <FrameButton
            variant={state.presentationView === 'top3' ? 'primary' : 'secondary'}
            onClick={() => actions.setPresentationView('top3')}
          >
            Top 3
          </FrameButton>
          <FrameButton
            variant={state.presentationView === 'final' ? 'primary' : 'secondary'}
            onClick={() => {
              actions.setPresentationView('final');
              onOpenFinale();
            }}
          >
            Finale
          </FrameButton>
        </div>

        {renderSubquizNavigation()}
      </section>

      {renderActiveSubquizSection()}
    </div>
  );
}

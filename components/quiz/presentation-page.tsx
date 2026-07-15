'use client';

import Link from 'next/link';
import {
  categories,
  getQuestionKey,
  getTotalQuestionCount,
  quizMeta,
} from '@/components/quiz/config';
import {
  HydrationPlaceholder,
  MetricCard,
  StatusPill,
  TeamAvatar,
} from '@/components/quiz/ui';
import { useQuizStore } from '@/components/quiz/use-quiz-store';

function renderScoreValue(showScores: boolean, score: number) {
  return showScores ? score : '???';
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

function formatLabel(type: string) {
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

export function PresentationPage() {
  const { state, ranking, isHydrated } = useQuizStore();

  if (!isHydrated) {
    return (
      <HydrationPlaceholder
        title="Praesentation wird geladen"
        message="Die Anzeige verbindet sich gerade mit dem Admin-Fenster."
      />
    );
  }

  const finalTeams = state.teams.filter((team) => state.finalTeams.includes(team.id));
  const finalWinner =
    state.teams.find((team) => team.id === state.finalWinnerId) ?? null;
  const answeredCount = Object.keys(state.answered).length;
  const totalQuestionCount = getTotalQuestionCount();
  const remainingQuestions = Math.max(totalQuestionCount - answeredCount, 0);

  function renderBoardView() {
    return (
      <section className="ui-panel overflow-hidden border-slate-800 bg-slate-900 text-white">
        <div className="border-b border-slate-800 px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
            Quizboard
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Kategorien</h2>
          <p className="mt-2 text-base leading-7 text-slate-400">
            Offene Felder koennen direkt aus der Admin-Ansicht live geschaltet
            werden.
          </p>
        </div>

        <div className="grid gap-5 p-6 xl:grid-cols-2">
          {categories.map((category) => (
            <article
              key={category.id}
              className="ui-panel overflow-hidden border-slate-800 bg-slate-950 text-white"
            >
              <div className="border-b border-slate-800 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  {category.eyebrow}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {category.blurb}
                </p>
              </div>

              <div
                className="grid gap-3 p-5 sm:grid-cols-3"
                style={{ backgroundColor: category.tint }}
              >
                {category.questions.map((question) => {
                  const isAnswered =
                    state.answered[getQuestionKey(category.id, question.id)];

                  return (
                    <div
                      key={question.id}
                      className={`rounded-3xl border px-4 py-4 ${
                        isAnswered
                          ? 'border-slate-300 bg-white/70 text-slate-500'
                          : 'border-slate-900 bg-white text-slate-900'
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.08em]">
                        {isAnswered ? 'Beantwortet' : 'Offen'}
                      </p>
                      <p className="mt-6 text-4xl font-bold tracking-tight">
                        {question.points}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderQuestionView(showAnswer: boolean) {
    const selectedQuestion = state.selectedQuestion;

    if (!selectedQuestion) {
      return (
        <section className="ui-panel flex min-h-[540px] items-center justify-center border-slate-800 bg-slate-900 px-8 py-10 text-white">
          <div className="max-w-3xl text-center">
            <StatusPill tone="dark">Bereit</StatusPill>
            <h2 className="mt-5 text-5xl font-bold tracking-tight">
              Naechste Frage folgt gleich
            </h2>
            <p className="mt-4 text-xl leading-8 text-slate-300">
              Das Admin-Fenster waehlt gerade die naechste Kategorie oder
              wechselt zur Punkteansicht.
            </p>
          </div>
        </section>
      );
    }

    return (
      <section className="ui-panel overflow-hidden border-slate-800 bg-slate-900 text-white">
        <div
          className="border-b border-slate-800 px-6 py-5"
          style={{ backgroundColor: selectedQuestion.categoryTint }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-800">
                {showAnswer ? 'Antwortansicht' : 'Frage'}
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {selectedQuestion.categoryName}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill>{selectedQuestion.type}</StatusPill>
              <StatusPill tone="dark">{selectedQuestion.points} Punkte</StatusPill>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="ui-panel rounded-[28px] border-slate-800 bg-slate-950 px-6 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              Fragetext
            </p>
            <p className="mt-4 text-3xl font-semibold leading-[1.35] tracking-tight text-white md:text-4xl">
              {selectedQuestion.questionText}
            </p>
          </div>

          {selectedQuestion.options?.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {selectedQuestion.options.map((option) => (
                <div
                  key={option}
                  className="ui-panel rounded-[28px] border-slate-800 bg-slate-950 px-5 py-5 text-white"
                >
                  <p className="text-xl leading-8 text-slate-100">{option}</p>
                </div>
              ))}
            </div>
          ) : null}

          {showAnswer ? (
            <div className="ui-panel rounded-[28px] border-emerald-400 bg-emerald-50 px-6 py-6 text-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
                Antwort
              </p>
              <p className="mt-4 text-2xl font-semibold leading-9 tracking-tight md:text-3xl">
                {selectedQuestion.answerText}
              </p>
              {selectedQuestion.music ? (
                <p className="mt-4 text-base leading-7 text-slate-700">
                  {selectedQuestion.music.songTitle} - {selectedQuestion.music.artist}
                  {' '}| Clips: {selectedQuestion.music.clipLengths.join(', ')} Sekunden
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <MetricCard label="Punktwert" value={selectedQuestion.points} />
            <MetricCard
              label="Antworttyp"
              value={formatLabel(selectedQuestion.type)}
            />
          </div>
        </div>
      </section>
    );
  }

  function renderScoresView(limit?: number) {
    const items = typeof limit === 'number' ? ranking.slice(0, limit) : ranking;

    return (
      <section className="ui-panel overflow-hidden border-slate-800 bg-slate-900 text-white">
        <div className="border-b border-slate-800 px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
            {limit === 3 ? 'Top 3' : 'Live-Punktestand'}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            {limit === 3 ? 'Fuehrende Teams' : 'Ranking'}
          </h2>
        </div>

        <div className="space-y-4 px-6 py-6">
          {items.map((team, index) => (
            <article
              key={team.id}
              className="ui-panel flex flex-col gap-4 rounded-[28px] border-slate-800 bg-slate-950 px-5 py-5 text-white lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold tracking-tight text-slate-300">
                  #{index + 1}
                </div>
                <div className="flex items-center gap-4">
                  <TeamAvatar
                    size="large"
                    color={team.color}
                    label={team.icon || team.name.charAt(0)}
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                      {index === 0 ? 'Spitze' : 'Im Rennen'}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                      {team.name}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-right text-4xl font-bold tracking-tight text-white md:text-5xl">
                {renderScoreValue(state.showScores, team.score)}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderFinalView() {
    return (
      <section className="ui-panel overflow-hidden border-slate-800 bg-slate-900 text-white">
        <div className="border-b border-slate-800 px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
            Finalrunde
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Musik-Buzzer-Duell
          </h2>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="max-w-4xl">
            <p className="text-xl leading-8 text-slate-300">
              Zwei Personen treten gegeneinander an. Die Entscheidung wird live
              im Admin gesetzt und sofort hier angezeigt.
            </p>
          </div>

          {finalTeams.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {finalTeams.map((team) => (
                <article
                  key={team.id}
                  className="ui-panel rounded-[28px] border-slate-800 bg-slate-950 px-5 py-5 text-white"
                >
                  <div className="flex items-center gap-4">
                    <TeamAvatar
                      size="large"
                      color={team.color}
                      label={team.icon || team.name.charAt(0)}
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                        Finalteam
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                        {team.name}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <StatusPill
                      tone={finalWinner?.id === team.id ? 'success' : 'neutral'}
                    >
                      {finalWinner?.id === team.id
                        ? 'Als Sieger gesetzt'
                        : 'Im Stechen'}
                    </StatusPill>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="ui-panel rounded-[28px] border-slate-800 bg-slate-950 px-6 py-6 text-white">
              <p className="text-lg leading-8 text-slate-300">
                Das Admin-Fenster waehlt gerade die Teams fuer das Finale aus.
              </p>
            </div>
          )}

          {finalWinner ? (
            <div className="ui-panel rounded-[28px] border-emerald-400 bg-emerald-50 px-6 py-6 text-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
                Sieger
              </p>
              <p className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                {finalWinner.name}
              </p>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  function renderIntroState(title: string, message: string, tone: 'neutral' | 'warning') {
    return (
      <section className="ui-panel flex min-h-[540px] items-center justify-center border-slate-800 bg-slate-900 px-8 py-10 text-white">
        <div className="max-w-3xl text-center">
          <StatusPill tone={tone}>{tone === 'warning' ? 'Pause' : 'Bereit'}</StatusPill>
          <h2 className="mt-5 text-5xl font-bold tracking-tight">{title}</h2>
          <p className="mt-4 text-xl leading-8 text-slate-300">{message}</p>
        </div>
      </section>
    );
  }

  function renderMainView() {
    if (state.gameStatus === 'idle') {
      return renderIntroState(
        quizMeta.title,
        'Das Quiz wurde vorbereitet. Der Start erfolgt gleich aus dem Admin-Fenster.',
        'neutral',
      );
    }

    if (state.gameStatus === 'paused') {
      return renderIntroState(
        'Pause',
        'Das Quiz ist kurz unterbrochen. Gleich geht es weiter.',
        'warning',
      );
    }

    switch (state.presentationView) {
      case 'question':
        return renderQuestionView(false);
      case 'answer':
        return renderQuestionView(true);
      case 'scores':
        return renderScoresView();
      case 'top3':
        return renderScoresView(3);
      case 'final':
        return renderFinalView();
      default:
        return renderBoardView();
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      <div className="ui-shell space-y-6">
        <header className="ui-panel border-slate-800 bg-slate-900 px-6 py-6 text-white">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div className="space-y-4">
              <StatusPill tone="dark" className="border border-slate-700 bg-slate-950">
                Praesentation
              </StatusPill>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.1em] text-slate-300">
                  localhost:3000/quiz
                </p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">
                  {quizMeta.title}
                </h1>
                <p className="mt-3 text-lg leading-7 text-slate-300">
                  {quizMeta.subtitle}
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
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Teams
                </p>
                <p className="mt-2 text-3xl font-bold">{state.teams.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Gespielt
                </p>
                <p className="mt-2 text-3xl font-bold">{answeredCount}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Admin
                </p>
                <Link
                  href="/"
                  className="mt-3 inline-flex text-sm font-semibold text-white no-underline"
                >
                  Zurueck zur Steuerung
                </Link>
              </div>
            </div>
          </div>
        </header>

        {renderMainView()}
      </div>
    </div>
  );
}

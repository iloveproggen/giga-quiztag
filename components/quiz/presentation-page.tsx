'use client';

import Link from 'next/link';
import {
  categories,
  getQuestionKey,
  quizMeta,
} from '@/components/quiz/config';
import { HydrationPlaceholder } from '@/components/quiz/ui';
import { useQuizStore } from '@/components/quiz/use-quiz-store';

function renderScoreValue(showScores: boolean, score: number) {
  return showScores ? score : '???';
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

  function renderBoardView() {
    return (
      <section className="dell-panel dell-shadow flex-1 overflow-hidden">
        <div className="border-b border-[var(--color-frame-ink)] bg-[var(--color-canvas)] px-[var(--space-lg)] py-[var(--space-md)]">
          <p className="font-dell-ui text-[20px] font-bold uppercase">
            Quizboard / Jeopardy
          </p>
        </div>

        <div className="grid gap-5 p-[var(--space-lg)]">
          {categories.map((category) => (
            <article
              key={category.id}
              className="dell-panel dell-shadow overflow-hidden"
            >
              <div className="border-b border-[var(--color-frame-ink)] bg-[var(--color-canvas)] px-[var(--space-md)] py-[var(--space-sm)]">
                <p className="font-dell-ui text-[18px] font-bold uppercase">
                  {category.name}
                </p>
              </div>

              <div
                className="grid gap-2 px-[var(--space-md)] py-[var(--space-md)] sm:grid-cols-3"
                style={{ backgroundColor: category.tint }}
              >
                {category.questions.map((question) => {
                  const isAnswered =
                    state.answered[getQuestionKey(category.id, question.id)];

                  return (
                    <div
                      key={question.id}
                      className="dell-panel flex min-h-[110px] flex-col justify-between bg-[var(--color-canvas)] px-[var(--space-md)] py-[var(--space-md)]"
                    >
                      <p className="font-dell-display text-[clamp(30px,4vw,54px)] leading-none">
                        {question.points}
                      </p>
                      <p className="font-dell-ui text-[14px] font-bold uppercase">
                        {isAnswered ? 'Beantwortet' : 'Offen'}
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
        <section className="dell-panel dell-shadow flex-1 overflow-hidden">
          <div
            className="flex h-full flex-col justify-center gap-6 px-[var(--space-section)] py-[var(--space-section)] text-center"
            style={{ backgroundColor: 'var(--color-tint-lime)' }}
          >
            <p className="font-dell-display text-[clamp(44px,7vw,96px)] leading-none uppercase">
              Naechste Frage kommt gleich
            </p>
            <p className="font-dell-body text-[clamp(20px,2vw,30px)] leading-[1.5]">
              Das Admin-Fenster waehlt gerade die naechste Kategorie, blendet
              eine Antwort ein oder wechselt zum Punktestand.
            </p>
          </div>
        </section>
      );
    }

    return (
      <section className="dell-panel dell-shadow flex-1 overflow-hidden">
        <div className="border-b border-[var(--color-frame-ink)] bg-[var(--color-canvas)] px-[var(--space-lg)] py-[var(--space-md)]">
          <p className="font-dell-ui text-[20px] font-bold uppercase">
            {showAnswer ? 'Antwortansicht' : 'Aktuelle Frage'}
          </p>
        </div>

        <div
          className="flex h-full flex-col justify-center gap-8 px-[var(--space-section)] py-[var(--space-section)] text-center"
          style={{ backgroundColor: selectedQuestion.categoryTint }}
        >
          <div>
            <p className="font-dell-ui text-[20px] font-bold uppercase">
              Kategorie
            </p>
            <p className="font-dell-display mt-4 text-[clamp(52px,8vw,120px)] leading-none uppercase">
              {selectedQuestion.categoryName}
            </p>
          </div>

          <div className="dell-panel dell-shadow mx-auto w-full max-w-[920px] px-[var(--space-xl)] py-[var(--space-xl)]">
            <p className="font-dell-ui text-[20px] font-bold uppercase">
              {showAnswer ? 'Frage' : 'Fragetext'}
            </p>
            <p className="font-dell-body mt-4 text-[clamp(24px,3vw,42px)] leading-[1.4]">
              {selectedQuestion.questionText}
            </p>
          </div>

          {selectedQuestion.options?.length ? (
            <div className="mx-auto grid w-full max-w-[920px] gap-3 md:grid-cols-2">
              {selectedQuestion.options.map((option) => (
                <div
                  key={option}
                  className="dell-panel dell-shadow bg-[var(--color-canvas)] px-[var(--space-lg)] py-[var(--space-md)]"
                >
                  <p className="font-dell-body text-[clamp(20px,2vw,32px)] leading-[1.4]">
                    {option}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {showAnswer ? (
            <div className="dell-panel dell-shadow mx-auto w-full max-w-[920px] px-[var(--space-xl)] py-[var(--space-xl)]">
              <p className="font-dell-ui text-[20px] font-bold uppercase">
                Antwort
              </p>
              <p className="font-dell-body mt-4 text-[clamp(24px,3vw,40px)] leading-[1.5]">
                {selectedQuestion.answerText}
              </p>
              {selectedQuestion.music ? (
                <p className="font-dell-body mt-4 text-[clamp(18px,2vw,26px)] leading-[1.5]">
                  {selectedQuestion.music.songTitle} – {selectedQuestion.music.artist}
                  {' '}| Clips: {selectedQuestion.music.clipLengths.join(', ')} Sekunden
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mx-auto grid w-full max-w-[920px] gap-4 lg:grid-cols-2">
            <div className="dell-panel dell-shadow bg-[var(--color-canvas)] px-[var(--space-xl)] py-[var(--space-lg)]">
              <p className="font-dell-ui text-[20px] font-bold uppercase">
                Punkte
              </p>
              <p className="font-dell-display mt-4 text-[clamp(64px,10vw,160px)] leading-none">
                {selectedQuestion.points}
              </p>
            </div>

            <div className="dell-panel dell-shadow bg-[var(--color-canvas)] px-[var(--space-xl)] py-[var(--space-lg)]">
              <p className="font-dell-ui text-[20px] font-bold uppercase">
                Antworttyp
              </p>
              <p className="font-dell-display mt-4 text-[clamp(28px,4vw,56px)] leading-none uppercase">
                {selectedQuestion.type}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderScoresView(limit?: number) {
    const items = typeof limit === 'number' ? ranking.slice(0, limit) : ranking;

    return (
      <section className="dell-panel dell-shadow flex-1 overflow-hidden">
        <div className="border-b border-[var(--color-frame-ink)] bg-[var(--color-canvas)] px-[var(--space-lg)] py-[var(--space-md)]">
          <p className="font-dell-ui text-[20px] font-bold uppercase">
            {limit === 3 ? 'Top 3' : 'Live-Punktestand'}
          </p>
        </div>

        <div
          className="grid h-full gap-4 p-[var(--space-lg)]"
          style={{ backgroundColor: 'var(--color-tint-steel)' }}
        >
          {items.map((team, index) => (
            <article
              key={team.id}
              className="dell-panel dell-shadow grid gap-4 bg-[var(--color-canvas)] px-[var(--space-xl)] py-[var(--space-lg)] lg:grid-cols-[120px_minmax(0,1fr)_220px] lg:items-center"
            >
              <p className="font-dell-display text-[clamp(36px,4vw,64px)] leading-none">
                #{index + 1}
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="dell-panel flex h-16 w-16 items-center justify-center"
                  style={{ backgroundColor: team.color }}
                >
                  <span className="font-dell-ui text-[24px] font-bold uppercase">
                    {team.icon || team.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-dell-ui text-[18px] font-bold uppercase">
                    {index === 0 ? 'Fuehrendes Team' : 'Im Rennen'}
                  </p>
                  <p className="font-dell-display mt-2 text-[clamp(32px,4vw,56px)] leading-none uppercase">
                    {team.name}
                  </p>
                </div>
              </div>
              <p className="font-dell-display text-right text-[clamp(40px,5vw,80px)] leading-none">
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
      <section className="dell-panel dell-shadow flex-1 overflow-hidden">
        <div className="border-b border-[var(--color-frame-ink)] bg-[var(--color-canvas)] px-[var(--space-lg)] py-[var(--space-md)]">
          <p className="font-dell-ui text-[20px] font-bold uppercase">
            Finalrunde / Stechen
          </p>
        </div>

        <div
          className="flex h-full flex-col justify-center gap-8 px-[var(--space-section)] py-[var(--space-section)] text-center"
          style={{ backgroundColor: 'var(--color-tint-peach)' }}
        >
          <div>
            <p className="font-dell-display text-[clamp(40px,6vw,88px)] leading-none uppercase">
              Musik-Buzzer-Duell
            </p>
            <p className="font-dell-body mt-4 text-[clamp(20px,2vw,30px)] leading-[1.5]">
              Zwei Personen treten gegeneinander an. Die Entscheidung erfolgt
              live durch den Quizmaster.
            </p>
          </div>

          {finalTeams.length > 0 ? (
            <div className="mx-auto grid w-full max-w-[980px] gap-4 lg:grid-cols-2">
              {finalTeams.map((team) => (
                <article
                  key={team.id}
                  className="dell-panel dell-shadow bg-[var(--color-canvas)] px-[var(--space-xl)] py-[var(--space-xl)]"
                >
                  <div
                    className="dell-panel mx-auto flex h-20 w-20 items-center justify-center"
                    style={{ backgroundColor: team.color }}
                  >
                    <span className="font-dell-ui text-[28px] font-bold uppercase">
                      {team.icon || team.name.charAt(0)}
                    </span>
                  </div>
                  <p className="font-dell-display mt-4 text-[clamp(30px,4vw,52px)] leading-none uppercase">
                    {team.name}
                  </p>
                  <p className="font-dell-body mt-3 text-[clamp(18px,2vw,26px)] leading-[1.5]">
                    {finalWinner?.id === team.id
                      ? 'Aktuell als Sieger gesetzt'
                      : 'Im Stechen aktiv'}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="dell-panel dell-shadow mx-auto w-full max-w-[760px] bg-[var(--color-canvas)] px-[var(--space-xl)] py-[var(--space-xl)]">
              <p className="font-dell-body text-[clamp(20px,2vw,30px)] leading-[1.5]">
                Das Admin-Fenster waehlt gerade die Teams fuer das Stechen aus.
              </p>
            </div>
          )}

          {finalWinner ? (
            <div className="dell-panel dell-shadow mx-auto w-full max-w-[760px] bg-[var(--color-canvas)] px-[var(--space-xl)] py-[var(--space-xl)]">
              <p className="font-dell-ui text-[20px] font-bold uppercase">
                Sieger
              </p>
              <p className="font-dell-display mt-4 text-[clamp(40px,6vw,88px)] leading-none uppercase">
                {finalWinner.name}
              </p>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  function renderMainView() {
    if (state.gameStatus === 'idle') {
      return (
        <section className="dell-panel dell-shadow flex-1 overflow-hidden">
          <div
            className="flex h-full flex-col justify-center gap-6 px-[var(--space-section)] py-[var(--space-section)] text-center"
            style={{ backgroundColor: 'var(--color-tint-salmon)' }}
          >
            <p className="font-dell-display text-[clamp(48px,8vw,110px)] leading-none uppercase">
              {quizMeta.title}
            </p>
            <p className="font-dell-ui text-[clamp(24px,3vw,40px)] font-bold uppercase">
              {quizMeta.subtitle}
            </p>
            <p className="font-dell-body text-[clamp(20px,2vw,30px)] leading-[1.5]">
              Das Admin-Fenster startet gleich das naechste Spiel.
            </p>
          </div>
        </section>
      );
    }

    if (state.gameStatus === 'paused') {
      return (
        <section className="dell-panel dell-shadow flex-1 overflow-hidden">
          <div
            className="flex h-full flex-col justify-center gap-6 px-[var(--space-section)] py-[var(--space-section)] text-center"
            style={{ backgroundColor: 'var(--color-tint-sky)' }}
          >
            <p className="font-dell-display text-[clamp(48px,8vw,110px)] leading-none uppercase">
              Pause
            </p>
            <p className="font-dell-body text-[clamp(20px,2vw,30px)] leading-[1.5]">
              Das Quiz ist kurz pausiert. Gleich geht es weiter.
            </p>
          </div>
        </section>
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
    <div className="min-h-screen bg-[var(--color-canvas)] p-6 md:p-8">
      <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-6">
        <header
          className="dell-panel dell-shadow px-[var(--space-xl)] py-[var(--space-lg)]"
          style={{
            backgroundColor: 'var(--color-frame-ink)',
            color: 'var(--color-canvas)',
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-dell-ui text-[18px] font-bold uppercase">
                LIVE / LOCALHOST:3000/QUIZ
              </p>
              <p className="font-dell-display mt-2 text-[clamp(40px,6vw,84px)] leading-none uppercase">
                {quizMeta.title}
              </p>
              <p className="font-dell-body mt-2 text-[clamp(18px,2vw,24px)] leading-[1.5]">
                {quizMeta.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="dell-shadow-sm border border-[var(--color-frame-ink)] bg-[var(--color-yellow-sticker)] px-[var(--space-md)] py-[var(--space-xs)]">
                <span className="font-dell-ui text-[16px] font-bold uppercase text-[var(--color-ink)]">
                  {state.presentationView}
                </span>
              </div>
              <div className="dell-shadow-sm border border-[var(--color-frame-ink)] bg-[var(--color-canvas)] px-[var(--space-md)] py-[var(--space-xs)]">
                <span className="font-dell-ui text-[16px] font-bold uppercase text-[var(--color-ink)]">
                  {state.gameStatus}
                </span>
              </div>
              <Link
                href="/"
                className="font-dell-ui text-[18px] font-bold uppercase text-[var(--color-primary)] no-underline"
              >
                Zurueck zum Admin
              </Link>
            </div>
          </div>
        </header>

        {renderMainView()}
      </div>
    </div>
  );
}

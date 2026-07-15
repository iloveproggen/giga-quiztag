import { getQuestionKey } from '@/components/quiz/config';
import { movieJeopardyCategories } from '@/components/quiz/presentation/subquiz-content';
import { StatusPill } from '@/components/quiz/ui';

export function MoviesSeriesView({
  answered,
}: {
  answered: Record<string, boolean>;
}) {
  const rowPoints = movieJeopardyCategories[0]?.questions.map((question) => question.points) ?? [];
  const answeredCount = movieJeopardyCategories.reduce(
    (count, category) =>
      count +
      category.questions.filter((question) =>
        Boolean(answered[getQuestionKey('filme-serien', question.id)]),
      ).length,
    0,
  );

  return (
    <section
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border text-white shadow-[0_1px_2px_rgba(15,23,42,0.16),0_10px_30px_rgba(15,23,42,0.2)]"
      style={{
        backgroundColor: '#0f172a',
        borderColor: '#1e293b',
      }}
    >
      <div className="shrink-0 border-b border-slate-800 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
          Filme & Serien
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
          9 x 3 Jeopardy-Board
        </h2>
        <p className="mt-2 max-w-4xl text-base leading-7 text-slate-400">
          Die Runde wird als einfache Tabelle gezeigt: Kategorien als Spalten,
          Punktstufen als Zeilen.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill tone="dark">9 x 3 Board</StatusPill>
          <StatusPill>{movieJeopardyCategories.length} Kategorien</StatusPill>
          <StatusPill>{rowPoints.length} Reihen</StatusPill>
          <StatusPill>{answeredCount} erledigt</StatusPill>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
        <div
          className="grid h-full min-h-0 auto-rows-fr gap-3"
          style={{
            gridTemplateColumns: `96px repeat(${movieJeopardyCategories.length}, minmax(0, 1fr))`,
          }}
        >
          <div
            className="flex items-center justify-center rounded-[20px] border px-3 py-3 text-center"
            style={{
              backgroundColor: '#020617',
              borderColor: '#1e293b',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              Punkte
            </p>
          </div>

          {movieJeopardyCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-center rounded-[20px] border px-3 py-3 text-center"
              style={{
                backgroundColor: '#020617',
                borderColor: '#1e293b',
              }}
            >
              <p className="text-base font-semibold tracking-tight text-white">
                {category.label}
              </p>
            </div>
          ))}

          {rowPoints.map((points, rowIndex) => (
            <div key={`movie-row-${points}`} className="contents">
              <div
                className="flex flex-col items-center justify-center rounded-[20px] border px-3 py-3 text-center"
                style={{
                  backgroundColor: '#020617',
                  borderColor: '#1e293b',
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Frage
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-white">
                  {points}
                </p>
              </div>

              {movieJeopardyCategories.map((category) => {
                const question = category.questions[rowIndex];

                if (!question) {
                  return (
                    <div
                      key={`${category.id}-empty-${points}`}
                      className="rounded-[20px] border border-dashed"
                      style={{
                        backgroundColor: '#020617',
                        borderColor: '#1e293b',
                      }}
                    />
                  );
                }

                const done = Boolean(
                  answered[getQuestionKey('filme-serien', question.id)],
                );

                return (
                  <div
                    key={question.id}
                    className="flex flex-col items-center justify-center rounded-[20px] border px-3 py-3 text-center"
                    style={{
                      backgroundColor: done ? '#064e3b' : '#020617',
                      borderColor: done ? '#34d399' : '#1e293b',
                    }}
                  >
                    {done ? (
                      <StatusPill tone="success" className="mb-2">
                        Erledigt
                      </StatusPill>
                    ) : null}
                    <p className="text-base font-semibold tracking-tight text-white">
                      {question.category}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

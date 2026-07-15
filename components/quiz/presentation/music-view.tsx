import { getQuestionKey } from '@/components/quiz/config';
import { musicDecades } from '@/components/quiz/presentation/subquiz-content';
import { StatusPill } from '@/components/quiz/ui';

export function MusicView({
  answered,
}: {
  answered: Record<string, boolean>;
}) {
  const rowCount = Math.max(...musicDecades.map((decade) => decade.questions.length));
  const answeredCount = musicDecades.reduce(
    (count, decade) =>
      count +
      decade.questions.filter((question) =>
        Boolean(answered[getQuestionKey('musik', question.id)]),
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
          Musik
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Jahrzehnte & Clip-Laengen
        </h2>
        <p className="mt-2 max-w-4xl text-base leading-7 text-slate-400">
          Die Musikrunde wird als einfache Tabelle gezeigt: Jahrzehnte als Spalten,
          Song-Slots als Zeilen.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill tone="dark">3 / 7 / 15 Sekunden</StatusPill>
          <StatusPill>{musicDecades.length} Jahrzehnte</StatusPill>
          <StatusPill>{rowCount} Slots</StatusPill>
          <StatusPill>{answeredCount} erledigt</StatusPill>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
        <div
          className="grid h-full min-h-0 auto-rows-fr gap-3"
          style={{
            gridTemplateColumns: `96px repeat(${musicDecades.length}, minmax(0, 1fr))`,
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
              Slot
            </p>
          </div>

          {musicDecades.map((decade) => (
            <div
              key={decade.id}
              className="flex items-center justify-center rounded-[20px] border px-3 py-3 text-center"
              style={{
                backgroundColor: '#020617',
                borderColor: '#1e293b',
              }}
            >
              <p className="text-lg font-semibold tracking-tight text-white">
                {decade.label}
              </p>
            </div>
          ))}

          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <div key={`music-row-${rowIndex + 1}`} className="contents">
              <div
                className="flex flex-col items-center justify-center rounded-[20px] border px-3 py-3 text-center"
                style={{
                  backgroundColor: '#020617',
                  borderColor: '#1e293b',
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Song
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-white">
                  {rowIndex + 1}
                </p>
              </div>

              {musicDecades.map((decade) => {
                const question = decade.questions[rowIndex];

                if (!question) {
                  return (
                    <div
                      key={`${decade.id}-empty-${rowIndex + 1}`}
                      className="rounded-[20px] border border-dashed"
                      style={{
                        backgroundColor: '#020617',
                        borderColor: '#1e293b',
                      }}
                    />
                  );
                }

                const done = Boolean(answered[getQuestionKey('musik', question.id)]);

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
                    {done ? (
                      <>
                        <p className="text-base font-semibold tracking-tight text-white">
                          {question.songTitle}
                        </p>
                        <p className="mt-1 text-sm text-slate-200">
                          {question.artist}
                        </p>
                      </>
                    ) : (
                      <p className="text-base font-semibold tracking-tight text-white">
                        {question.category}
                      </p>
                    )}
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

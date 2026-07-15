import { getQuestionKey } from '@/components/quiz/config';
import { generalKnowledgeSections } from '@/components/quiz/presentation/subquiz-content';
import { StatusPill } from '@/components/quiz/ui';

export function GeneralKnowledgeView({
  answered,
}: {
  answered: Record<string, boolean>;
}) {
  const rowCount = Math.max(...generalKnowledgeSections.map((section) => section.items.length));
  const answeredCount = generalKnowledgeSections.reduce(
    (count, section) =>
      count +
      section.items.filter((item) =>
        Boolean(answered[getQuestionKey('allgemeinwissen', item.id)]),
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
          Allgemeinwissen
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Personen, Kunstwerke & Sehenswuerdigkeiten
        </h2>
        <p className="mt-2 max-w-4xl text-base leading-7 text-slate-400">
          Die Runde wird als einfache Tabelle gezeigt: drei Spalten fuer die Bereiche,
          die Zeilen stehen fuer die einzelnen Slots.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill tone="dark">Pixel / Zoom</StatusPill>
          <StatusPill>{generalKnowledgeSections.length} Bereiche</StatusPill>
          <StatusPill>{rowCount} Slots</StatusPill>
          <StatusPill>{answeredCount} erledigt</StatusPill>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
        <div
          className="grid h-full min-h-0 auto-rows-fr gap-3"
          style={{
            gridTemplateColumns: `96px repeat(${generalKnowledgeSections.length}, minmax(0, 1fr))`,
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

          {generalKnowledgeSections.map((section) => (
            <div
              key={section.id}
              className="flex items-center justify-center rounded-[20px] border px-3 py-3 text-center"
              style={{
                backgroundColor: '#020617',
                borderColor: '#1e293b',
              }}
            >
              <p className="text-lg font-semibold tracking-tight text-white">
                {section.title}
              </p>
            </div>
          ))}

          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <div key={`general-row-${rowIndex + 1}`} className="contents">
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
                  {rowIndex + 1}
                </p>
              </div>

              {generalKnowledgeSections.map((section) => {
                const item = section.items[rowIndex];

                if (!item) {
                  return (
                    <div
                      key={`${section.id}-empty-${rowIndex + 1}`}
                      className="rounded-[20px] border border-dashed"
                      style={{
                        backgroundColor: '#020617',
                        borderColor: '#1e293b',
                      }}
                    />
                  );
                }

                const done = Boolean(
                  answered[getQuestionKey('allgemeinwissen', item.id)],
                );

                return (
                  <div
                    key={item.id}
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
                      {section.title}
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

import { StatusPill } from '@/components/quiz/ui';

export type SubquizOverviewTile = {
  id: string;
  category: string;
  answered: boolean;
};

export function SubquizOverview({
  eyebrow,
  title,
  description,
  detail,
  tiles,
  columns,
}: {
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  tiles: SubquizOverviewTile[];
  columns: number;
}) {
  const uniqueCategories = [...new Set(tiles.map((tile) => tile.category))];

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
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">{title}</h2>
        <p className="mt-2 max-w-4xl text-base leading-7 text-slate-400">
          {description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatusPill tone="dark">{detail}</StatusPill>
          <StatusPill>{uniqueCategories.length} Kategorien</StatusPill>
          <StatusPill>{tiles.length} Fragen</StatusPill>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
        <div
          className="grid h-full min-h-0 auto-rows-fr gap-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {tiles.map((tile) => (
            <article
              key={tile.id}
              className="rounded-[28px] border text-white shadow-[0_1px_2px_rgba(15,23,42,0.2),0_10px_30px_rgba(15,23,42,0.24)]"
              style={{
                backgroundColor: tile.answered ? '#064e3b' : '#020617',
                borderColor: tile.answered ? '#34d399' : '#1e293b',
              }}
            >
              <div className="flex h-full flex-col items-center justify-center px-4 py-4 text-center">
                {tile.answered ? (
                  <StatusPill tone="success" className="mb-3">
                    Erledigt
                  </StatusPill>
                ) : null}
                <p className="text-lg font-semibold tracking-tight text-white 2xl:text-xl">
                  {tile.category}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

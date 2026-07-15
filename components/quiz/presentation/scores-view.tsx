import type { Team } from '@/components/quiz/config';
import { TeamAvatar } from '@/components/quiz/ui';
import { renderScoreValue } from '@/components/quiz/presentation/presentation-utils';

export function ScoresView({
  ranking,
  showScores,
  limit,
}: {
  ranking: Team[];
  showScores: boolean;
  limit?: number;
}) {
  const items = typeof limit === 'number' ? ranking.slice(0, limit) : ranking;
  const hideScoreValue = limit === 3;

  return (
    <section className="ui-panel flex h-full min-h-0 flex-col overflow-hidden border-slate-800 bg-slate-900 text-white">
      <div className="shrink-0 border-b border-slate-800 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
          {limit === 3 ? 'Top 3' : 'Live-Punktestand'}
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          {limit === 3 ? 'Fuehrende Teams' : 'Ranking'}
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
        <div className="grid h-full min-h-0 gap-4">
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

              {!hideScoreValue ? (
                <p className="text-right text-4xl font-bold tracking-tight text-white md:text-5xl">
                  {renderScoreValue(showScores, team.score)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

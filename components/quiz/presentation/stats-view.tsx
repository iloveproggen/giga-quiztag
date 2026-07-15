import type { PresentationView, SubquizView, Team } from '@/components/quiz/config';
import { TeamAvatar, StatusPill } from '@/components/quiz/ui';
import {
  formatPresentationViewLabel,
  renderScoreValue,
} from '@/components/quiz/presentation/presentation-utils';

function getFocusLabel(
  activeSubquiz: SubquizView | null,
  presentationView: PresentationView,
) {
  if (activeSubquiz) {
    return formatPresentationViewLabel(activeSubquiz);
  }

  return formatPresentationViewLabel(presentationView);
}

export function StatsView({
  ranking,
  showScores,
  answeredCount,
  remainingQuestions,
  totalQuestions,
  activeSubquiz,
  presentationView,
}: {
  ranking: Team[];
  showScores: boolean;
  answeredCount: number;
  remainingQuestions: number;
  totalQuestions: number;
  activeSubquiz: SubquizView | null;
  presentationView: PresentationView;
}) {
  const focusLabel = getFocusLabel(activeSubquiz, presentationView);
  const progress =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const topThree = ranking.slice(0, 3);

  return (
    <section className="ui-panel flex h-full min-h-0 flex-col overflow-hidden border-slate-800 bg-slate-900 text-white">
      <div className="shrink-0 border-b border-slate-800 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <StatusPill tone="warning">Pause</StatusPill>
            <h2 className="mt-4 text-4xl font-bold tracking-tight">Live-Stats</h2>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-300">
              Fortschritt, Teams und aktueller Fokus auf einen Blick.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-800 bg-slate-950 px-6 py-5 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Fortschritt
            </p>
            <p className="mt-2 text-5xl font-bold tracking-tight text-white">
              {progress}%
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {answeredCount} von {totalQuestions} Fragen gespielt
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
        <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="grid min-h-0 gap-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="ui-panel rounded-[28px] border-slate-800 bg-slate-950 px-5 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Gespielt
                </p>
                <p className="mt-3 text-4xl font-bold tracking-tight">{answeredCount}</p>
              </article>
              <article className="ui-panel rounded-[28px] border-slate-800 bg-slate-950 px-5 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Offen
                </p>
                <p className="mt-3 text-4xl font-bold tracking-tight">{remainingQuestions}</p>
              </article>
              <article className="ui-panel rounded-[28px] border-slate-800 bg-slate-950 px-5 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Teams
                </p>
                <p className="mt-3 text-4xl font-bold tracking-tight">{ranking.length}</p>
              </article>
              <article className="ui-panel rounded-[28px] border-slate-800 bg-slate-950 px-5 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Aktives Modul
                </p>
                <p className="mt-3 text-2xl font-bold tracking-tight">{focusLabel}</p>
              </article>
            </div>

            <div className="ui-panel flex min-h-0 flex-col rounded-[28px] border-slate-800 bg-slate-950 px-6 py-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Fuehrende Teams
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight">Top 3 im Rennen</h3>
                </div>
                <StatusPill>{showScores ? 'Scores sichtbar' : 'Scores verborgen'}</StatusPill>
              </div>

              <div className="mt-5 grid min-h-0 flex-1 gap-3">
                {topThree.map((team, index) => (
                  <article
                    key={team.id}
                    className="ui-panel flex items-center justify-between gap-4 rounded-[24px] border-slate-800 bg-slate-900 px-5 py-4 text-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold tracking-tight text-slate-400">
                        #{index + 1}
                      </div>
                      <TeamAvatar
                        size="default"
                        color={team.color}
                        label={team.icon || team.name.charAt(0)}
                      />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                          {index === 0 ? 'Fuehrend' : 'Verfolger'}
                        </p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-white">
                          {team.name}
                        </p>
                      </div>
                    </div>

                    <p className="text-3xl font-bold tracking-tight text-white">
                      {renderScoreValue(showScores, team.score)}
                    </p>
                  </article>
                ))}

                {topThree.length === 0 ? (
                  <div className="ui-panel flex min-h-[180px] items-center justify-center rounded-[24px] border-slate-800 bg-slate-900 px-6 py-6 text-center text-slate-400">
                    Noch keine Teams im Ranking.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid min-h-0 gap-4">
            <div className="ui-panel rounded-[28px] border-slate-800 bg-slate-950 px-6 py-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Stand des Spiels
              </p>
              <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-[24px] border border-slate-800 bg-slate-900 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Bereits gespielt
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                    {answeredCount}
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-800 bg-slate-900 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    Noch offen
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                    {remainingQuestions}
                  </p>
                </div>
              </div>
            </div>

            <div className="ui-panel flex min-h-0 flex-col rounded-[28px] border-slate-800 bg-slate-950 px-6 py-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Aktueller Fokus
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                {focusLabel}
              </p>
              <p className="mt-3 text-base leading-7 text-slate-400">
                Nutze die Pause, um das naechste Modul vorzubereiten, Punkte zu pruefen oder direkt mit der naechsten Frage weiterzumachen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

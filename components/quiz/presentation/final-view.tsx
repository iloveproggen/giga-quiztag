import type { Team } from '@/components/quiz/config';
import { StatusPill, TeamAvatar } from '@/components/quiz/ui';

export function FinalView({
  finalTeams,
  finalWinner,
}: {
  finalTeams: Team[];
  finalWinner: Team | null;
}) {
  return (
    <section className="ui-panel flex h-full min-h-0 flex-col overflow-hidden border-slate-800 bg-slate-900 text-white">
      <div className="shrink-0 border-b border-slate-800 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
          Finalrunde
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          Musik-Buzzer-Duell
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
        <div className="flex h-full min-h-0 flex-col gap-6">
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
      </div>
    </section>
  );
}

import type { Team } from '@/components/quiz/config';
import { StatusPill, TeamAvatar } from '@/components/quiz/ui';

export function IntroView({
  title,
  message,
  tone,
  teams = [],
}: {
  title: string;
  message: string;
  tone: 'neutral' | 'warning';
  teams?: Team[];
}) {
  return (
    <section className="ui-panel flex h-full min-h-0 items-center justify-center overflow-hidden border-slate-800 bg-slate-900 px-8 py-10 text-white">
      <div className="max-w-5xl text-center">
        <StatusPill tone={tone}>{tone === 'warning' ? 'Pause' : 'Bereit'}</StatusPill>
        <h2 className="mt-5 text-5xl font-bold tracking-tight">{title}</h2>
        <p className="mt-4 text-xl leading-8 text-slate-300">{message}</p>

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-400">
            Aktuelle Teams
          </p>

          {teams.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="ui-panel flex items-center gap-4 rounded-[28px] border-slate-800 bg-slate-950 px-5 py-4 text-left text-white"
                >
                  <TeamAvatar
                    size="small"
                    color={team.color}
                    label={team.icon || team.name.charAt(0)}
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Team
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight text-white">
                      {team.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-base leading-7 text-slate-400">
              Es wurden noch keine Teams angelegt. Erstelle sie jetzt im
              Admin-Panel.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

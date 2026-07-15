import type { Team } from '@/components/quiz/config';
import { TeamAvatar } from '@/components/quiz/ui';
import { type TeamDraft } from '@/components/quiz/admin/shared';

export function TeamsPage({
  teams,
  teamDrafts,
  updateDraft,
  saveTeam,
  onAddTeam,
  onDeleteAllTeams,
  onDeleteTeam,
  onOpenQuizzes,
}: {
  teams: Team[];
  teamDrafts: Record<string, TeamDraft>;
  updateDraft: (team: Team, updates: Partial<TeamDraft>) => void;
  saveTeam: (team: Team) => void;
  onAddTeam: () => void;
  onDeleteAllTeams: () => void;
  onDeleteTeam: (teamId: string) => void;
  onOpenQuizzes: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="ui-panel grid gap-6 px-6 py-6">
      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex flex-wrap gap-3">
          <button className="rounded-lg px-5 py-3 text-left bg-slate-900 text-white font-bold" onClick={onAddTeam}>+</button>
          <button className="rounded-lg px-5 py-3 text-left border border-red-900 text-red-900 font-bold" onClick={onDeleteAllTeams}>Alle löschen</button>
        </div>
            <button className="rounded-lg px-5 py-3 text-left bg-slate-900 text-white font-bold" onClick={onOpenQuizzes}>
              Weiter zu Quizzes {'>'}
            </button>
          </div>
        {teams.length === 0 ? (
          <div className="mt-5 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-5 py-5">
            <p className="text-lg font-semibold tracking-tight text-slate-950">
              Noch keine Teams angelegt
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          {teams.map((team, index) => {
            const draft = teamDrafts[team.id] ?? {
              name: team.name,
              color: team.color ?? '#d77a7a',
              icon: team.icon ?? 'T',
              members: (team.members ?? []).join(', '),
            };

            return (
              <article key={team.id} className="ui-panel rounded-3xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <TeamAvatar
                      color={draft.color}
                      label={draft.icon || team.name.charAt(0)}
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Team {index + 1}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        {team.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Punkte
                    </p>
                    <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                      {team.score}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Teamname
                    </span>
                    <input
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                      value={draft.name}
                      onChange={(event) =>
                        updateDraft(team, { name: event.target.value })
                      }
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Team-Icon
                    </span>
                    <input
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                      value={draft.icon}
                      onChange={(event) =>
                        updateDraft(team, { icon: event.target.value })
                      }
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Farbe
                    </span>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        className="h-10 w-10 rounded-md "
                        value={draft.color}
                        onChange={(event) =>
                          updateDraft(team, { color: event.target.value })
                        }
                      />
                      <input
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                        value={draft.color}
                        onChange={(event) =>
                          updateDraft(team, { color: event.target.value })
                        }
                      />
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Mitglieder
                    </span>
                    <input
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                      value={draft.members}
                      placeholder="Anna, Ben, Chris"
                      onChange={(event) =>
                        updateDraft(team, { members: event.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button 
                  className="mt-4 rounded-lg px-5 py-3 text-left text-white bg-slate-800 font-bold"
                  onClick={() => saveTeam(team)}>
                    Mitglieder speichern
                  </button>
                  <button
                    className="mt-4 rounded-lg px-5 py-3 text-left text-red-900 border-slate-900 font-bold"
                    onClick={() => onDeleteTeam(team.id)}
                  >
                    Team löschen
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

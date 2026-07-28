import type { Team } from '@/components/quiz/config';
import { StatusPill, TeamAvatar } from '@/components/quiz/ui';

export function TeamsPage({
  teams,
  isBuzzerSignupOverlayVisible,
  onToggleBuzzerSignupOverlay,
  onDeleteAllTeams,
  onDeleteTeam,
  onOpenQuizzes,
}: {
  teams: Team[];
  isBuzzerSignupOverlayVisible: boolean;
  onToggleBuzzerSignupOverlay: (isVisible: boolean) => void;
  onDeleteAllTeams: () => void;
  onDeleteTeam: (teamId: string) => void;
  onOpenQuizzes: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="ui-panel grid gap-6 px-6 py-6">
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="dark">/buzzer</StatusPill>
              <StatusPill>{teams.length} Teams</StatusPill>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Teams registrieren sich selbst ueber ihr Handy auf <span className="font-bold">/buzzer</span>{' '}
              und waehlen dort Name, Emoji und Farbe.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={isBuzzerSignupOverlayVisible}
                onChange={(event) =>
                  onToggleBuzzerSignupOverlay(event.currentTarget.checked)}
              />
              QR-Overlay in Praesentation anzeigen
            </label>
            <button
              className="rounded-lg border border-red-900 px-5 py-3 text-left font-bold text-red-900"
              onClick={onDeleteAllTeams}
            >
              Alle loeschen
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="rounded-lg bg-slate-900 px-5 py-3 text-left font-bold text-white"
            onClick={onOpenQuizzes}
          >
            Weiter zu Quizzes {'>'}
          </button>
        </div>

        {teams.length === 0 ? (
          <div className="mt-5 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-5 py-5">
            <p className="text-lg font-semibold tracking-tight text-slate-950">
              Noch keine Teams registriert
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sobald ein Team sein Profil auf dem Handy speichert, erscheint es hier.
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-2">
          {teams.map((team, index) => {
            return (
              <article key={team.id} className="ui-panel rounded-3xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <TeamAvatar
                      color={team.color}
                      label={team.icon || team.name.charAt(0)}
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

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Emoji
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {team.icon ?? '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Farbe
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className="h-8 w-8 rounded-full border border-slate-200"
                        style={{ backgroundColor: team.color ?? '#d77a7a' }}
                      />
                      <p className="text-sm font-semibold text-slate-950">
                        {team.color ?? '#d77a7a'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Team-ID
                    </p>
                    <p className="mt-2 break-all text-sm font-semibold text-slate-950">
                      {team.id}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg px-5 py-3 text-left font-bold text-red-900"
                    onClick={() => onDeleteTeam(team.id)}
                  >
                    Team loeschen
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

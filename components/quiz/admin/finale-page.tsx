import type { Team } from '@/components/quiz/config';
import { FrameButton, MetricCard, SectionCard, TeamAvatar } from '@/components/quiz/ui';

export function FinalePage({
  teams,
  finalTeams,
  finalWinner,
  onSetPresentationFinal,
  onClearFinalMode,
  onSetFinalTeams,
  onChooseFinalWinner,
}: {
  teams: Team[];
  finalTeams: Team[];
  finalWinner: Team | null;
  onSetPresentationFinal: () => void;
  onClearFinalMode: () => void;
  onSetFinalTeams: (teamIds: string[]) => void;
  onChooseFinalWinner: (teamId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Finale / Stechen"
        subtitle="Wähle die Finalteams, schalte die Praesi auf Finale und setze den Sieger."
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              {teams.map((team) => {
                const isSelected = finalTeams.some((entry) => entry.id === team.id);

                return (
                  <label
                    key={team.id}
                    className="ui-panel flex items-center gap-3 rounded-3xl border border-slate-200 px-4 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...finalTeams.map((entry) => entry.id), team.id]
                          : finalTeams
                              .map((entry) => entry.id)
                              .filter((id) => id !== team.id);
                        onSetFinalTeams(next);
                      }}
                    />
                    <TeamAvatar
                      size="small"
                      color={team.color}
                      label={team.icon || team.name.charAt(0)}
                    />
                    <span className="text-sm font-medium text-slate-800">
                      {team.name}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <FrameButton onClick={onSetPresentationFinal}>
                Finale anzeigen
              </FrameButton>
              <FrameButton variant="secondary" onClick={onClearFinalMode}>
                Finale zurücksetzen
              </FrameButton>
            </div>

            {finalTeams.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {finalTeams.map((team) => (
                  <div
                    key={team.id}
                    className="ui-panel rounded-3xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <TeamAvatar
                        color={team.color}
                        label={team.icon || team.name.charAt(0)}
                      />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                          Finalteam
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-950">
                          {team.name}
                        </p>
                      </div>
                    </div>
                    <FrameButton
                      className="mt-4 w-full"
                      onClick={() => onChooseFinalWinner(team.id)}
                    >
                      Als Sieger setzen
                    </FrameButton>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <MetricCard
              label="Finalteams"
              value={finalTeams.length}
              helper="Anzahl der ausgewählten Teams für das Stechen."
            />
            <MetricCard
              label="Gesetzter Sieger"
              value={finalWinner ? finalWinner.name : 'Noch keiner'}
              helper="Der Sieger wird sofort in der Praesentation angezeigt."
            />
            <SectionCard title="Ablauf">
              <ol className="space-y-2 text-sm leading-6 text-slate-700">
                <li>1. Finalteams ankreuzen.</li>
                <li>2. Praesentation auf Finale schalten.</li>
                <li>3. Gewinner manuell setzen.</li>
              </ol>
            </SectionCard>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

import type { Team } from '@/components/quiz/config';
import { FrameButton, SectionCard, TeamAvatar } from '@/components/quiz/ui';

export function ScoresPage({
  ranking,
  showScores,
  onShowScores,
  onShowTop3,
  onToggleScores,
  onResetScores,
  onOpenFinale,
  onAdjustScore,
}: {
  ranking: Team[];
  showScores: boolean;
  onShowScores: () => void;
  onShowTop3: () => void;
  onToggleScores: () => void;
  onResetScores: () => void;
  onOpenFinale: () => void;
  onAdjustScore: (teamId: string, delta: number) => void;
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Punktestand"
        subtitle="Live-Anzeige steuern und bei Bedarf manuelle Korrekturen ausführen."
      >
        <div className="flex flex-wrap gap-2">
          <FrameButton onClick={onShowScores}>Punktestand anzeigen</FrameButton>
          <FrameButton variant="secondary" onClick={onShowTop3}>
            Top 3 anzeigen
          </FrameButton>
          <FrameButton variant="secondary" onClick={onToggleScores}>
            Punkte {showScores ? 'verbergen' : 'anzeigen'}
          </FrameButton>
          <FrameButton variant="secondary" onClick={onResetScores}>
            Punkte resetten
          </FrameButton>
          <FrameButton variant="secondary" onClick={onOpenFinale}>
            Finale vorbereiten
          </FrameButton>
        </div>

        <div className="mt-5 space-y-3">
          {ranking.map((team, index) => (
            <article
              key={team.id}
              className="ui-panel flex flex-col gap-4 rounded-3xl border border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <TeamAvatar
                    size="small"
                    color={team.color}
                    label={team.icon || team.name.charAt(0)}
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Platz {index + 1}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {team.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <p className="min-w-[80px] text-right text-3xl font-bold tracking-tight text-slate-950">
                  {showScores ? team.score : '???'}
                </p>
                <FrameButton
                  variant="secondary"
                  size="compact"
                  onClick={() => onAdjustScore(team.id, -100)}
                >
                  -100
                </FrameButton>
                <FrameButton
                  variant="secondary"
                  size="compact"
                  onClick={() => onAdjustScore(team.id, 100)}
                >
                  +100
                </FrameButton>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

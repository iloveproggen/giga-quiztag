import type { BuzzerState } from '@/components/quiz/config';
import { StatusPill, TeamAvatar } from '@/components/quiz/ui';

export function BuzzerOverlay({ buzzer }: { buzzer: BuzzerState }) {
  if (!buzzer.isEnabled) {
    return null;
  }

  return (
    <section className="ui-panel border-2 border-amber-400 bg-amber-50 px-6 py-5 text-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="warning">Buzzer aktiv</StatusPill>
            {buzzer.winner ? (
              <StatusPill tone="danger">Erster Buzz steht fest</StatusPill>
            ) : null}
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            {buzzer.winner ? 'Erstes Team am Buzzer' : 'Warte auf den ersten Buzz'}
          </h2>
          <p className="mt-2 text-base leading-7 text-slate-700">
            {buzzer.winner
              ? 'Der Teamname bleibt sichtbar, bis der Buzzer im Admin-Panel zurueckgesetzt wird.'
              : 'Sobald ein Team drueckt, erscheint es hier gross auf der Leinwand.'}
          </p>
        </div>

        {buzzer.winner ? (
          <div className="rounded-[28px] border border-amber-300 bg-white px-5 py-5 shadow-sm">
            <div className="flex items-center gap-4">
              <TeamAvatar
                color={buzzer.winner.teamColor}
                label={buzzer.winner.teamIcon ?? buzzer.winner.teamName.charAt(0)}
                size="large"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Erstes Team
                </p>
                <p className="mt-1 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
                  {buzzer.winner.teamName}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-amber-300 bg-white/70 px-5 py-5">
            <p className="text-xl font-semibold text-slate-700">
              Noch kein Team hat gebuzzert.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

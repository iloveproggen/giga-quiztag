import type { GameEvent } from '@/components/quiz/config';
import { SectionCard } from '@/components/quiz/ui';
import { formatTimestamp } from '@/components/quiz/admin/shared';

export function HistoryPage({
  gameEvents,
}: {
  gameEvents: GameEvent[];
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Verlauf"
        subtitle="Letzte Aktionen im Quiz, zuletzt oben."
      >
        <div className="space-y-2">
          {gameEvents.length === 0 ? (
            <p className="text-sm text-slate-600">Noch keine Ereignisse gespeichert.</p>
          ) : (
            [...gameEvents].reverse().map((event) => (
              <div
                key={event.id}
                className="ui-panel rounded-2xl border border-slate-200 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    {event.label}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">{event.note}</p>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}

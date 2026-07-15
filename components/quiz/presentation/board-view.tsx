import { StatusPill } from '@/components/quiz/ui';
import { subquizModules } from '@/components/quiz/presentation/subquiz-content';

export function BoardView() {
  return (
    <section className="ui-panel flex h-full min-h-0 flex-col overflow-hidden border-slate-800 bg-slate-900 text-white">
      <div className="shrink-0 border-b border-slate-800 px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
          Quizstruktur
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Unterquizze</h2>
        <p className="mt-2 text-base leading-7 text-slate-400">
          Das Quiz ist in mehrere eigenstaendige Module aufgeteilt, die im
          Admin-Panel gezielt angesteuert werden.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 gap-5 overflow-hidden p-6 xl:grid-cols-2">
        {subquizModules.map((module) => (
          <article
            key={module.id}
            className="ui-panel flex min-h-0 flex-col overflow-hidden border-slate-800 bg-slate-950 text-white"
          >
            <div className="flex h-full flex-col justify-between gap-6 px-5 py-5">
              <div>
                <StatusPill tone="dark">{module.detail}</StatusPill>
                <h3 className="mt-4 text-2xl font-bold tracking-tight">
                  {module.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {module.description}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Navigation
                </p>
                <p className="mt-2 text-base leading-7 text-slate-300">
                  Dieses Modul wird ueber die neue Unterquiz-Steuerung im
                  Admin-Panel angezeigt.
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

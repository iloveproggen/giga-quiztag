import type { PresentationView } from '@/components/quiz/config';
import { formatPresentationViewLabel } from '@/components/quiz/presentation/presentation-utils';

export function DashboardPage({
  title,
  subtitle,
  presentationView,
  answeredCount,
  remainingQuestions,
  totalQuestions,
  onNewGame,
  onResumeGame,
}: {
  title: string;
  subtitle: string;
  presentationView: PresentationView;
  answeredCount: number;
  remainingQuestions: number;
  totalQuestions: number;
  onNewGame: () => void;
  onResumeGame: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="ui-panel grid gap-6 px-6 py-6">
        <div className="space-y-5">
          <div className="space-y-3">
            <div>
              <h1 className="text-4xl font-bold">{title}</h1>
              <p className="mt-3 text-lg font-medium text-slate-600 md:text-xl">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <button className="rounded-lg px-5 py-3 text-left bg-slate-900 text-white font-bold"
              onClick={onNewGame}
            >
              Neues Spiel starten
            </button>
            <button className="rounded-lg px-5 py-3 text-left bg-slate-100 text-slate-900 border border-slate-900 font-bold"
              onClick={onResumeGame}
            >
              Spiel fortsetzen
            </button>
          </div>
        </div>
      </section>
      <section className="ui-panel grid gap-6 px-6 py-6">
        <h1 className="text-4xl font-bold">Stats</h1>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <p className="text-2xl">Fragen beantwortet: {answeredCount}</p>
          <p className="text-2xl">Verbleibende Fragen: {remainingQuestions}</p>
          <p className="text-2xl">Gesamtfragen: {totalQuestions}</p>
          <p className="text-2xl">
            Aktuelles Modul: {formatPresentationViewLabel(presentationView)}
          </p>
        </div>
      </section>
    </div>
  );
}
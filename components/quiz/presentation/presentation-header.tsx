import type { GameStatus, PresentationView } from '@/components/quiz/config';
import { StatusPill } from '@/components/quiz/ui';
import {
  formatPresentationViewLabel,
  getStatusTone,
} from '@/components/quiz/presentation/presentation-utils';

export function PresentationHeader({
  title,
  subtitle,
  gameStatus,
  presentationView,
  remainingQuestions,
}: {
  title: string;
  subtitle: string;
  gameStatus: GameStatus;
  presentationView: PresentationView;
  remainingQuestions: number;
}) {
  return (
    <header className="ui-panel border-slate-800 bg-slate-900 px-6 py-6 text-white">
      <div>
        <div className="space-y-4">
          <StatusPill tone="dark" className="border border-slate-700 bg-slate-950">
            Praesentation
          </StatusPill>

          <div>
            <h1 className="mt-2 text-4xl font-bold text-white md:text-6xl">
              {title}
            </h1>
            <p className="mt-3 text-lg leading-7 text-slate-300">{subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusPill tone={getStatusTone(gameStatus)}>{gameStatus}</StatusPill>
            <StatusPill>{formatPresentationViewLabel(presentationView)}</StatusPill>
            <StatusPill>{remainingQuestions} offen</StatusPill>
          </div>
        </div>
      </div>
    </header>
  );
}

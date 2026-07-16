import type { BuzzerState, PresentationView } from '@/components/quiz/config';
import { StatusPill, TeamAvatar } from '@/components/quiz/ui';
import { formatPresentationViewLabel } from '@/components/quiz/presentation/presentation-utils';
import { generateBuzzerQRCode } from '@/components/quiz/utils/generateBuzzerQRCode';

export function DashboardPage({
  title,
  subtitle,
  presentationView,
  answeredCount,
  remainingQuestions,
  totalQuestions,
  buzzer,
  onNewGame,
  onResumeGame,
  onEnableBuzzer,
  onDisableBuzzer,
  onResetBuzzer,
}: {
  title: string;
  subtitle: string;
  presentationView: PresentationView;
  answeredCount: number;
  remainingQuestions: number;
  totalQuestions: number;
  buzzer: BuzzerState;
  onNewGame: () => void;
  onResumeGame: () => void;
  onEnableBuzzer: () => void;
  onDisableBuzzer: () => void;
  onResetBuzzer: () => void;
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
      <div className="flex flex-row items-stretch gap-6">
      <section className="ui-panel gap-6 px-6 py-6">
        <div id="Container"></div>
        {generateBuzzerQRCode()}
      </section>
      <section className="ui-panel w-full gap-6 px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={buzzer.isEnabled ? 'success' : 'warning'}>
                {buzzer.isEnabled ? 'Buzzer aktiv' : 'Buzzer aus'}
              </StatusPill>
              {buzzer.winner ? (
                <StatusPill tone="danger">Erster Buzz steht fest</StatusPill>
              ) : null}
            </div>
            <div>
              <h2 className="text-3xl font-bold">Buzzer</h2>
              <p className="mt-2 text-base h-10 text-slate-600">
                Teams legen ihr Profil selbst auf <span className="font-bold">/buzzer</span>{' '}
                an und koennen von dort buzzern.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-slate-900 px-5 py-3 text-left font-bold text-white"
              onClick={onEnableBuzzer}
            >
              Aktivieren
            </button>
            <button
              className="rounded-lg border border-slate-900 px-5 py-3 text-left font-bold text-slate-900"
              onClick={onDisableBuzzer}
            >
              Deaktivieren
            </button>
            <button
              className="rounded-lg border border-red-900 px-5 py-3 text-left font-bold text-red-900"
              onClick={onResetBuzzer}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-5">
          {buzzer.winner ? (
            <div className="flex flex-wrap items-center gap-4">
              <TeamAvatar
                color={buzzer.winner.teamColor}
                label={buzzer.winner.teamIcon ?? buzzer.winner.teamName.charAt(0)}
                size="large"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Erster Buzz
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-950">
                  {buzzer.winner.teamName}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Buzzer-Status
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                Noch kein Team hat gebuzzert.
              </p>
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}
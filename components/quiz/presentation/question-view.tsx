import type { SelectedQuestion } from '@/components/quiz/config';
import { MetricCard, StatusPill } from '@/components/quiz/ui';
import { IntroView } from '@/components/quiz/presentation/intro-view';
import { formatQuestionTypeLabel } from '@/components/quiz/presentation/presentation-utils';

export function QuestionView({
  selectedQuestion,
  showAnswer,
}: {
  selectedQuestion: SelectedQuestion | null;
  showAnswer: boolean;
}) {
  if (!selectedQuestion) {
    return (
      <IntroView
        title="Naechste Frage folgt gleich"
        message="Das Admin-Fenster waehlt gerade die naechste Kategorie oder wechselt zur Punkteansicht."
        tone="neutral"
      />
    );
  }

  return (
    <section className="ui-panel flex h-full min-h-0 flex-col overflow-hidden border-slate-800 bg-slate-900 text-white">
      <div
        className="shrink-0 border-b border-slate-800 px-6 py-5"
        style={{ backgroundColor: selectedQuestion.categoryTint }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-800">
              {showAnswer ? 'Antwortansicht' : 'Frage'}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {selectedQuestion.categoryName}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{selectedQuestion.type}</StatusPill>
            <StatusPill tone="dark">{selectedQuestion.points} Punkte</StatusPill>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-6 py-6">
        <div className="flex h-full min-h-0 flex-col gap-6">
          <div className="ui-panel rounded-[28px] border-slate-800 bg-slate-950 px-6 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              Fragetext
            </p>
            <p className="mt-4 text-3xl font-semibold leading-[1.35] tracking-tight text-white md:text-4xl">
              {selectedQuestion.questionText}
            </p>
          </div>

          {selectedQuestion.options?.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {selectedQuestion.options.map((option) => (
                <div
                  key={option}
                  className="ui-panel rounded-[28px] border-slate-800 bg-slate-950 px-5 py-5 text-white"
                >
                  <p className="text-xl leading-8 text-slate-100">{option}</p>
                </div>
              ))}
            </div>
          ) : null}

          {showAnswer ? (
            <div className="ui-panel rounded-[28px] border-emerald-400 bg-emerald-50 px-6 py-6 text-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
                Antwort
              </p>
              <p className="mt-4 text-2xl font-semibold leading-9 tracking-tight md:text-3xl">
                {selectedQuestion.answerText}
              </p>
              {selectedQuestion.music ? (
                <p className="mt-4 text-base leading-7 text-slate-700">
                  {selectedQuestion.music.songTitle} - {selectedQuestion.music.artist}
                  {' '}| Clips: {selectedQuestion.music.clipLengths.join(', ')} Sekunden
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <MetricCard label="Punktwert" value={selectedQuestion.points} />
            <MetricCard
              label="Antworttyp"
              value={formatQuestionTypeLabel(selectedQuestion.type)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

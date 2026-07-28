import { StatusPill } from '@/components/quiz/ui';
import { getQuestionKey, type SubquizView } from '@/components/quiz/config';
import {
  gamingQuestions,
  generalKnowledgeSections,
  movieJeopardyCategories,
  musicDecades,
  subquizModules,
  vodafoneEstimateQuestions,
} from '@/components/quiz/presentation/subquiz-content';
import { getSubquizPalette } from '@/components/quiz/presentation/presentation-utils';

function getSubquizQuestionIds(subquiz: SubquizView) {
  switch (subquiz) {
    case 'gaming':
      return gamingQuestions.map((question) => question.id);
    case 'musik':
      return musicDecades.flatMap((decade) => decade.questions.map((question) => question.id));
    case 'allgemeinwissen':
      return generalKnowledgeSections.flatMap((section) =>
        section.items.map((item) => item.id),
      );
    case 'filme-serien':
      return movieJeopardyCategories.flatMap((category) =>
        category.questions.map((question) => question.id),
      );
    case 'vodafone-schaetzfragen':
      return vodafoneEstimateQuestions.map((question) => question.id);
    default:
      return [];
  }
}

function isSubquizComplete(subquiz: SubquizView, answered: Record<string, boolean>) {
  const questionIds = getSubquizQuestionIds(subquiz);

  return (
    questionIds.length > 0 &&
    questionIds.every((questionId) => answered[getQuestionKey(subquiz, questionId)])
  );
}

export function BoardView({ answered }: { answered: Record<string, boolean> }) {
  return (
    <section
      className="ui-panel flex h-full min-h-0 flex-col overflow-hidden border-slate-800 bg-slate-900 text-white"
    >
      <div
        className="shrink-0 border-b px-6 py-5 border-slate-800 bg-slate-900"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-300">
          Quizstruktur
        </p>
        <h2
          className="mt-2 text-3xl font-bold tracking-tight"        >
          Unterquizze
        </h2>
        <p className="mt-2 text-base leading-7 text-slate-400">
          Das Quiz ist in mehrere eigenstaendige Module aufgeteilt, die im
          Admin-Panel gezielt angesteuert werden.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 gap-5 overflow-hidden p-6 xl:grid-cols-2">
        {subquizModules.map((module) => {
          const palette = getSubquizPalette(module.id as SubquizView);
          const complete = isSubquizComplete(module.id as SubquizView, answered);

          return (
            <article
              key={module.id}
              className="ui-panel flex min-h-0 flex-col overflow-hidden text-white"
              style={{
                backgroundColor: complete ? '#334155' : palette.cardBackground,
                borderColor: complete ? '#94a3b8' : palette.cardBorder,
                filter: complete ? 'grayscale(1)' : 'none',
                opacity: complete ? 0.78 : 1,
              }}
            >
            <div className="flex h-full flex-col justify-between gap-6 px-5 py-5">
              <div>
                <StatusPill tone="dark">{module.detail}</StatusPill>
                {complete ? (
                  <StatusPill tone="neutral" className="ml-2">
                    Komplett
                  </StatusPill>
                ) : null}
                <h3
                  className="mt-4 text-2xl font-bold tracking-tight"
                  style={{ color: complete ? '#cbd5e1' : palette.accent }}
                >
                  {module.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {module.description}
                </p>
              </div>

              <div
                className="rounded-3xl border px-4 py-4"
                style={{
                  backgroundColor: palette.ghostBackground,
                  borderColor: palette.cardBorder,
                }}
              >
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
          );
        })}
      </div>
    </section>
  );
}

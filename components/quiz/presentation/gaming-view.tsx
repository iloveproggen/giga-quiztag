import { getQuestionKey } from '@/components/quiz/config';
import { gamingQuestions } from '@/components/quiz/presentation/subquiz-content';
import { SubquizOverview } from '@/components/quiz/presentation/subquiz-overview';

export function GamingView({
  answered,
}: {
  answered: Record<string, boolean>;
}) {
  return (
    <SubquizOverview
      subquiz="gaming"
      eyebrow="Gaming"
      title="Multiple-Choice Arena"
      description="Das ausgewaehlte Unterquiz wird hier als fixes Raster ohne Scrollen gezeigt. Jede Kachel steht fuer eine Frage und zeigt nur ihre Kategorie."
      detail="4 Antwortoptionen"
      columns={4}
      tiles={gamingQuestions.map((question) => ({
        id: question.id,
        category: question.category,
        answered: Boolean(answered[getQuestionKey('gaming', question.id)]),
      }))}
    />
  );
}

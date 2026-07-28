import { getQuestionKey } from '@/components/quiz/config';
import { vodafoneEstimateQuestions } from '@/components/quiz/presentation/subquiz-content';
import { SubquizOverview } from '@/components/quiz/presentation/subquiz-overview';

export function VodafoneEstimatesView({
  answered,
}: {
  answered: Record<string, boolean>;
}) {
  return (
    <SubquizOverview
      subquiz="vodafone-schaetzfragen"
      eyebrow="Vodafone Schaetzfragen"
      title="Zahlen, Volumen, Netze"
      description="Das ausgewaehlte Unterquiz wird hier als fixes Raster ohne Scrollen gezeigt. Jede Kachel steht fuer eine Frage und zeigt nur ihre Kategorie."
      detail="Estimate Mode"
      columns={5}
      tiles={vodafoneEstimateQuestions.map((question) => ({
        id: question.id,
        category: question.category,
        answered: Boolean(
          answered[getQuestionKey('vodafone-schaetzfragen', question.id)],
        ),
      }))}
    />
  );
}

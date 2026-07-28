'use client';

import { getTotalQuestionCount, quizMeta } from '@/components/quiz/config';
import { HydrationPlaceholder } from '@/components/quiz/ui';
import { BoardView } from '@/components/quiz/presentation/board-view';
import { BuzzerOverlay } from '@/components/quiz/presentation/buzzer-overlay';
import { FinalView } from '@/components/quiz/presentation/final-view';
import { GamingView } from '@/components/quiz/presentation/gaming-view';
import { GeneralKnowledgeView } from '@/components/quiz/presentation/general-knowledge-view';
import { IntroView } from '@/components/quiz/presentation/intro-view';
import { MoviesSeriesView } from '@/components/quiz/presentation/movies-series-view';
import { MusicView } from '@/components/quiz/presentation/music-view';
import { PresentationHeader } from '@/components/quiz/presentation/presentation-header';
import { QuestionView } from '@/components/quiz/presentation/question-view';
import { ScoresView } from '@/components/quiz/presentation/scores-view';
import { StatsView } from '@/components/quiz/presentation/stats-view';
import { VodafoneEstimatesView } from '@/components/quiz/presentation/vodafone-estimates-view';
import { useQuizStore } from '@/components/quiz/use-quiz-store';

export function PresentationPage() {
  const { state, ranking, isHydrated } = useQuizStore();

  if (!isHydrated) {
    return (
      <HydrationPlaceholder
        title="Praesentation wird geladen"
        message="Die Anzeige verbindet sich gerade mit dem Admin-Fenster."
      />
    );
  }

  const finalTeams = state.teams.filter((team) => state.finalTeams.includes(team.id));
  const finalWinner =
    state.teams.find((team) => team.id === state.finalWinnerId) ?? null;
  const answeredCount = Object.keys(state.answered).length;
  const totalQuestionCount = getTotalQuestionCount();
  const remainingQuestions = Math.max(totalQuestionCount - answeredCount, 0);

  function renderMainView() {
    if (state.gameStatus === 'idle') {
      return (
        <IntroView
          title={quizMeta.title}
          message="Das Quiz wurde vorbereitet. Der Start erfolgt gleich aus dem Admin-Fenster."
          tone="neutral"
          teams={state.teams}
        />
      );
    }

    if (state.gameStatus === 'paused') {
      return (
        <StatsView
          ranking={ranking}
          showScores={state.showScores}
          answeredCount={answeredCount}
          remainingQuestions={remainingQuestions}
          totalQuestions={totalQuestionCount}
          activeSubquiz={state.activeSubquiz}
          presentationView={state.presentationView}
        />
      );
    }

    switch (state.presentationView) {
      case 'question':
        return (
          <QuestionView
            selectedQuestion={state.selectedQuestion}
            showAnswer={false}
          />
        );
      case 'answer':
        return (
          <QuestionView
            selectedQuestion={state.selectedQuestion}
            showAnswer
          />
        );
      case 'scores':
        return <ScoresView ranking={ranking} showScores={state.showScores} />;
      case 'top3':
        return <ScoresView ranking={ranking} showScores={state.showScores} limit={3} />;
      case 'final':
        return <FinalView finalTeams={finalTeams} finalWinner={finalWinner} />;
      case 'gaming':
        return <GamingView answered={state.answered} />;
      case 'musik':
        return <MusicView answered={state.answered} />;
      case 'allgemeinwissen':
        return <GeneralKnowledgeView answered={state.answered} />;
      case 'filme-serien':
        return <MoviesSeriesView answered={state.answered} />;
      case 'vodafone-schaetzfragen':
        return <VodafoneEstimatesView answered={state.answered} />;
      default:
        return <BoardView answered={state.answered} />;
    }
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-slate-950 p-4 md:p-6">
      <div className="ui-shell flex h-full flex-col gap-6 overflow-hidden">
        <PresentationHeader
          title={quizMeta.title}
          subtitle={quizMeta.subtitle}
          gameStatus={state.gameStatus}
          presentationView={state.presentationView}
          remainingQuestions={remainingQuestions}
        />

        <BuzzerOverlay buzzer={state.buzzer} />
        <div className="min-h-0 flex-1 overflow-hidden">{renderMainView()}</div>
      </div>
    </div>
  );
}

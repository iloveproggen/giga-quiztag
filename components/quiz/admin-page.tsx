'use client';

import { useState } from 'react';
import { quizMeta, type AdminSection } from '@/components/quiz/config';
import { DashboardPage } from '@/components/quiz/admin/dashboard-page';
import { FinalePage } from '@/components/quiz/admin/finale-page';
import { HistoryPage } from '@/components/quiz/admin/history-page';
import { QuizzesPage } from '@/components/quiz/admin/quizzes-page';
import { ScoresPage } from '@/components/quiz/admin/scores-page';
import { getAdminSectionStatus } from '@/components/quiz/admin/shared';
import { TeamsPage } from '@/components/quiz/admin/teams-page';
import {
  FrameButton,
  HydrationPlaceholder,
  StatusPill,
} from '@/components/quiz/ui';
import { useQuizStore } from '@/components/quiz/use-quiz-store';

const adminSections: Array<{ id: AdminSection; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'teams', label: 'Teams' },
  { id: 'quizzes', label: 'Quizzes' },
  { id: 'history', label: 'Verlauf' },
  { id: 'scores', label: 'Punkte' },
  { id: 'final', label: 'Finale' },
];

export function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const {
    state,
    ranking,
    answeredCount,
    remainingQuestions,
    isHydrated,
    actions,
  } = useQuizStore();
  const activeQuestion = state.selectedQuestion;
  const finalTeams = state.teams.filter((team) => state.finalTeams.includes(team.id));
  const finalWinner =
    state.teams.find((team) => team.id === state.finalWinnerId) ?? null;
  const totalQuestions = answeredCount + remainingQuestions;
  const adminStatus = getAdminSectionStatus(activeSection, {
    gameStatus: state.gameStatus,
    activeSubquiz: state.activeSubquiz,
    activeQuestion,
    presentationView: state.presentationView,
  });

  if (!isHydrated) {
    return (
      <HydrationPlaceholder
        title="Quiz wird geladen"
        message="Die Admin-Oberflaeche verbindet sich gerade mit dem gemeinsamen Quiz-Zustand."
      />
    );
  }

  function openQuizzesFromTeams() {
    actions.openQuizzesSelection();
    setActiveSection('quizzes');
  }

  function renderSection() {
    switch (activeSection) {
      case 'teams':
        return (
          <TeamsPage
            teams={state.teams}
            onDeleteAllTeams={actions.deleteAllTeams}
            onDeleteTeam={actions.deleteTeam}
            onOpenQuizzes={openQuizzesFromTeams}
          />
        );
      case 'quizzes':
        return (
          <QuizzesPage
            state={state}
            actions={actions}
            activeQuestion={activeQuestion}
            onOpenFinale={() => setActiveSection('final')}
          />
        );
      case 'scores':
        return (
          <ScoresPage
            ranking={ranking}
            showScores={state.showScores}
            onShowScores={() => actions.setPresentationView('scores')}
            onShowTop3={() => actions.setPresentationView('top3')}
            onToggleScores={actions.toggleShowScores}
            onResetScores={actions.resetScores}
            onOpenFinale={() => setActiveSection('final')}
            onAdjustScore={actions.adjustTeamScore}
          />
        );
      case 'history':
        return <HistoryPage gameEvents={state.gameEvents} />;
      case 'final':
        return (
          <FinalePage
            teams={state.teams}
            finalTeams={finalTeams}
            finalWinner={finalWinner}
            onSetPresentationFinal={() => actions.setPresentationView('final')}
            onClearFinalMode={actions.clearFinalMode}
            onSetFinalTeams={actions.setFinalTeams}
            onChooseFinalWinner={actions.chooseFinalWinner}
          />
        );
      default:
        return (
          <DashboardPage
            title={quizMeta.title}
            subtitle={quizMeta.subtitle}
            presentationView={state.presentationView}
            answeredCount={answeredCount}
            remainingQuestions={remainingQuestions}
            totalQuestions={totalQuestions}
            buzzer={state.buzzer}
            onNewGame={() => {
              actions.startNewGame();
              setActiveSection('teams');
            }}
            onResumeGame={() => {
              actions.resumeGame();
              setActiveSection('quizzes');
            }}
            onEnableBuzzer={() => actions.setBuzzerEnabled(true)}
            onDisableBuzzer={() => actions.setBuzzerEnabled(false)}
            onResetBuzzer={actions.resetBuzzerWinner}
          />
        );
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="ui-shell space-y-6">
        <nav className="flex flex-wrap items-center gap-2">
          {adminSections.map((section) => (
            <FrameButton
              key={section.id}
              variant={activeSection === section.id ? 'primary' : 'secondary'}
              active={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </FrameButton>
          ))}
          
          <StatusPill tone={adminStatus.tone}>{adminStatus.label}</StatusPill>
          <FrameButton
            onClick={() => window.open('/quiz', '_blank', 'noopener,noreferrer')}
            className="ml-auto inline-flex items-center justify-center rounded-full border border-red-500 bg-red-200 px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] text-slate-900 no-underline"
          >
            Präsentation öffnen
          </FrameButton>
        </nav>
        {renderSection()}
      </div>
    </div>
  );
}

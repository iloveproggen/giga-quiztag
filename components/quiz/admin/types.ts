import { useQuizStore } from '@/components/quiz/use-quiz-store';

export type QuizActions = ReturnType<typeof useQuizStore>['actions'];

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createDefaultQuizState, type QuizState } from '@/components/quiz/config';
import { normalizeQuizState } from '@/lib/quiz-state';

const QUIZ_STATE_DIRECTORY = path.join(process.cwd(), 'data', 'runtime');
const QUIZ_STATE_FILE = path.join(QUIZ_STATE_DIRECTORY, 'quiz-state.json');
let quizStateMutationQueue: Promise<unknown> = Promise.resolve();

function hasNodeErrorCode(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export async function readQuizState(): Promise<QuizState> {
  try {
    const rawState = await readFile(QUIZ_STATE_FILE, 'utf8');
    return normalizeQuizState(JSON.parse(rawState));
  } catch (error) {
    if (hasNodeErrorCode(error) && error.code === 'ENOENT') {
      return createDefaultQuizState();
    }

    if (error instanceof SyntaxError) {
      throw new Error('Stored quiz state is not valid JSON.');
    }

    throw error;
  }
}

export async function writeQuizState(nextState: QuizState): Promise<QuizState> {
  const normalizedState = normalizeQuizState(nextState);
  const tempFile = path.join(
    QUIZ_STATE_DIRECTORY,
    `quiz-state.${process.pid}.${Date.now()}.tmp`,
  );

  await mkdir(QUIZ_STATE_DIRECTORY, { recursive: true });
  await writeFile(tempFile, `${JSON.stringify(normalizedState, null, 2)}\n`, 'utf8');
  await rename(tempFile, QUIZ_STATE_FILE);

  return normalizedState;
}

export function updateQuizState<Result>(
  updater: (currentState: QuizState) => Promise<{
    nextState: QuizState;
    result: Result;
  }> | {
    nextState: QuizState;
    result: Result;
  },
): Promise<Result> {
  const queuedMutation = quizStateMutationQueue.then(async () => {
    const currentState = await readQuizState();
    const { nextState, result } = await updater(currentState);

    if (nextState !== currentState) {
      await writeQuizState(nextState);
    }

    return result;
  });

  quizStateMutationQueue = queuedMutation.then(
    () => undefined,
    () => undefined,
  );

  return queuedMutation;
}

import { createDefaultQuizState } from '@/components/quiz/config';
import { isQuizStatePayload, normalizeQuizState } from '@/lib/quiz-state';
import { readQuizState, writeQuizState } from '@/lib/quiz-state-store';

export const runtime = 'nodejs';

type QuizStateWritePayload =
  | unknown
  | {
      state?: unknown;
      baseUpdatedAt?: unknown;
    };

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET() {
  try {
    const state = await readQuizState();
    return Response.json({ state });
  } catch (error) {
    console.error('Failed to read quiz state.', error);
    return Response.json(
      {
        error: `Quiz state could not be loaded: ${toErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as QuizStateWritePayload;
    const candidateState =
      typeof payload === 'object' &&
      payload !== null &&
      'state' in payload
        ? payload.state
        : payload;
    const baseUpdatedAt =
      typeof payload === 'object' &&
      payload !== null &&
      'baseUpdatedAt' in payload &&
      typeof payload.baseUpdatedAt === 'number'
        ? payload.baseUpdatedAt
        : null;

    if (!isQuizStatePayload(candidateState)) {
      return Response.json(
        { error: 'Expected a complete quiz state payload.' },
        { status: 400 },
      );
    }

    const nextState = normalizeQuizState(candidateState);
    const currentState = await readQuizState();

    if (
      baseUpdatedAt !== null &&
      currentState.updatedAt !== baseUpdatedAt
    ) {
      return Response.json(
        {
          error: 'Quiz state changed on the server.',
          state: currentState,
        },
        { status: 409 },
      );
    }

    if (baseUpdatedAt === null && nextState.updatedAt < currentState.updatedAt) {
      return Response.json(
        {
          error: 'A newer quiz state is already stored.',
          state: currentState,
        },
        { status: 409 },
      );
    }

    const savedState = await writeQuizState(nextState);
    return Response.json({ state: savedState });
  } catch (error) {
    console.error('Failed to update quiz state.', error);

    const status = error instanceof SyntaxError ? 400 : 500;
    const message =
      status === 400
        ? 'Quiz state payload is not valid JSON.'
        : `Quiz state could not be saved: ${toErrorMessage(error)}`;

    return Response.json({ error: message }, { status });
  }
}

export async function DELETE() {
  try {
    const resetState = createDefaultQuizState();
    const savedState = await writeQuizState(resetState);
    return Response.json({ state: savedState });
  } catch (error) {
    console.error('Failed to reset quiz state.', error);
    return Response.json(
      {
        error: `Quiz state could not be reset: ${toErrorMessage(error)}`,
      },
      { status: 500 },
    );
  }
}

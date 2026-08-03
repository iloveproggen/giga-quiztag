#!/usr/bin/env node

const baseUrl = process.env.QUIZ_BASE_URL ?? 'http://192.168.0.151:3000';
const teamName = process.argv[2] ?? `Dummy Team ${Date.now()}`;
const teamColor = process.argv[3] ?? '#60a5fa';
const teamIcon = process.argv[4] ?? 'D';

function exitWithError(message, details) {
  console.error(`Error: ${message}`);
  if (details) {
    console.error(details);
  }
  process.exit(1);
}

async function run() {
  const endpoint = `${baseUrl.replace(/\/$/, '')}/api/quiz-state`;

  const getResponse = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  let getPayload;
  try {
    getPayload = await getResponse.json();
  } catch (error) {
    exitWithError('Could not parse server response for GET /api/quiz-state.', error);
  }

  if (!getResponse.ok) {
    exitWithError('Failed to load current quiz state.', getPayload?.error ?? getPayload);
  }

  const currentState = getPayload?.state;
  if (!currentState || !Array.isArray(currentState.teams) || typeof currentState.updatedAt !== 'number') {
    exitWithError('Server returned an unexpected state payload.');
  }

  const existing = currentState.teams.find(
    (team) => typeof team?.name === 'string' && team.name.toLowerCase() === teamName.toLowerCase(),
  );
  if (existing) {
    exitWithError(`A team with the name "${teamName}" already exists.`);
  }

      let requestedTeamId = Math.floor(Math.random() * 1000000).toString();
    while (requestedTeamId.length < 6) {
      requestedTeamId = '0' + requestedTeamId;
    }

  const nextState = {
    ...currentState,
    teams: [
      ...currentState.teams,
      {
        id: requestedTeamId,
        name: teamName,
        score: 0,
        color: teamColor,
        icon: teamIcon,
        members: [],
      },
    ],
    updatedAt: Date.now(),
  };

  const putResponse = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      state: nextState,
      baseUpdatedAt: currentState.updatedAt,
    }),
  });

  let putPayload;
  try {
    putPayload = await putResponse.json();
  } catch (error) {
    exitWithError('Could not parse server response for PUT /api/quiz-state.', error);
  }

  if (!putResponse.ok) {
    exitWithError('Failed to save quiz state with dummy team.', putPayload?.error ?? putPayload);
  }

  console.log(`Added dummy team: ${teamName}`);
  console.log(`Color: ${teamColor}, Icon: ${teamIcon}`);
  console.log(`Total teams: ${putPayload?.state?.teams?.length ?? 'unknown'}`);
}

run().catch((error) => {
  exitWithError('Unexpected error while adding dummy team.', error);
});

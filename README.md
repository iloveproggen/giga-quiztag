This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Quiz backend

The quiz app now includes a small Next.js backend at `app/api/quiz-state/route.ts`.

- `GET /api/quiz-state` loads the shared quiz state
- `PUT /api/quiz-state` stores the full quiz state
- `DELETE /api/quiz-state` resets the shared quiz state

The backend persists the current game to `data/runtime/quiz-state.json` in local development.

On Vercel, the app now automatically falls back to `/tmp/giga-quiztag/runtime/quiz-state.json`, because the deployment filesystem under `/var/task` is read-only. You can override the storage location with `QUIZ_STATE_DIRECTORY`.

Important: `/tmp` on Vercel is ephemeral. It avoids the 500 error, but the stored quiz state can still disappear on cold starts and is not shared across multiple function instances. For durable production quiz sessions, move the state to a real shared store.

## Buzzer

- `GET|PUT|POST /api/buzzer` powers the mobile buzzer flow
- `/buzzer` is the phone page where each team picks its own name, emoji, and color
- the admin dashboard can activate, deactivate, and reset the buzzer state
- the presentation view shows the first team that buzzed until the admin resets it

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

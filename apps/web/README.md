# Taskflow Web

Web app for Taskflow.

## Stack

- Next.js (App Router)
- React
- Tailwind CSS + shadcn/ui
- Convex (backend)

## Requirements

- Node.js 20+
- npm

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env.local` file (not committed) with your Convex config:

```bash
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Optional
NEXT_PUBLIC_CONVEX_SITE_URL=
```

Tip: running `npm run dev:backend` will guide you through creating a Convex deployment and write `.env.local` for you.

## Development

Run frontend + backend together:

```bash
npm run dev
```

Frontend: http://localhost:3000

## Useful Scripts

```bash
npm run dev:frontend
npm run dev:backend
npm run build
npm run start
npm run lint
```

## Notes

- `convex/_generated` is generated; re-run `npm run dev:backend` after changing Convex functions/schemas.
- Keep `.env*` files out of git.

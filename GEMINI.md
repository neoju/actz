# Gemini Context: ACTZ (Fitness App)

This file provides context for Gemini agents working on the ACTZ project.

## Project Overview

ACTZ is an AI-powered fitness training application built with **SvelteKit (Svelte 5)**. It uses **PostgreSQL** (via Prisma) for data persistence and **Groq SDK** for generating personalized workout plans. The UI is built with **Tailwind CSS 4** and **shadcn-svelte**.

## Tech Stack

*   **Framework:** SvelteKit (Svelte 5)
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Styling:** Tailwind CSS 4, shadcn-svelte
*   **State Management:** Svelte 5 Runes (`$state`, `$derived`), TanStack Query
*   **Authentication:** Auth.js (NextAuth)
*   **AI Integration:** Groq SDK
*   **Onboarding:** Driver.js

## Development Conventions

### Svelte 5 & SvelteKit
*   **Runes:** Use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) for reactivity. Avoid legacy stores (`writable`, `readable`) for new component state, but TanStack Query stores are used for async data.
*   **Imports:**
    *   Use `$app/state` for navigation state (e.g., `import { page } from '$app/state'`).
    *   Use `@lucide/svelte` for icons (e.g., `import { Activity } from '@lucide/svelte'`).
    *   Use `$lib` alias for imports from `src/lib`.

### Database & Prisma
*   **Schema:** Defined in `prisma/schema.prisma`.
*   **Client Generation:** The Prisma client is generated to `../generated/prisma`.
*   **Commands:**
    *   `npx prisma generate`: Regenerate client after schema changes.
    *   `npx prisma db push`: Push schema changes to the database (dev).
    *   `npx prisma studio`: Open database GUI.

### UI & Styling
*   **Components:** Reusable UI components (shadcn) are located in `src/lib/components/ui`.
*   **Tailwind:** Utility-first styling. Configuration in `src/routes/layout.css` (Tailwind 4) and `components.json`.

### Architecture
*   **Routes:**
    *   `(app)/`: Protected routes (Home, Exercises, Settings, Workout).
    *   `(public)/`: Public routes (Landing, Auth, Static pages).
*   **API:** Backend logic in `+server.ts` files under `src/routes/api` or `+page.server.ts` actions.

## Common Tasks

### Starting Development
```bash
npm run dev
```

### Type Checking & Linting
```bash
npm run check
# or
npm run check:watch
```

### Database Updates
When modifying `prisma/schema.prisma`:
1.  `npx prisma generate`
2.  `npx prisma db push`

## Key Files
*   `prisma/schema.prisma`: Database definition.
*   `src/lib/prisma.ts`: Prisma client instance.
*   `src/lib/components/ui/`: Shared UI components.
*   `src/routes/+layout.svelte`: Root layout.
*   `src/routes/(app)/+page.svelte`: Main user dashboard.

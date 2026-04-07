# Gemini Context: ACTZ (Fitness App)

This file provides context for Gemini agents working on the ACTZ project.

## Project Overview

ACTZ is an AI-powered fitness training application designed to provide personalized workout plans and interactive exercise tracking. It is a Progressive Web App (PWA) that leverages AI for plan generation.

## Tech Stack

*   **Framework:** SvelteKit (Svelte 5)
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **ORM:** Prisma (Client generated to `../generated/prisma`)
*   **Styling:** Tailwind CSS 4 (using `@tailwindcss/vite`), shadcn-svelte, Lucide Icons
*   **State Management:** Svelte 5 Runes (`$state`, `$derived`, `$effect`, `$props`), TanStack Query for async data
*   **Authentication:** Auth.js (NextAuth) with Prisma adapter
*   **AI Integration:** Groq SDK
*   **Internationalization:** Paraglide-JS for i18n (supports English and Vietnamese)

## Project Structure

*   `src/lib/`: Core application logic and shared components.
    *   `components/`: Svelte components, including `ui/` (shadcn-svelte).
    *   `queries/`: TanStack Query hooks for data fetching.
    *   `schemas/`: Zod schemas for validation.
    *   `paraglide/`: Generated i18n messages.
    *   `assets/css/`: Modular CSS files.
    *   `prisma.ts`: Prisma client initialization with PostgreSQL adapter.
*   `src/routes/`: SvelteKit routes.
    *   `(app)/`: Protected routes for the main application (dashboard, exercises, settings, planned-exercises).
    *   `(public)/`: Publicly accessible routes (landing, auth, legal).
    *   `api/`: Backend API endpoints.
*   `prisma/`: Database schema and migrations.
*   `static/`: Static assets, including PWA manifest and icons.

## Development Conventions

### Svelte 5 & SvelteKit
*   **Runes:** Exclusively use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) for reactivity.
*   **Navigation:** Use `$app/state` for reactive page state and `$app/navigation` for programmatic navigation.
*   **View Transitions:** Built-in support for view transitions in `+layout.svelte`.
*   **Imports:** Use the `$lib` alias for internal imports.

### Data Fetching & State
*   **TanStack Query:** Use for all asynchronous data fetching to handle caching, loading states, and refetching.
*   **Prisma:** All database interactions should go through the Prisma client in `src/lib/prisma.ts`. Note that the client is generated to a custom location (`../generated/prisma`).

### UI & Styling
*   **Tailwind 4:** Use utility-first styling. Configuration is integrated via the Vite plugin.
*   **I18n:** Use Paraglide for all user-facing strings. Import messages from `$lib/paraglide/messages.js`.
*   **Components:** Follow the shadcn-svelte pattern for reusable UI elements.

## Common Tasks

### Starting Development
```bash
npm run dev
```

### Database Updates
When modifying `prisma/schema.prisma`:
1.  `npx prisma generate`
2.  `npx prisma db push`
3.  `npx prisma studio` (to inspect data)

### Type Checking & Building
```bash
npm run check    # Run svelte-check
npm run build    # Build for production (includes prisma generate)
```

### Adding New Features
*   Ensure all new strings are added to `messages/en.json` and `messages/vi.json` for i18n support.

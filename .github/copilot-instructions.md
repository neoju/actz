# ACTZ - Copilot Instructions

AI-powered fitness training application built with SvelteKit (Svelte 5), PostgreSQL, and Groq SDK.

## Commands

### Development
```bash
npm run dev              # Start dev server at http://localhost:5173
npm run build            # Build for production (includes Prisma generation)
npm run preview          # Preview production build
```

### Type Checking
```bash
npm run check            # Run type checking
npm run check:watch      # Watch mode for type checking
```

### Database (Prisma)
```bash
npx prisma generate      # Regenerate Prisma Client after schema changes
npx prisma db push       # Push schema changes to database (development)
npx prisma studio        # Open Prisma Studio GUI
```

## Architecture

### Route Structure
- **`src/routes/(app)/`** - Protected routes requiring authentication
  - Dashboard, exercises library, settings, workout sessions
  - Auth enforced via `hooks.server.ts` (redirects to `/login`)
- **`src/routes/(public)/`** - Public routes (landing, auth pages)
- **`src/routes/api/`** - API endpoints (`+server.ts` files)
  - `/api/weekly-plan` - Weekly workout plan generation/management
  - `/api/monthly-plan` - Monthly plan management
  - `/api/activity` - Exercise activity tracking
  - `/api/user/profile` - User profile and onboarding data
  - `/api/notifications/subscribe` - Push notification subscriptions

### Data Layer
- **Database:** PostgreSQL with Prisma ORM
- **Prisma Client:** Generated to `../generated/prisma` (not `node_modules`)
- **Import:** Always use `import { prisma } from '$lib/prisma'` for database access
- **State Management:** TanStack Query for async data
  - Query hooks in `src/lib/queries/` (e.g., `weekly-plan.ts`, `activity.ts`)
  - Uses Svelte stores pattern with `.subscribe()` and reactive bindings

### Key Modules
- **`src/lib/tour.ts`** - Driver.js guided tour system
  - Auto-starts for first-time users
  - 7-step tour covering dashboard, workouts, settings, library
  - State tracked in localStorage/sessionStorage
- **`src/lib/auth.ts`** - Auth.js configuration
- **`src/lib/exercises.json`** - Static exercise library (name, instructions, video URLs)
- **`src/hooks.server.ts`** - SvelteKit hooks for auth middleware

### UI Components
- **Location:** `src/lib/components/ui/` (shadcn-svelte components)
- **Icons:** Use `@lucide/svelte` (e.g., `import { Activity } from '@lucide/svelte'`)
- **Styling:** Tailwind CSS 4 with utilities + custom tour styles in `src/lib/styles/tour.css`

## Conventions

### Svelte 5 Reactivity
- **Use Runes:** `$state`, `$derived`, `$effect`, `$props` for component state
- **Avoid Legacy Stores:** Don't use `writable`/`readable` for new component state
  - Exception: TanStack Query uses stores for async data (`createQuery` returns a store)
- **Navigation State:** Import from `$app/state` not `$app/stores`
  ```typescript
  import { page } from '$app/state';  // ✅ Svelte 5
  // NOT from '$app/stores'            // ❌ Legacy
  ```

### Import Patterns
```typescript
// Path aliases
import { component } from '$lib/components/...'  // src/lib/
import { page } from '$app/state'                // SvelteKit state

// External
import { Activity } from '@lucide/svelte'        // Icons
import { driver } from 'driver.js'               // Tour system
```

### Styling Rules
- **Class Naming:** Prefix classes by scope for clarity
  - `page-*` for page-specific styles (e.g., `page-dashboard-header`)
  - `component-*` for component-specific styles (e.g., `component-workout-card`)
  - `block-*` for reusable style blocks (e.g., `block-stat-grid`)
- **CSS Files:** Extract styles to separate `.css` files for large components/pages
  - Import in component: `import './my-component.css'`
  - Example: `src/lib/styles/tour.css` for tour-specific styles
- **Tailwind First:** Prefer Tailwind utilities, use custom classes only when necessary

### Code Organization
- **File Size:** Keep Svelte files under 300 lines
  - Extract large components into smaller sub-components
  - Move complex logic to separate modules
- **Utility Functions:** Place in `src/lib/utils/` or `src/lib/utils.ts`
  - Keep component files focused on UI logic
- **Component Naming:** Use kebab-case for component files
  - ✅ `workout-card.svelte`, `exercise-list.svelte`
  - ❌ `WorkoutCard.svelte`, `ExerciseList.svelte`

### Database Workflow
1. Modify `prisma/schema.prisma`
2. Run `npx prisma generate` to regenerate client
3. Run `npx prisma db push` to update database (dev)
4. Generated client appears in `../generated/prisma/`

### API Endpoints
- **Pattern:** `src/routes/api/{feature}/+server.ts`
- **Methods:** Export `GET`, `POST`, `PUT`, `PATCH`, `DELETE` functions
- **Auth:** Access session via `event.locals.auth()`
- **Response:** Use `json()` from `@sveltejs/kit` to return data

### TanStack Query Hooks
- **Location:** `src/lib/queries/{feature}.ts`
- **Pattern:** Export functions that return `createQuery` or `createMutation`
- **Usage:** Subscribe in components with `$queryStore` syntax
  ```typescript
  const planQuery = useWeeklyPlan();
  ```

## AI Workout Generation

- **Model:** Groq SDK (llama model for workout plans)
- **Prompt Engineering:** Uses user onboarding data (age, gender, fitness level, equipment, schedule, target, primary/secondary focus)
- **Output:** Structured JSON plans with days, exercises, sets, reps, notes
- **Rate Limiting:** Track plan generation in `PlanGenerationLog` table

## Guided Tour System

- **Library:** Driver.js with custom styling
- **Trigger:** Auto-starts for users who haven't completed/dismissed tour
- **State:**
  - `localStorage.actz_tour_status` - "completed" or "dismissed"
  - `sessionStorage.actz_tour_shown_this_session` - Prevents repeat in same session
- **Restart:** Available in Settings → Plans → "Restart Guided Tour" button
- **Navigation:** Tour automatically navigates between pages using `goto()`

## Authentication

- **Library:** Auth.js (NextAuth) with Prisma adapter
- **Protected Routes:** Enforced in `hooks.server.ts`
- **Public Paths:** `/login`, `/terms`, `/privacy-policy`, `/auth/*`
- **Session Access:** `await event.locals.auth()` in server code

## Schema Overview

### User Model
- Auth fields (email, name, image)
- Onboarding data (age, gender, weight, height, fitnessLevel, equipment, schedule, limitations, target, primaryFocus, secondaryFocus)
- Notification settings (preferredWorkoutTime, reminderMinutesBefore, notificationsEnabled, pushSubscription)

### Plan Hierarchy
- `MonthlyPlan` → `WeeklyPlan[]` → `DayPlan[]` → `PlannedExercise[]`
- `ExerciseActivity` tracks user progress on exercises (PENDING, IN_PROGRESS, COMPLETED, SKIPPED)

### Relations
- User hasMany WeeklyPlans, MonthlyPlans, ExerciseActivities
- Cascade deletes on user deletion

# ACTZ - AI-Powered Fitness Training App

A modern fitness training application built with SvelteKit, featuring AI-generated personalized workout plans and an interactive guided tour for new users.

## Features

- 🤖 AI-powered personalized workout plans
- 💪 Interactive exercise tracking with Focus Mode
- 📱 Progressive Web App (PWA) support
- 🎯 Guided tour for first-time users
- 🌙 Dark/Light mode support
- 📊 Progress tracking and analytics
- 🏋️ Comprehensive exercise library

## Guided Tour

ACTZ includes a comprehensive guided tour system powered by [Driver.js](https://driverjs.com) that automatically guides first-time users through the app.

### Quick Start
- Tour automatically starts for new users
- Covers dashboard, workouts, settings, and library
- Can be restarted anytime from Settings → Plans → "Restart Guided Tour"

### Documentation
- [Guided Tour Documentation](docs/GUIDED_TOUR.md) - Comprehensive guide
- [Tour Setup Guide](TOUR_SETUP.md) - Quick setup reference
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Technical details

## Tech Stack

- **Framework**: SvelteKit (Svelte 5)
- **Styling**: TailwindCSS 4 + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth.js (NextAuth)
- **AI**: Groq SDK for workout generation
- **Tour**: Driver.js for onboarding
- **State Management**: TanStack Query (Svelte)
- **Deployment**: Vercel/Netlify compatible

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm/pnpm/yarn

### Installation

1. Clone the repository
```sh
git clone <repository-url>
cd actz
```

2. Install dependencies
```sh
npm install
```

3. Set up environment variables
```sh
cp .env.example .env
# Edit .env with your database and API keys
```

4. Set up the database
```sh
npx prisma generate
npx prisma db push
```

5. Start the development server
```sh
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```sh
npm run build
npm run preview
```

## Project Structure

```
actz/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable Svelte components
│   │   ├── queries/        # TanStack Query hooks
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── styles/         # Global styles including tour.css
│   │   ├── tour.ts         # Guided tour logic
│   │   └── utils.ts        # Utility functions
│   ├── routes/
│   │   ├── (app)/          # Protected app routes
│   │   │   ├── dashboard/  # Main dashboard
│   │   │   ├── exercises/  # Exercise library
│   │   │   ├── settings/   # User settings
│   │   │   └── workout/    # Workout sessions
│   │   └── (public)/       # Public routes (login, etc.)
├── prisma/                 # Database schema
├── docs/                   # Documentation
└── static/                 # Static assets
```

## Key Features

### Guided Tour System
- Automatic onboarding for first-time users
- 7-step interactive tour covering all major features
- Smart navigation between pages
- Restart capability from settings
- Mobile-responsive design
- [Learn more](docs/GUIDED_TOUR.md)

### Workout Management
- AI-generated weekly/monthly plans
- Exercise tracking with Focus Mode
- Hold-to-complete functionality
- Skip and reset options
- Progress tracking

### Exercise Library
- Comprehensive exercise database
- Video tutorials
- Searchable and filterable
- Detailed instructions and tips

## Development

### Type Checking
```sh
npm run check
```

### Building
```sh
npm run build
```

### Prisma Commands
```sh
npx prisma studio        # Open database GUI
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema changes
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (including the guided tour)
5. Submit a pull request

When adding new features, consider updating the guided tour if needed.

## License

[Your License Here]

## Support

For issues or questions:
- Check the documentation in `docs/`
- Open an issue on GitHub
- Contact support

---

Built with ❤️ using SvelteKit and modern web technologies

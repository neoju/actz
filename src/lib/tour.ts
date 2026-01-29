/**
 * Guided Tour System for ACTZ
 *
 * This module provides a comprehensive onboarding tour for first-time users.
 * The tour automatically guides users through all major features of the app.
 *
 * @module tour
 * @see https://driverjs.com for Driver.js documentation
 */

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import "$lib/styles/tour.css";
import { goto } from "$app/navigation";

// Tour state management
const TOUR_STORAGE_KEY = "actz_tour_completed";

/**
 * Check if the user has completed the guided tour
 * @returns {boolean} True if tour was completed, false otherwise
 */

export function hasCompletedTour(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
}

export function markTourAsCompleted(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOUR_STORAGE_KEY, "true");
}

export function resetTour(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOUR_STORAGE_KEY);
}

/**
 * Default Driver.js configuration
 * Applied to all tour instances for consistent behavior
 */
const driverConfig = {
  showProgress: true,
  showButtons: ["next" as const, "previous" as const, "close" as const],
  progressText: "{{current}} of {{total}}",
  nextBtnText: "Next",
  prevBtnText: "Previous",
  doneBtnText: "Done",
  animate: true,
  overlayColor: "rgba(0, 0, 0, 0.7)",
  smoothScroll: true,
  allowClose: true,
  overlayClickNext: false,
  disableActiveInteraction: false,
  popoverClass: "actz-tour-popover",
};

/**
 * Dashboard Tour
 *
 * First step of the guided tour. Shows users:
 * - Welcome message
 * - Plan description location
 * - Personal trainer's note
 * - How to identify today's workout
 *
 * On completion, automatically navigates to day view and starts day tour.
 */
export function startDashboardTour() {
  const driverObj = driver({
    ...driverConfig,
    steps: [
      {
        popover: {
          title: "👋 Welcome to ACTZ!",
          description:
            "Let's take a quick tour to help you get started with your fitness journey. This will only take a minute!",
        },
      },
      {
        element: '[data-tour="plan-description"]',
        popover: {
          title: "📋 Your Plan Description",
          description:
            "This is your weekly workout plan overview. It describes the focus and goals for this training cycle. Click 'Read more' to see the full description.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="pt-summary"]',
        popover: {
          title: "💬 Personal Trainer's Note",
          description:
            "Here you'll find personalized guidance and motivation from your AI personal trainer. These notes provide context and tips for your weekly plan.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="today-card"]',
        popover: {
          title: "📅 Today's Workout",
          description:
            "This is your workout for today (marked with 'TODAY' badge). Click on it to start your training session. Each day unlocks at the scheduled time.",
          side: "bottom",
          align: "start",
        },
      },
      {
        popover: {
          title: "✅ Ready to Start?",
          description:
            "Great! Now let's see how to complete your workout. Click 'Done' to continue to a workout day.",
        },
      },
    ],
    onDestroyed: () => {
      // After dashboard tour, navigate to day view and start day tour
      const todayCard = document.querySelector(
        '[data-tour="today-card"]',
      ) as HTMLAnchorElement;
      if (todayCard && todayCard.href) {
        goto(todayCard.href).then(() => {
          // Wait for navigation and then start day tour
          setTimeout(() => {
            startDayTour();
          }, 500);
        });
      }
    },
  });

  driverObj.drive();
}

/**
 * Day View Tour
 *
 * Second step of the guided tour. Shows users:
 * - Exercise list structure
 * - How to start an exercise in Focus Mode
 * - Hold-to-complete functionality
 * - How to skip exercises
 * - How to reset exercises
 *
 * On completion, opens the menu and starts menu tour.
 */
export function startDayTour() {
  const driverObj = driver({
    ...driverConfig,
    steps: [
      {
        element: '[data-tour="exercise-item"]',
        popover: {
          title: "💪 Your Exercises",
          description:
            "This is an exercise in your workout. Click on it to expand and see details like sets, reps, and instructions.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="start-button"]',
        popover: {
          title: "🚀 Start Exercise",
          description:
            "Click 'Start in Focus Mode' to begin the exercise. Focus mode gives you a distraction-free fullscreen experience with a timer.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="hold-to-finish"]',
        popover: {
          title: "⏱️ Hold to Complete",
          description:
            "In focus mode, you'll find a 'Hold to Finish' button. Press and hold it for a few seconds to mark the exercise as complete. This prevents accidental completions!",
          side: "top",
          align: "center",
        },
      },
      {
        element: '[data-tour="skip-button"]',
        popover: {
          title: "⏭️ Skip Exercise",
          description:
            "If you need to skip an exercise (injury, equipment unavailable, etc.), use the 'Skip' button. You can always come back to it later.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="reset-button"]',
        popover: {
          title: "🔄 Reset Exercise",
          description:
            "Made a mistake? Use the 'Reset' button to set an exercise back to pending status so you can do it again.",
          side: "bottom",
          align: "start",
        },
      },
      {
        popover: {
          title: "📱 Almost Done!",
          description:
            "Now let's check out the settings and exercise library. Click 'Done' to continue.",
        },
      },
    ],
    onDestroyed: () => {
      // After day tour, open menu and continue tour
      const menuButton = document.querySelector(
        '[data-tour="menu-button"]',
      ) as HTMLButtonElement;
      if (menuButton) {
        menuButton.click();
        setTimeout(() => {
          startMenuTour();
        }, 300);
      }
    },
  });

  driverObj.drive();
}

/**
 * Menu Tour
 *
 * Third step of the guided tour. Shows users:
 * - Settings menu location
 *
 * On completion, navigates to settings and starts settings tour.
 */
export function startMenuTour() {
  const driverObj = driver({
    ...driverConfig,
    steps: [
      {
        element: '[data-tour="settings-link"]',
        popover: {
          title: "⚙️ Settings",
          description:
            "This is where you manage your profile and generate new workout plans. Let's check it out!",
          side: "left",
          align: "start",
        },
      },
      {
        popover: {
          title: "Going to Settings...",
          description: "Click 'Done' to navigate to settings.",
        },
        onDeselected: () => {
          const settingsLink = document.querySelector(
            '[data-tour="settings-link"]',
          ) as HTMLElement;
          if (settingsLink) {
            settingsLink.click();
            setTimeout(() => {
              startSettingsTour();
            }, 500);
          }
        },
      },
    ],
  });

  driverObj.drive();
}

/**
 * Settings Tour
 *
 * Fourth step of the guided tour. Shows users:
 * - Profile tab for viewing/editing information
 * - Importance of keeping profile updated
 * - Plans tab for generating new workouts
 *
 * On completion, navigates back to dashboard and opens menu for library tour.
 */
export function startSettingsTour() {
  const driverObj = driver({
    ...driverConfig,
    steps: [
      {
        element: '[data-tour="profile-tab"]',
        popover: {
          title: "👤 Your Profile",
          description:
            "Here you can view and edit your fitness profile including age, weight, height, fitness level, and goals.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="edit-profile"]',
        popover: {
          title: "✏️ Update Your Information",
          description:
            "We use your profile information to create personalized workout plans. Keep this information up-to-date for the best results!",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="plans-tab"]',
        popover: {
          title: "📆 Generate New Plans",
          description:
            "When you're ready for a new challenge, come here to generate a new weekly or monthly workout plan based on your updated profile.",
          side: "bottom",
          align: "start",
        },
      },
      {
        popover: {
          title: "📚 One More Thing...",
          description: "Let's check out the exercise library!",
        },
        onDeselected: () => {
          // Navigate back and open menu again
          goto("/dashboard").then(() => {
            setTimeout(() => {
              const menuButton = document.querySelector(
                '[data-tour="menu-button"]',
              ) as HTMLButtonElement;
              if (menuButton) {
                menuButton.click();
                setTimeout(() => {
                  startLibraryTour();
                }, 300);
              }
            }, 500);
          });
        },
      },
    ],
  });

  driverObj.drive();
}

/**
 * Library Tour
 *
 * Final step of the guided tour. Shows users:
 * - Exercise library location
 * - Completion message
 *
 * On completion, marks tour as completed and closes the menu.
 */
export function startLibraryTour() {
  const driverObj = driver({
    ...driverConfig,
    steps: [
      {
        element: '[data-tour="library-link"]',
        popover: {
          title: "📚 Exercise Library",
          description:
            "Browse our comprehensive exercise library to learn new movements and see detailed instructions.",
          side: "left",
          align: "start",
        },
      },
      {
        popover: {
          title: "🎉 Tour Complete!",
          description:
            "You're all set! Remember to update your profile information for the most personalized workout plans. Now go crush your workouts! 💪",
        },
      },
    ],
    onDestroyed: () => {
      // Mark tour as completed
      markTourAsCompleted();
      // Close menu and navigate to dashboard
      const sheet = document.querySelector('[data-tour="menu-sheet"]');
      if (sheet) {
        // Close sheet by clicking overlay or finding close button
        const closeButton = document.querySelector(
          '[aria-label="Close"]',
        ) as HTMLButtonElement;
        if (closeButton) closeButton.click();
      }
      goto("/dashboard");
    },
  });

  driverObj.drive();
}

/**
 * Start Complete Tour
 *
 * Initiates the full guided tour experience starting from the dashboard.
 * This is the main entry point for the tour system.
 *
 * Tour Flow:
 * 1. Dashboard Tour → Day View Tour
 * 2. Day View Tour → Menu Tour
 * 3. Menu Tour → Settings Tour
 * 4. Settings Tour → Library Tour
 * 5. Library Tour → Completion
 *
 * @example
 * import { startCompleteTour } from "$lib/tour";
 * startCompleteTour();
 */
export function startCompleteTour() {
  startDashboardTour();
}

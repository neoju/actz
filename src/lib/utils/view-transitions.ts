/**
 * View Transitions Utility
 *
 * Provides helper functions and types for implementing view transitions
 * with different animation styles in SvelteKit applications.
 */

export type TransitionType = 'fade' | 'slide' | 'scale' | 'none';

export interface TransitionConfig {
  duration?: number;
  type?: TransitionType;
  skipTransition?: boolean;
}

/**
 * Check if the browser supports View Transitions API
 */
export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

/**
 * Apply view transition with specified configuration
 */
export function applyViewTransition(
  callback: () => Promise<void> | void,
  config: TransitionConfig = {}
): Promise<void> | void {
  const { skipTransition = false } = config;

  // Skip if not supported or explicitly disabled
  if (!supportsViewTransitions() || skipTransition) {
    return callback();
  }

  return new Promise((resolve) => {
    document.startViewTransition(async () => {
      resolve();
      await callback();
    });
  });
}

/**
 * Get CSS class name for transition type
 */
export function getTransitionClassName(type: TransitionType): string {
  return `transition-${type}`;
}

/**
 * Default transition configurations
 */
export const TRANSITION_PRESETS = {
  fade: {
    duration: 300,
    type: 'fade' as TransitionType,
  },
  slide: {
    duration: 400,
    type: 'slide' as TransitionType,
  },
  scale: {
    duration: 350,
    type: 'scale' as TransitionType,
  },
  fast: {
    duration: 200,
    type: 'fade' as TransitionType,
  },
  slow: {
    duration: 600,
    type: 'fade' as TransitionType,
  },
} as const;

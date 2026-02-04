/**
 * Exercise Loader
 * 
 * Loads exercises based on the current locale.
 * Automatically imports the correct exercise file for the user's language.
 */

import { getLocale } from "$lib/paraglide/runtime.js";
import exercisesEn from "$lib/exercises.json";
import exercisesVi from "$lib/exercises-vi.json";

export type Exercise = {
  name: string;
  category: string;
  level: string;
  tags: string[];
  description: string;
  key_principles: string;
  key_technical_checkpoints: string;
  tutor_video: string;
  instructions: string[];
};

/**
 * Get exercises for the current locale
 */
export function getExercises(): Exercise[] {
  const locale = getLocale();
  
  switch (locale) {
    case "vi":
      return exercisesVi as Exercise[];
    case "en":
    default:
      return exercisesEn as Exercise[];
  }
}

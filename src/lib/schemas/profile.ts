import { z } from "zod";
import * as m from "$lib/paraglide/messages.js";

// Helper functions to get translated options
export function getEquipmentOptions() {
  return [
    { label: m.equipment_fullGym(), value: "Full Gym" },
    { label: m.equipment_dumbbells(), value: "Dumbbells Only" },
    { label: m.equipment_bodyweight(), value: "Bodyweight" },
    { label: m.equipment_homeGym(), value: "Home Gym" },
    { label: m.equipment_resistanceBands(), value: "Resistance Bands" },
  ];
}

export function getGenderOptions() {
  return [
    { label: m.gender_male(), value: "Male" },
    { label: m.gender_female(), value: "Female" },
    { label: m.gender_other(), value: "Other" },
  ];
}

export function getFitnessLevelOptions() {
  return [
    { label: m.fitnessLevel_beginner(), value: "Beginner" },
    { label: m.fitnessLevel_intermediate(), value: "Intermediate" },
    { label: m.fitnessLevel_advanced(), value: "Advanced" },
  ];
}

export function getTargetOptions() {
  return [
    { label: m.target_loseWeight(), value: "Lose Weight" },
    { label: m.target_buildMuscle(), value: "Build Muscle" },
    { label: m.target_improveEndurance(), value: "Improve Endurance" },
    { label: m.target_increaseStrength(), value: "Increase Strength" },
    { label: m.target_toneBody(), value: "Tone Body" },
    { label: m.target_flexibility(), value: "Flexibility & Mobility" },
    { label: m.target_generalFitness(), value: "General Fitness" },
  ];
}

export function getLimitationOptions() {
  return [
    { label: m.limitation_none(), value: "None" },
    { label: m.limitation_backPain(), value: "Back Pain" },
    { label: m.limitation_kneePain(), value: "Knee Pain" },
    { label: m.limitation_shoulderPain(), value: "Shoulder Pain" },
    { label: m.limitation_jointIssues(), value: "Joint Issues" },
    { label: m.limitation_limitedMobility(), value: "Limited Mobility" },
    { label: m.limitation_cardiovascular(), value: "Cardiovascular Issues" },
    { label: m.limitation_asthma(), value: "Asthma" },
    { label: m.limitation_recovering(), value: "Recovering from Injury" },
  ];
}

export function getMuscleOptions() {
  return [
    { label: "Arms", value: "Arms" },
    { label: "Back", value: "Back" },
    { label: "Calves", value: "Calves" },
    { label: "Chest", value: "Chest" },
    { label: "Core", value: "Core" },
    { label: "Forearms", value: "Forearms" },
    { label: "HIIT", value: "HIIT" },
    { label: "Hips", value: "Hips" },
    { label: "Legs", value: "Legs" },
    { label: "Neck", value: "Neck" },
    { label: "Shoulders", value: "Shoulders" },
    { label: "Waist", value: "Waist" },
  ];
}

export function getReminderTimeOptions() {
  return [
    { label: m.reminder_15min(), value: 15 },
    { label: m.reminder_30min(), value: 30 },
    { label: m.reminder_1hour(), value: 60 },
    { label: m.reminder_2hours(), value: 120 },
  ];
}

// Legacy exports (for backward compatibility - uses current locale)
export const equipmentOptions = getEquipmentOptions();
export const genderOptions = getGenderOptions();
export const fitnessLevelOptions = getFitnessLevelOptions();
export const targetOptions = getTargetOptions();
export const limitationOptions = getLimitationOptions();
export const muscleOptions = getMuscleOptions();
export const reminderTimeOptions = getReminderTimeOptions();

// Profile schema with i18n validation messages
export function getProfileSchema() {
  return z.object({
    age: z.coerce
      .number()
      .gt(0, m.validation_ageInvalid())
      .gt(16, m.validation_ageTooYoung())
      .lt(40, m.validation_ageTooOld()),
    weight: z.coerce
      .number()
      .gt(20, m.validation_weightInvalid())
      .gt(40, m.validation_weightTooLow())
      .lt(150, m.validation_weightTooHigh()),
    height: z.coerce
      .number()
      .gt(50, m.validation_heightInvalid())
      .gt(110, m.validation_heightTooLow())
      .lt(200, m.validation_heightTooHigh()),
    equipment: z
      .string()
      .refine((val) => getEquipmentOptions().some((o) => o.value === val), {
        message: m.validation_required(),
      }),
    schedule: z.string().refine(
      (val) => {
        const parts = val.split(",").map((p) => p.trim());
        const regex =
          /^\d+\s*(hr|hrs|hour|hours|min|mins|minute|minutes|day|days)\s*\/\s*(day|week)$/i;
        return parts.every((part) => regex.test(part));
      },
      {
        message: "Format: 'X mins/day', 'X hrs/day', 'X days/week' or comma separated",
      },
    ),
    limitations: z
      .array(z.string())
      .min(1, { message: m.validation_required() })
      .refine((val) => val.every((v) => getLimitationOptions().some((o) => o.value === v)), {
        message: m.validation_required(),
      }),
    target: z
      .array(z.string())
      .min(1, { message: m.validation_required() })
      .refine((val) => val.every((v) => getTargetOptions().some((o) => o.value === v)), {
        message: m.validation_required(),
      }),
    primaryFocus: z
      .string()
      .optional()
      .refine((val) => !val || getMuscleOptions().some((o) => o.value === val), {
        message: m.validation_required(),
      }),
    secondaryFocus: z
      .string()
      .optional()
      .refine((val) => !val || getMuscleOptions().some((o) => o.value === val), {
        message: m.validation_required(),
      }),
    gender: z.string().refine((val) => getGenderOptions().some((o) => o.value === val), {
      message: m.validation_required(),
    }),
    fitnessLevel: z.string().refine((val) => getFitnessLevelOptions().some((o) => o.value === val), {
      message: m.validation_required(),
    }),
    preferredWorkoutTime: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
          return timeRegex.test(val);
        },
        { message: "Invalid time format. Use HH:mm (e.g., 18:00)" }
      ),
    reminderMinutesBefore: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z.coerce.number().optional(),
    ),
    notificationsEnabled: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z.boolean().optional(),
    ),
  });
}

// Legacy export (for backward compatibility)
export const profileSchema = getProfileSchema();

export type ProfileFormData = z.infer<typeof profileSchema>;

export function createInitialProfileData(): Record<string, any> {
  const schemaShape = profileSchema.shape;
  const initialData: Record<string, any> = {};

  for (const key in schemaShape) {
    if (key === "limitations" || key === "target") {
      initialData[key] = [];
    } else if (
      key === "notificationsEnabled" ||
      key === "reminderMinutesBefore"
    ) {
      // Optional non-string fields: "" fails z.boolean() / pollutes z.coerce.number()
      initialData[key] = undefined;
    } else {
      initialData[key] = "";
    }
  }

  return initialData;
}

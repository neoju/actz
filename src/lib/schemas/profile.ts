import { z } from "zod";

export const equipmentOptions = [
  "Full Gym",
  "Dumbbells Only",
  "Bodyweight",
  "Home Gym",
  "Resistance Bands",
].map((opt) => ({ label: opt, value: opt }));

export const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

export const fitnessLevelOptions = [
  { label: "Beginner", value: "Beginner" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced", value: "Advanced" },
];

export const targetOptions = [
  { label: "Lose Weight", value: "Lose Weight" },
  { label: "Build Muscle", value: "Build Muscle" },
  { label: "Improve Endurance", value: "Improve Endurance" },
  { label: "Increase Strength", value: "Increase Strength" },
  { label: "Tone Body", value: "Tone Body" },
  { label: "Flexibility & Mobility", value: "Flexibility & Mobility" },
  { label: "General Fitness", value: "General Fitness" },
];

export const limitationOptions = [
  { label: "None", value: "None" },
  { label: "Back Pain", value: "Back Pain" },
  { label: "Knee Pain", value: "Knee Pain" },
  { label: "Shoulder Pain", value: "Shoulder Pain" },
  { label: "Joint Issues", value: "Joint Issues" },
  { label: "Limited Mobility", value: "Limited Mobility" },
  { label: "Cardiovascular Issues", value: "Cardiovascular Issues" },
  { label: "Asthma", value: "Asthma" },
  { label: "Recovering from Injury", value: "Recovering from Injury" },
];

export const muscleOptions = [
  "Arms",
  "Back",
  "Calves",
  "Chest",
  "Core",
  "Forearms",
  "HIIT",
  "Hips",
  "Legs",
  "Neck",
  "Shoulders",
  "Waist",
].map((opt) => ({ label: opt, value: opt }));

export const profileSchema = z.object({
  age: z.coerce
    .number()
    .gt(0, "Please enter a valid age.")
    .gt(16, "Sorry, this app is not for kids.")
    .lt(40, "You are quite experienced! Maybe too experienced for this app?"),
  weight: z.coerce
    .number()
    .gt(20, "Please enter a valid weight.")
    .gt(40, "Please consult a doctor.")
    .lt(150, "Please consult a doctor."),
  height: z.coerce
    .number()
    .gt(50, "Please enter a valid height.")
    .gt(110, "You are too short for this app :))")
    .lt(200, "You are too tall for this app."),
  equipment: z
    .string()
    .refine((val) => equipmentOptions.some((o) => o.value === val), {
      message: "Please select valid equipment.",
    }),
  schedule: z.string().refine(
    (val) => {
      const parts = val.split(",").map((p) => p.trim());
      // Updated regex to support flexible time and frequency formats
      // Valid examples:
      // - "30 mins/day" or "30mins/day"
      // - "1 hr/day" or "1hr/day"
      // - "2 hours/day" or "2hours/day"
      // - "3 days/week" or "3days/week"
      // - "30mins/day, 3days/week" (comma-separated combinations)
      const regex =
        /^\d+\s*(hr|hrs|hour|hours|min|mins|minute|minutes|day|days)\s*\/\s*(day|week)$/i;
      return parts.every((part) => regex.test(part));
    },
    {
      message:
        "Format: 'X mins/day', 'X hrs/day', 'X days/week' or comma separated (e.g. '30mins/day, 3days/week')",
    },
  ),
  limitations: z
    .array(z.string())
    .refine((val) => val.every((v) => limitationOptions.some((o) => o.value === v)), {
      message: "Please select valid limitations.",
    }),
  target: z
    .string()
    .refine((val) => targetOptions.some((o) => o.value === val), {
      message: "Please select a valid goal.",
    }),
  primaryFocus: z
    .string()
    .optional()
    .refine((val) => !val || muscleOptions.some((o) => o.value === val), {
      message: "Please select a valid muscle group.",
    }),
  secondaryFocus: z
    .string()
    .optional()
    .refine((val) => !val || muscleOptions.some((o) => o.value === val), {
      message: "Please select a valid muscle group.",
    }),
  gender: z.string().min(1, "Please select gender"),
  fitnessLevel: z.string().min(1, "Please select fitness level"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Creates an initial profile data object with empty string defaults
 * Programmatically generated from the schema shape
 */
export function createInitialProfileData(): Record<string, any> {
  const schemaShape = profileSchema.shape;
  const initialData: Record<string, any> = {};

  // Programmatically create initial data from schema keys
  for (const key in schemaShape) {
    initialData[key] = "";
  }

  return initialData;
}

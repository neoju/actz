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
    .string()
    .optional()
    .refine((val) => !val || val.trim().split(/\s+/).length <= 50, {
      message: "Max 50 words allowed.",
    }),
  target: z.string().refine((val) => val.trim().split(/\s+/).length <= 100, {
    message: "Max 100 words allowed.",
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

import { json } from "@sveltejs/kit";
import prisma from "$lib/prisma";

/** Demo profile that satisfies client validation rules and plan generation. */
const SAMPLE_PROFILE = {
  age: 28,
  gender: "Male",
  weight: 72,
  height: 178,
  fitnessLevel: "Intermediate",
  equipment: "Full Gym",
  schedule: "30 mins/day, 3 days/week",
  limitations: "None",
  target: "Build Muscle,General Fitness",
  primaryFocus: "Chest",
  secondaryFocus: "Legs",
  preferredWorkoutTime: "18:00",
  reminderMinutesBefore: 30,
  notificationsEnabled: false,
} as const;

export async function POST({ locals }) {
  try {
    const session = await locals.auth();
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        age: SAMPLE_PROFILE.age,
        gender: SAMPLE_PROFILE.gender,
        weight: SAMPLE_PROFILE.weight,
        height: SAMPLE_PROFILE.height,
        fitnessLevel: SAMPLE_PROFILE.fitnessLevel,
        equipment: SAMPLE_PROFILE.equipment,
        schedule: SAMPLE_PROFILE.schedule,
        limitations: SAMPLE_PROFILE.limitations,
        target: SAMPLE_PROFILE.target,
        primaryFocus: SAMPLE_PROFILE.primaryFocus,
        secondaryFocus: SAMPLE_PROFILE.secondaryFocus,
        preferredWorkoutTime: SAMPLE_PROFILE.preferredWorkoutTime,
        reminderMinutesBefore: SAMPLE_PROFILE.reminderMinutesBefore,
        notificationsEnabled: SAMPLE_PROFILE.notificationsEnabled,
      },
    });

    let bmi: string | null = null;
    if (updatedUser.height && updatedUser.weight) {
      const heightInMeters = updatedUser.height / 100;
      bmi = (updatedUser.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    return json({
      success: true,
      user: { ...updatedUser, bmi },
    });
  } catch (e) {
    console.error("Sample profile update error:", e);
    return json({ error: "Failed to apply sample profile" }, { status: 500 });
  }
}

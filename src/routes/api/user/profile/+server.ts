import { json } from "@sveltejs/kit";
import prisma from "$lib/prisma";

export async function POST({ request, locals }) {
  try {
    const session = await locals.auth();
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    let {
      age,
      gender,
      weight,
      height,
      fitnessLevel,
      equipment,
      schedule,
      limitations,
      target,
      primaryFocus,
      secondaryFocus,
      preferredWorkoutTime,
      reminderMinutesBefore,
      notificationsEnabled,
    } = data;

    // Handle limitations array from frontend
    if (Array.isArray(limitations)) {
      limitations = limitations.join(",");
    }

    // Handle target array from frontend
    if (Array.isArray(target)) {
      target = target.join(",");
    }

    // Update User Profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        age: age ? Number(age) : undefined,
        gender,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        fitnessLevel,
        equipment,
        schedule,
        limitations,
        target,
        primaryFocus,
        secondaryFocus,
        preferredWorkoutTime,
        language: data.language,
        reminderMinutesBefore: reminderMinutesBefore ? Number(reminderMinutesBefore) : undefined,
        notificationsEnabled: notificationsEnabled !== undefined ? Boolean(notificationsEnabled) : undefined,
      },
    });

    // Calculate BMI
    let bmi = null;
    if (updatedUser.height && updatedUser.weight) {
      const heightInMeters = updatedUser.height / 100;
      bmi = (updatedUser.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    return json({
      success: true,
      user: { ...updatedUser, bmi },
    });
  } catch (e) {
    console.error("Profile Update Error:", e);
    return json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function GET({ locals }) {
  try {
    const session = await locals.auth();
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return json({ error: "User not found" }, { status: 404 });
    }

    // Calculate BMI if height and weight exist
    let bmi = null;
    if (user.height && user.weight) {
      const heightInMeters = user.height / 100;
      bmi = (user.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    return json({
      user: {
        ...user,
        bmi,
      },
    });
  } catch (e) {
    console.error("Profile Fetch Error:", e);
    return json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

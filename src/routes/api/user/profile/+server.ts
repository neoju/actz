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
    } = data;

    // Handle limitations array from frontend
    if (Array.isArray(limitations)) {
      limitations = limitations.join(",");
    }

    // Handle target array from frontend
    if (Array.isArray(target)) {
      target = target.join(",");
    }

    // Validate required fields
    if (!age || !gender || !weight || !height || !fitnessLevel) {
      return json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update User Profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        age: Number(age),
        gender,
        weight: Number(weight),
        height: Number(height),
        fitnessLevel,
        equipment,
        schedule,
        limitations,
        target,
        primaryFocus,
        secondaryFocus,
      },
    });

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    return json({
      success: true,
      user: {
        id: updatedUser.id,
        age: updatedUser.age,
        gender: updatedUser.gender,
        weight: updatedUser.weight,
        height: updatedUser.height,
        bmi,
        fitnessLevel: updatedUser.fitnessLevel,
        equipment: updatedUser.equipment,
        schedule: updatedUser.schedule,
        limitations: updatedUser.limitations,
        target: updatedUser.target,
        primaryFocus: updatedUser.primaryFocus,
        secondaryFocus: updatedUser.secondaryFocus,
      },
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
      select: {
        id: true,
        age: true,
        gender: true,
        weight: true,
        height: true,
        fitnessLevel: true,
        equipment: true,
        schedule: true,
        limitations: true,
        target: true,
        primaryFocus: true,
        secondaryFocus: true,
      },
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

import { json } from "@sveltejs/kit";
import prisma from "$lib/prisma";

export async function POST({ request, locals }) {
  const session = await locals.auth();
  if (!session?.user?.id) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { plannedExerciseId, status, activityId } = data;

    if (activityId) {
        // Update existing activity
        const updated = await prisma.exerciseActivity.update({
            where: { id: activityId },
            data: {
                status,
                completedAt: status === 'COMPLETED' ? new Date() : undefined,
            }
        });
        return json(updated);
    } else {
        // Create new activity
        const created = await prisma.exerciseActivity.create({
            data: {
                userId: session.user.id,
                plannedExerciseId,
                status,
                startedAt: new Date(),
            }
        });
        return json(created);
    }

  } catch (e) {
    console.error("Activity API Error:", e);
    return json({ error: "Failed to update activity" }, { status: 500 });
  }
}

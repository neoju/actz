import { error, redirect } from "@sveltejs/kit";
import prisma from "$lib/prisma";

export async function load({ params, locals }) {
  const session = await locals.auth();
  if (!session?.user) {
    throw redirect(303, "/signin");
  }

  const { dayId } = params;

  const dayPlan = await prisma.dayPlan
    .findUnique({
      where: { id: dayId },
      include: {
        weeklyPlan: true,
        exercises: {
          orderBy: { order: "asc" },
          include: {
            activities: {
              where: { userId: session.user.id },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    })
    .catch(() => {
      throw error(404, "Day plan not found");
    });

  if (!dayPlan) {
    throw error(404, "Day plan not found");
  }

  if (dayPlan.weeklyPlan.userId !== session.user.id) {
    throw error(403, "Unauthorized");
  }

  return {
    day: dayPlan,
  };
}

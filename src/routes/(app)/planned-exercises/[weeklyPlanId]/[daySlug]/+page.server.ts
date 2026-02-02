import { error, redirect } from "@sveltejs/kit";
import prisma from "$lib/prisma";

export async function load({ params, locals }) {
  const session = await locals.auth();
  if (!session?.user) {
    throw redirect(303, "/signin");
  }

  const { weeklyPlanId, daySlug } = params;
  const wId = parseInt(weeklyPlanId);

  if (isNaN(wId)) {
    throw error(404, "Invalid plan ID");
  }

  const dayPlan = await prisma.dayPlan
    .findUnique({
      where: {
        weeklyPlanId_slug: {
          weeklyPlanId: wId,
          slug: daySlug,
        },
      },
      include: {
        weeklyPlan: {
          select: {
            userId: true,
            startDate: true,
          },
        },
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

  // Calculate if this day is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const planStartDate = new Date(dayPlan.weeklyPlan.startDate);
  planStartDate.setHours(0, 0, 0, 0);

  const dayDate = new Date(planStartDate);
  dayDate.setDate(planStartDate.getDate() + (dayPlan.order - 1));

  const isPastDay = dayDate < today;

  return {
    day: dayPlan,
    isPastDay,
  };
}

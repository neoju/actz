import { redirect } from "@sveltejs/kit";
import prisma from "$lib/prisma";

export async function load({ locals }) {
  const session = await locals.auth();
  if (!session?.user) {
    throw redirect(303, "/login");
  }

  // Check if user has an active plan
  const activePlan = await prisma.weeklyPlan.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: {
              activities: {
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            }
          },
        },
      },
    },
  });

  if (!activePlan) {
      // If no plan, redirect to home or settings? 
      // Or just render null and let the UI handle it (e.g. "No active plan found")
      return {
          plan: null,
          user: session.user
      };
  }

  return {
    plan: activePlan,
    user: session.user
  };
}

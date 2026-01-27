import { redirect } from "@sveltejs/kit";
import prisma from "$lib/prisma";

export async function load({ locals }) {
  const session = await locals.auth();
  if (!session?.user) {
    throw redirect(303, "/signin"); // Or wherever login is
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
    // Check if user needs onboarding
    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user?.age || !user?.weight) {
        throw redirect(303, "/onboarding");
    }

    // If user has data but no plan, maybe they finished one? Or error?
    // For now redirect to onboarding to create one
    throw redirect(303, "/onboarding");
  }

  return {
    plan: activePlan,
    user: session.user
  };
}

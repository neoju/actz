import { redirect } from "@sveltejs/kit";
import prisma from "$lib/prisma";

export async function load({ locals }) {
  const session = await locals.auth();
  if (!session?.user) {
    throw redirect(303, "/login");
  }

  // Check if user has an active plan (just get ID to know it exists)
  const activePlan = await prisma.weeklyPlan.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    select: {
      id: true
    }
  });

  return {
    hasActivePlan: !!activePlan,
    user: session.user
  };
}
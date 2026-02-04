import { redirect } from "@sveltejs/kit";
import prisma from "$lib/prisma";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, depends }) => {
  depends("app:planLimit");
  const session = await locals.auth();
  if (!session?.user?.id) {
    throw redirect(303, "/");
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const logs = await prisma.planGenerationLog.findMany({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: oneWeekAgo,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const used = logs.length;
  const max = 5;
  let resetAt = null;

  if (used > 0) {
    // The next slot frees up when the OLDEST log in the window expires.
    // That is: oldestLog.createdAt + 7 days
    const oldestLog = logs[0];
    const resetDate = new Date(oldestLog.createdAt);
    resetDate.setDate(resetDate.getDate() + 7);
    resetAt = resetDate.toISOString();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      notificationsEnabled: true,
      preferredWorkoutTime: true,
      reminderMinutesBefore: true,
    },
  });

  return {
    profile: user,
    planLimit: {
      used,
      max,
      resetAt,
      remaining: Math.max(0, max - used),
    },
  };
};

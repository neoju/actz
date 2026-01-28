import { redirect, type Handle } from "@sveltejs/kit";
import { handle as authenticationHandle } from "$lib/auth";
import { sequence } from "@sveltejs/kit/hooks";
import prisma from "$lib/prisma";

const authorizationHandle: Handle = async ({ event, resolve }) => {
  const session = await event.locals.auth();
  const path = event.url.pathname;

  // Define public paths
  const isPublic =
    path === "/" ||
    path.startsWith("/terms") ||
    path.startsWith("/privacy-policy") ||
    path.startsWith("/auth");

  // If not logged in and trying to access protected routes (not public), redirect to homepage
  if (!session && !isPublic) {
    throw redirect(303, "/");
  }

  // Check if logged-in user has completed profile (onboarding)
  if (session?.user?.id && !path.startsWith("/api")) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        age: true,
        gender: true,
        weight: true,
        height: true,
        fitnessLevel: true,
        equipment: true,
        schedule: true,
        target: true,
      },
    });

    // Check if profile is incomplete (any required field is missing)
    const hasIncompleteProfile =
      !user ||
      !user.age ||
      !user.gender ||
      !user.weight ||
      !user.height ||
      !user.fitnessLevel ||
      !user.equipment ||
      !user.schedule ||
      !user.target;

    // Redirect to onboarding if profile is incomplete
    if (hasIncompleteProfile && !path.startsWith("/onboarding")) {
      throw redirect(303, "/onboarding");
    }
  }

  // If logged in with complete profile and on homepage (signin page), redirect to dashboard
  if (session && path === "/") {
    throw redirect(303, "/dashboard");
  }

  return resolve(event);
};

export const handle = sequence(authenticationHandle, authorizationHandle);

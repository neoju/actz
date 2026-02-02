import { redirect, type Handle } from "@sveltejs/kit";
import { handle as authenticationHandle } from "$lib/auth";
import { sequence } from "@sveltejs/kit/hooks";

const authorizationHandle: Handle = async ({ event, resolve }) => {
  const session = await event.locals.auth();
  const path = event.url.pathname;

  // Define public paths
  const isPublic =
    path === "/login" ||
    path.startsWith("/terms") ||
    path.startsWith("/privacy-policy") ||
    path.startsWith("/auth");

  // If not logged in and trying to access protected routes (not public), redirect to onboarding
  if (!session && !isPublic) {
    throw redirect(303, "/login");
  }

  return resolve(event);
};

export const handle = sequence(authenticationHandle, authorizationHandle);

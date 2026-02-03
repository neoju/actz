import { json } from "@sveltejs/kit";
import prisma from "$lib/prisma";

export async function POST({ request, locals }) {
  try {
    const session = await locals.auth();
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscription } = await request.json();

    if (!subscription) {
      return json({ error: "Missing subscription data" }, { status: 400 });
    }

    // Store push subscription in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pushSubscription: subscription,
        notificationsEnabled: true,
      },
    });

    return json({ success: true, message: "Subscribed to push notifications" });
  } catch (e) {
    console.error("Push Subscription Error:", e);
    return json({ error: "Failed to subscribe to notifications" }, { status: 500 });
  }
}

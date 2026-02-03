import { json } from "@sveltejs/kit";
import prisma from "$lib/prisma";

export async function POST({ locals }) {
  try {
    const session = await locals.auth();
    if (!session?.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clear push subscription from database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pushSubscription: null as any,
        notificationsEnabled: false,
      },
    });

    return json({ success: true, message: "Unsubscribed from push notifications" });
  } catch (e) {
    console.error("Push Unsubscription Error:", e);
    return json({ error: "Failed to unsubscribe from notifications" }, { status: 500 });
  }
}

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/prisma";
import { sendPushNotification } from "$lib/server/notifications";

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth();

  if (!session?.user?.id) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, subscription } = await request.json();

    // Validate action parameter
    if (!action || !["subscribe", "unsubscribe", "test"].includes(action)) {
      return json(
        { error: "Invalid action. Must be 'subscribe', 'unsubscribe', or 'test'" },
        { status: 400 }
      );
    }

    if (action === "subscribe") {
      // Subscribe to push notifications
      if (!subscription) {
        return json({ error: "Missing subscription data" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          pushSubscription: subscription,
          notificationsEnabled: true,
        },
      });

      return json({
        success: true,
        message: "Subscribed to push notifications",
      });
    } else if (action === "test") {
      // Send a test notification immediately
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      });

      if (!user?.pushSubscription) {
        return json({ error: "No active subscription found for test" }, { status: 400 });
      }

      const success = await sendPushNotification(user.pushSubscription, {
        title: "ACTZ - Test Notification",
        body: "Your push notifications are configured correctly! 💪",
        data: { url: "/" }
      });

      if (!success) {
        return json({ error: "Failed to deliver test notification" }, { status: 500 });
      }

      return json({ success: true, message: "Test notification sent" });
    } else {
      // Unsubscribe from push notifications
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          pushSubscription: null as any,
          notificationsEnabled: false,
        },
      });

      return json({
        success: true,
        message: "Unsubscribed from push notifications",
      });
    }
  } catch (error) {
    console.error("Notification action error:", error);
    return json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
};

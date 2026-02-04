import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/prisma';
import { sendPushNotification } from '$lib/server/notifications';

/**
 * Vercel Cron Job to send workout reminders
 * 
 * Frequency: Every 15 minutes (configurable)
 * Logic:
 * 1. Find users with notificationsEnabled = true and pushSubscription != null
 * 2. Calculate if their preferredWorkoutTime is within the next 30 minutes
 * 3. Send notification if not already sent today
 */
export const GET: RequestHandler = async ({ request }) => {
  // 1. Basic Auth for Cron (Vercel sets CRON_SECRET)
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Fetch users with notifications enabled and their active weekly plans
    const users = await prisma.user.findMany({
      where: {
        notificationsEnabled: true,
        preferredWorkoutTime: { not: null }
      },
      include: {
        weeklyPlans: {
          where: { isActive: true },
          include: {
            days: {
              include: {
                exercises: {
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    const results = {
      total: users.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      restDay: 0,
      noActivePlan: 0
    };

    for (const user of users) {
      if (!user.preferredWorkoutTime || !user.pushSubscription) continue;

      // 1. Check for active plan
      const activePlan = user.weeklyPlans[0];
      if (!activePlan) {
        results.noActivePlan++;
        results.skipped++;
        continue;
      }

      // 2. Calculate current day index (same logic as planned-exercises page)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(activePlan.startDate);
      start.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - start.getTime();
      const currentDayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Sort days to find today's workout
      const days = activePlan.days.sort((a, b) => a.order - b.order);
      const currentDay = days[currentDayIndex];

      // 3. Check if plan is completed or today is a rest day
      if (!currentDay) {
        results.skipped++;
        continue;
      }

      const isRestDay =
        currentDay.exercises.length === 0 ||
        currentDay.title.toLowerCase().includes('rest') ||
        currentDay.dayName.toLowerCase().includes('rest');

      if (isRestDay) {
        results.restDay++;
        results.skipped++;
        continue;
      }

      const [workoutHour, workoutMinute] = user.preferredWorkoutTime.split(':').map(Number);
      const reminderMinutes = user.reminderMinutesBefore || 30;

      // Calculate target reminder time
      const workoutTimeInMinutes = workoutHour * 60 + workoutMinute;
      const nowInMinutes = currentHour * 60 + currentMinute;
      const reminderTimeInMinutes = workoutTimeInMinutes - reminderMinutes;

      // Check if we are within the notification window (e.g., within 15 mins of target)
      // This prevents duplicate sends if cron runs frequently, and missed sends if it runs rarely.
      const timeDiff = nowInMinutes - reminderTimeInMinutes;

      // Logic: Send if we are 0-15 minutes PAST the target reminder time
      if (timeDiff >= 0 && timeDiff < 15) {
        const success = await sendPushNotification(user.pushSubscription, {
          title: 'ACTZ - Workout Reminder',
          body: `It's almost time for your workout! 💪 Get ready to hit your goals today.`,
          data: { url: '/planned-exercises' }
        });

        if (success) {
          results.sent++;
        } else {
          // If sending failed with 410/404, we should disable notifications for this user
          await prisma.user.update({
            where: { id: user.id },
            data: {
              notificationsEnabled: false,
              pushSubscription: null as any
            }
          });
          results.failed++;
        }
      } else {
        results.skipped++;
      }
    }

    console.warn("DEBUGPRINT[264]: +server.ts:137: results=", results)
    return json({ success: true, results });
  } catch (error) {
    console.error('Cron job error:', error);
    return json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
};

import webpush from 'web-push';
import { PUBLIC_VAPID_PUBLIC_KEY } from '$env/static/public';
import { VAPID_PRIVATE_KEY } from '$env/static/private';

// Configure VAPID keys
if (PUBLIC_VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
	webpush.setVapidDetails(
		'mailto:support@actz.app', // Change to your actual support email
		PUBLIC_VAPID_PUBLIC_KEY,
		VAPID_PRIVATE_KEY
	);
}

export type PushPayload = {
	title: string;
	body: string;
	data?: any;
};

/**
 * Send a push notification to a specific subscription
 */
export async function sendPushNotification(
	subscription: any,
	payload: PushPayload
): Promise<boolean> {
	if (!subscription) return false;

	try {
		await webpush.sendNotification(
			subscription,
			JSON.stringify(payload)
		);
		return true;
	} catch (error: any) {
		// Handle 410 Gone or 404 Not Found (subscription expired or removed)
		if (error.statusCode === 410 || error.statusCode === 404) {
			console.warn('Push subscription has expired or is invalid');
			return false;
		}
		console.error('Error sending push notification:', error);
		throw error;
	}
}

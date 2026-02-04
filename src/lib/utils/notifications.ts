import { PUBLIC_VAPID_PUBLIC_KEY } from '$env/static/public';

/**
 * Notification Utilities for ACTZ
 * 
 * Handles push notification permissions, subscriptions, and scheduling
 * for workout reminders using PWA service worker.
 */

const VAPID_PUBLIC_KEY = PUBLIC_VAPID_PUBLIC_KEY || '';

/**
 * Request notification permission from browser
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
	if (!('Notification' in window)) {
		throw new Error('Notifications not supported in this browser');
	}

	const permission = await Notification.requestPermission();
	return permission;
}

/**
 * Check if notifications are supported and permission granted
 */
export function areNotificationsSupported(): boolean {
	return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | null {
	if (!('Notification' in window)) return null;
	return Notification.permission;
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription> {
	if (!('serviceWorker' in navigator)) {
		throw new Error('Service Worker not supported');
	}

	// Get service worker registration
	const registration = await navigator.serviceWorker.ready;

	// Check for existing subscription
	let subscription = await registration.pushManager.getSubscription();

	// If no subscription, create one
	if (!subscription) {
		const convertedVapidKey = VAPID_PUBLIC_KEY 
			? urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
			: undefined;

		subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: convertedVapidKey as BufferSource | undefined,
		});
	}

	// Send subscription to server
	const response = await fetch('/api/notifications', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			action: 'subscribe',
			subscription: subscription.toJSON(),
		}),
	});

	if (!response.ok) {
		throw new Error('Failed to save subscription to server');
	}

	return subscription;
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<void> {
	if (!('serviceWorker' in navigator)) {
		throw new Error('Service Worker not supported');
	}

	const registration = await navigator.serviceWorker.ready;
	const subscription = await registration.pushManager.getSubscription();

	if (subscription) {
		await subscription.unsubscribe();
	}

	// Notify server
	await fetch('/api/notifications', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			action: 'unsubscribe',
		}),
	});
}

/**
 * Calculate next notification time based on workout time and reminder minutes
 */
export function calculateNotificationTime(
	workoutTime: string,
	reminderMinutesBefore: number
): Date | null {
	if (!workoutTime) return null;

	const [hours, minutes] = workoutTime.split(':').map(Number);
	
	const now = new Date();
	const workoutDate = new Date();
	workoutDate.setHours(hours, minutes, 0, 0);

	// Calculate notification time
	let notificationTime = new Date(workoutDate.getTime() - reminderMinutesBefore * 60 * 1000);

	// If notification time has passed, schedule for tomorrow
	if (notificationTime <= now) {
		workoutDate.setDate(workoutDate.getDate() + 1);
		notificationTime = new Date(workoutDate.getTime() - reminderMinutesBefore * 60 * 1000);
	}

	return notificationTime;
}

/**
 * Schedule local notification using setTimeout (client-side only)
 * Note: This is a simple implementation. For production, consider using
 * IndexedDB to persist schedules and periodic background sync.
 */
export function scheduleLocalNotification(
	title: string,
	body: string,
	scheduledTime: Date
): number | null {
	if (!areNotificationsSupported()) return null;

	const now = new Date();
	const delay = scheduledTime.getTime() - now.getTime();

	// If time has passed, don't schedule
	if (delay < 0) return null;

	// Schedule notification
	const timeoutId = window.setTimeout(() => {
		if (Notification.permission === 'granted') {
			navigator.serviceWorker.ready.then((registration) => {
				registration.showNotification(title, {
					body,
					icon: '/android-icon-192x192.png',
					badge: '/android-icon-96x96.png',
					tag: 'workout-reminder',
					requireInteraction: false,
				} as NotificationOptions);
			});
		}
	}, delay);

	return timeoutId;
}

/**
 * Show a test notification to verify setup
 */
export async function showTestNotification(): Promise<void> {
	if (!areNotificationsSupported()) {
		throw new Error('Notifications not supported');
	}

	if (Notification.permission !== 'granted') {
		throw new Error('Notification permission not granted');
	}

	const registration = await navigator.serviceWorker.ready;
	await registration.showNotification('ACTZ Test Notification', {
		body: 'Your workout reminders are set up correctly! 💪',
		icon: '/android-icon-192x192.png',
		badge: '/android-icon-96x96.png',
		tag: 'test-notification',
	} as NotificationOptions);
}

/**
 * Format time for display (HH:mm to 12-hour format)
 */
export function formatTimeDisplay(time: string): string {
	if (!time) return '';
	
	const [hours, minutes] = time.split(':').map(Number);
	const period = hours >= 12 ? 'PM' : 'AM';
	const displayHours = hours % 12 || 12;
	
	return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />
import { build, files, version } from '$service-worker';

declare let self: ServiceWorkerGlobalScope;

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
	...build, // the app itself
	...files  // everything in `static`
];

self.addEventListener('install', (event: ExtendableEvent) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event: ExtendableEvent) => {
	// Remove previous caches
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event: FetchEvent) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);

			if (response) {
				return response;
			}
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const response = await fetch(event.request);

			// if we're offline, fetch can return a value that is not a Response
			// instead of throwing - and we can't consume this-one
			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const response = await cache.match(event.request);

			if (response) {
				return response;
			}

			// if there's no cache, then just error out
			// as there is nothing we can do to respond to this request
			throw err;
		}
	}

	event.respondWith(respond());
});

// Push notification event handler
self.addEventListener('push', (event: PushEvent) => {
	const options = {
		body: 'Time to prepare for your workout! 💪',
		icon: '/android-icon-192x192.png',
		badge: '/android-icon-96x96.png',
		vibrate: [200, 100, 200],
		tag: 'workout-reminder',
		requireInteraction: false,
		actions: [
			{ action: 'view', title: 'View Workout' },
			{ action: 'dismiss', title: 'Dismiss' }
		]
	};

	if (event.data) {
		try {
			const data = event.data.json();
			options.body = data.body || options.body;
		} catch (e) {
			console.error('Failed to parse push data:', e);
		}
	}

	event.waitUntil(
		self.registration.showNotification('ACTZ - Workout Reminder', options)
	);
});

// Notification click event handler
self.addEventListener('notificationclick', (event: NotificationEvent) => {
	event.notification.close();

	if (event.action === 'view') {
		// Open the app to the planned exercises page
		event.waitUntil(
			(self.clients as any).openWindow('/planned-exercises')
		);
	} else if (event.action === 'dismiss') {
		// Just close the notification
		return;
	} else {
		// Default action: open the app
		event.waitUntil(
			(self.clients as any).openWindow('/')
		);
	}
});

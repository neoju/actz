let deferredPrompt: BeforeInstallPromptEvent | null = $state(null);
let isInstallable = $derived(deferredPrompt !== null);
let isInstalled = $state(false);

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const installStore = {
	get isInstallable() {
		return isInstallable;
	},
	get isInstalled() {
		return isInstalled;
	},
	setDeferredPrompt(prompt: BeforeInstallPromptEvent | null) {
		deferredPrompt = prompt;
	},
	setInstalled(installed: boolean) {
		isInstalled = installed;
	},
	async promptInstall(): Promise<'accepted' | 'dismissed' | null> {
		if (!deferredPrompt) return null;

		try {
			await deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			console.log(`Install prompt outcome: ${outcome}`);
			deferredPrompt = null;
			return outcome;
		} catch (error) {
			console.error('Error prompting install:', error);
			return null;
		}
	}
};

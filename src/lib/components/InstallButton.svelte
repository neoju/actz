<script lang="ts">
	import { installStore } from '$lib/stores/install.svelte';
	import { Download } from '@lucide/svelte';

	interface Props {
		variant?: 'default' | 'outline' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { variant = 'default', size = 'md', class: className = '' }: Props = $props();

	const sizeClasses = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2',
		lg: 'px-6 py-3 text-lg'
	};

	const variantClasses = {
		default: 'bg-primary-600 hover:bg-primary-700 text-white',
		outline:
			'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
		ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
	};

	async function handleInstall() {
		await installStore.promptInstall();
	}
</script>

{#if installStore.isInstallable && !installStore.isInstalled}
	<button
		onclick={handleInstall}
		class="inline-flex items-center gap-2 font-medium rounded-md transition-colors {sizeClasses[
			size
		]} {variantClasses[variant]} {className}"
	>
		<Download size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
		<span>Install App</span>
	</button>
{/if}

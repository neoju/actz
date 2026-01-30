<script lang="ts">
  import { installStore } from "$lib/stores/install.svelte";
  import { X, Download } from "@lucide/svelte";
  import Button from "./ui/button/button.svelte";

  let showPrompt = $state(false);
  let dismissed = $state(false);

  $effect(() => {
    if (installStore.isInstallable && !installStore.isInstalled && !dismissed) {
      // Show prompt after a short delay to not be too intrusive
      const timer = setTimeout(() => {
        showPrompt = true;
      }, 3000);
      return () => clearTimeout(timer);
    }
  });

  async function handleInstall() {
    const outcome = await installStore.promptInstall();
    if (outcome) {
      showPrompt = false;
    }
  }

  function handleDismiss() {
    showPrompt = false;
    dismissed = true;
    // Store dismissal in localStorage to not show again this session
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("install-prompt-dismissed", Date.now().toString());
    }
  }

  // Check if user dismissed recently (within 7 days)
  $effect(() => {
    if (typeof localStorage !== "undefined") {
      const dismissedTime = localStorage.getItem("install-prompt-dismissed");
      if (dismissedTime) {
        const daysSinceDismissal =
          (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissal < 7) {
          dismissed = true;
        }
      }
    }
  });
</script>

{#if showPrompt && !installStore.isInstalled}
  <div
    class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50
		       bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
		       p-4 animate-slide-up"
  >
    <button
      onclick={handleDismiss}
      class="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      aria-label="Dismiss"
    >
      <X size={16} class="text-gray-500" />
    </button>

    <div class="flex items-start gap-3">
      <div
        class="shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center"
      >
        <Download size={24} class="text-primary-600 dark:text-primary-400" />
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-1">
          Install Actz
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
          Install our app for quick access and a better experience
        </p>

        <div class="flex gap-2 justify-end">
          <Button variant="outline" onclick={handleInstall}>Install</Button>
          <Button variant="destructive" onclick={handleDismiss}>Not now</Button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
</style>

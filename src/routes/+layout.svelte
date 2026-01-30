<script lang="ts">
  import "./layout.css";
  import NavigationProgress from "$lib/components/NavigationProgress.svelte";
  import InstallPrompt from "$lib/components/InstallPrompt.svelte";
  import { page } from "$app/state";
  import { installStore } from "$lib/stores/install.svelte";
  import { onMount } from "svelte";

  let { children } = $props();

  $effect(() => {
    const user = page.data.session?.user;
    // If logged in and is a guest (no email), save the ID for future logins
    if (user && !user.email) {
      const currentDeviceId = localStorage.getItem("actz_device_id");
      if (currentDeviceId !== user.id) {
        localStorage.setItem("actz_device_id", user.id!);
      }
    }
  });

  onMount(() => {
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      installStore.setDeferredPrompt(e as any);
      console.log('beforeinstallprompt event fired');
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      installStore.setInstalled(true);
      installStore.setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (navigator as any).standalone === true;
    if (isStandalone) {
      installStore.setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  });
</script>

<NavigationProgress height={3} speed={300} />
<InstallPrompt />
{@render children()}

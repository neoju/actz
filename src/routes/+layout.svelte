<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { onNavigate } from "$app/navigation";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import NavigationProgress from "$lib/components/navigation-progress.svelte";

  import "./layout.css";
  import "$lib/styles/view-transitions.css";

  let { children } = $props();

  // Initialize TanStack Query Client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  // Register service worker
  onMount(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
    }
  });

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

  // Enable view transitions with fade animation
  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      try {
        document.startViewTransition(async () => {
          resolve();
          await navigation.complete;
        });
      } catch (e) {
        resolve();
        navigation.complete;
      }
    });
  });
</script>

<NavigationProgress height={3} speed={300} />
<QueryClientProvider client={queryClient}>
  {@render children()}
</QueryClientProvider>

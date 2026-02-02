<script lang="ts">
  import { page } from "$app/state";
  import NavigationProgress from "$lib/components/navigation-progress.svelte";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";

  import "$lib/styles/view-transitions.css";
  import "./layout.css";
  import { onNavigate } from "$app/navigation";

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

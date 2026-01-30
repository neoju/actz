<script lang="ts">
  import "./layout.css";
  import NavigationProgress from "$lib/components/NavigationProgress.svelte";
  import { page } from "$app/state";

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
</script>

<NavigationProgress height={3} speed={300} />
{@render children()}

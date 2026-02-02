<script lang="ts">
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import { ChevronLeft } from "@lucide/svelte";
  import { ModeWatcher } from "mode-watcher";
  import { Toaster } from "$lib/components/ui/sonner";
  import AppMenu from "$lib/components/app-menu.svelte";

  let { children } = $props();

  onMount(() => {
    const session = page.data.session;

    if (session?.user) {
      if (session.user.id) localStorage.setItem("user_id", session.user.id);
      document.cookie =
        "auth_state=true; path=/; max-age=31536000; SameSite=Lax";
    }
  });
</script>

<ModeWatcher />
<Toaster richColors position="top-center" />
<div
  class="min-h-screen bg-muted/20 text-foreground font-sans antialiased flex
    justify-center"
>
  <div
    class="w-full max-w-md min-h-screen bg-background shadow-2xl overflow-hidden
      relative flex flex-col border-x border-border"
  >
    <!-- Mobile Header with Hamburger Menu -->
    <header
      class="fixed max-w-md w-screen mx-auto top-0 z-40 bg-background border-b
        border-border p-4 flex items-end justify-end"
    >
      {#if page.url.pathname != "/"}
        <div class="grow">
          <Button
            class="pl-0!"
            variant="ghost"
            onclick={() => window.history.back()}
          >
            <ChevronLeft class="size-6" />
          </Button>
        </div>
      {/if}

      <AppMenu />
    </header>

    <main class="flex-1 p-4 pt-20 flex flex-col overflow-auto page-transition">
      {@render children()}
    </main>
  </div>
</div>


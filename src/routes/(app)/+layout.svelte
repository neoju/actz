<script lang="ts">
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import { ChevronLeft } from "@lucide/svelte";
  import { ModeWatcher } from "mode-watcher";
  import { Toaster } from "$lib/components/ui/sonner";
  import AppMenu from "$lib/components/app-menu.svelte";
  import "$lib/assets/css/app-layout.css";

  let { children } = $props();

  function handleBack() {
    window.history.back();
  }

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
<div class="app-wrapper">
  <div class="mobile-container">
    <!-- Mobile Header with Hamburger Menu -->
    <header class="mobile-header">
      {#if page.url.pathname != "/"}
        <div class="header-spacer">
          <Button class="back-btn" variant="ghost" onclick={handleBack}>
            <ChevronLeft class="back-icon" />
          </Button>
        </div>
      {/if}

      <AppMenu />
    </header>

    <main class="main-content page-transition">
      {@render children()}
    </main>
  </div>
</div>

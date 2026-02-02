<script lang="ts">
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { onNavigate } from "$app/navigation";
  import { goto } from "$app/navigation";
  import { signOut } from "@auth/sveltekit/client";
  import { resetTour, startCompleteTour } from "$lib/tour";
  import { Button } from "$lib/components/ui/button";
  import * as Sheet from "$lib/components/ui/sheet";
  import {
    Menu,
    House,
    Settings,
    LogOut,
    BookSearch,
    Map,
    CircleQuestionMark,
    Linkedin,
    ChevronLeft,
  } from "@lucide/svelte";
  import { ModeWatcher } from "mode-watcher";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { Toaster } from "$lib/components/ui/sonner";
  import ModeSwitcher from "$lib/components/mode-switcher.svelte";
  import "$lib/styles/view-transitions.css";

  let { children } = $props();
  let isMenuOpen = $state(false);

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

  onMount(() => {
    if (browser) {
      const session = page.data.session;
      if (session?.user) {
        if (session.user.id) localStorage.setItem("user_id", session.user.id);
        document.cookie =
          "auth_state=true; path=/; max-age=31536000; SameSite=Lax";
      }
    }
  });

  function handleNavigation(path: string) {
    isMenuOpen = false;
    goto(path);
  }

  function handleRestartTour() {
    isMenuOpen = false;
    resetTour();
    goto("/").then(() => {
      setTimeout(() => {
        startCompleteTour();
      }, 500);
    });
  }

  async function handleLogout() {
    isMenuOpen = false;
    await signOut({ callbackUrl: "/login" });
  }
</script>

<ModeWatcher />
<Toaster richColors position="top-center" />
<QueryClientProvider client={queryClient}>
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

        <Sheet.Root bind:open={isMenuOpen}>
          <ModeSwitcher />
          <Sheet.Trigger>
            <Button
              variant="outline"
              size="icon"
              class="ml-2 bg-primary!"
              data-tour="menu-button"
            >
              <Menu class="h-5 w-5" />
            </Button>
          </Sheet.Trigger>
          <Sheet.Content
            side="right"
            class="w-75 sm:w-100 flex flex-col h-full"
            data-tour="menu-sheet"
          >
            <Sheet.Header>
              <Sheet.Title>Action Z</Sheet.Title>
              <Sheet.Description>
                Your AI-Powered Fitness Companion
              </Sheet.Description>
            </Sheet.Header>
            <div class="flex flex-col gap-4 mt-6 flex-1">
              <Button
                variant="ghost"
                class="justify-start gap-3"
                onclick={() => handleNavigation("/")}
              >
                <House class="h-5 w-5" />
                <span>Home</span>
              </Button>
              <Button
                variant="ghost"
                class="justify-start gap-3"
                onclick={() => handleNavigation("/exercises")}
                data-tour="library-link"
              >
                <BookSearch class="h-5 w-5" />
                <span>Library</span>
              </Button>
              <Button
                variant="ghost"
                class="justify-start gap-3"
                onclick={() => handleNavigation("/settings")}
                data-tour="settings-link"
              >
                <Settings class="h-5 w-5" />
                <span>Settings</span>
              </Button>
              <div class="border-t border-border my-2"></div>
              <Button
                variant="ghost"
                class="justify-start gap-3"
                onclick={() => handleNavigation("/faq")}
                data-tour="settings-link"
              >
                <CircleQuestionMark class="h-5 w-5" />
                <span>FAQ</span>
              </Button>

              <Button
                variant="ghost"
                class="justify-start gap-3"
                onclick={handleRestartTour}
              >
                <Map class="h-5 w-5" />
                <span>Restart Guided Tour</span>
              </Button>
              <Button
                variant="ghost"
                class="justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                onclick={handleLogout}
              >
                <LogOut class="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>

            <Sheet.Footer class="mt-auto pt-6 border-t border-border">
              <div class="flex flex-col items-end gap-1 w-full">
                <p class="text-xs text-muted-foreground">
                  Looking for a dev? 👨‍💻
                </p>
                <a
                  href="https://www.linkedin.com/in/neoju/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm font-medium text-primary underline transition-all flex items-center gap-2"
                >
                  Let's connect
                  <Linkedin class="h-4 w-4" />
                </a>
              </div>
            </Sheet.Footer>
          </Sheet.Content>
        </Sheet.Root>
      </header>

      <main
        class="flex-1 p-4 pt-20 flex flex-col overflow-auto page-transition"
      >
        {@render children()}
      </main>
    </div>
  </div>
</QueryClientProvider>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { signOut } from "@auth/sveltekit/client";
  import { resetTour, startCompleteTour } from "$lib/tour";
  import { Button } from "$lib/components/ui/button";
  import * as Sheet from "$lib/components/ui/sheet";
  import {
    Menu as MenuIcon,
    House,
    Settings,
    LogOut,
    BookSearch,
    Map,
    CircleQuestionMark,
    Linkedin,
  } from "@lucide/svelte";
  import ModeSwitcher from "$lib/components/mode-switcher.svelte";
  import type { Component } from "svelte";

  let isMenuOpen = $state(false);

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

{#snippet MenuItem(
  Icon: Component,
  label: string,
  onclick?: () => void,
  dataTour?: string,
  variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link" = "ghost",
  className?: string,
)}
  <Button
    {variant}
    class="justify-start gap-3 {className}"
    {onclick}
    data-tour={dataTour}
  >
    <Icon class="h-5 w-5" />
    <span>{label}</span>
  </Button>
{/snippet}

<Sheet.Root bind:open={isMenuOpen}>
  <ModeSwitcher />
  <Sheet.Trigger>
    <Button
      variant="outline"
      size="icon"
      class="ml-2 bg-primary!"
      data-tour="menu-button"
    >
      <MenuIcon class="h-5 w-5" />
    </Button>
  </Sheet.Trigger>
  <Sheet.Content
    side="right"
    class="w-75 sm:w-100 flex flex-col h-full"
    data-tour="menu-sheet"
  >
    <Sheet.Header>
      <Sheet.Title>Action Z</Sheet.Title>
      <Sheet.Description>Your AI-Powered Fitness Companion</Sheet.Description>
    </Sheet.Header>
    <div class="flex flex-col gap-4 mt-6 flex-1">
      {@render MenuItem(House, "Home", () => handleNavigation("/"))}
      {@render MenuItem(
        BookSearch,
        "Library",
        () => handleNavigation("/exercises"),
        "library-link",
      )}
      {@render MenuItem(
        Settings,
        "Settings",
        () => handleNavigation("/settings"),
        "settings-link",
      )}

      <div class="border-t border-border my-2"></div>

      {@render MenuItem(
        CircleQuestionMark,
        "FAQ",
        () => handleNavigation("/faq"),
        "settings-link",
      )}
      {@render MenuItem(Map, "Restart Guided Tour", handleRestartTour)}
      {@render MenuItem(
        LogOut,
        "Logout",
        handleLogout,
        undefined,
        "ghost",
        "text-destructive hover:text-destructive hover:bg-destructive/10",
      )}
    </div>

    <Sheet.Footer class="mt-auto pt-6 border-t border-border">
      <div class="flex flex-col items-end gap-1 w-full">
        <p class="text-xs text-muted-foreground">Looking for a dev? 👨‍💻</p>
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


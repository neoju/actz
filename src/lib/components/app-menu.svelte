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
  import "$lib/assets/css/components/app-menu.css";

  let isMenuOpen = $state(false);

  function handleNavigation(path: string) {
    isMenuOpen = false;
    goto(path);
  }

  function handleRestartTour() {
    isMenuOpen = false;
    resetTour();
    goto("/planned-exercises").then(() => {
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
    class="menu-item-btn {className}"
    data-tour={dataTour}
    {onclick}
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
      class="menu-trigger-btn"
      data-tour="menu-button"
    >
      <MenuIcon class="h-5 w-5" />
    </Button>
  </Sheet.Trigger>
  <Sheet.Content
    side="right"
    class="menu-sheet-content"
    data-tour="menu-sheet"
  >
    <Sheet.Header>
      <Sheet.Title>Action Z</Sheet.Title>
      <Sheet.Description>Your AI-Powered Fitness Companion</Sheet.Description>
    </Sheet.Header>
    <div class="menu-items-container">
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

      <div class="menu-separator"></div>

      {@render MenuItem(CircleQuestionMark, "FAQ", () =>
        handleNavigation("/faq"),
      )}
      {@render MenuItem(Map, "Restart Guided Tour", handleRestartTour)}
      {@render MenuItem(
        LogOut,
        "Logout",
        handleLogout,
        undefined,
        "ghost",
        "logout-btn",
      )}
    </div>

    <Sheet.Footer class="menu-footer">
      <div class="footer-content">
        <p class="footer-text">Looking for a dev? 👨‍💻</p>
        <a
          href="https://www.linkedin.com/in/neoju/"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-link"
        >
          Let's connect
          <Linkedin class="h-4 w-4" />
        </a>
      </div>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>

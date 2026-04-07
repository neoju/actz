<script lang="ts">
  import { goto } from "$app/navigation";
  import { signOut } from "@auth/sveltekit/client";
  import { Button } from "$lib/components/ui/button";
  import * as Sheet from "$lib/components/ui/sheet";
  import {
    Menu as MenuIcon,
    House,
    Settings,
    LogOut,
    BookSearch,
    CircleQuestionMark,
    Linkedin,
    Dumbbell,
  } from "@lucide/svelte";
  import ModeSwitcher from "$lib/components/mode-switcher.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { Component } from "svelte";
  import "$lib/assets/css/components/app-menu.css";

  let isMenuOpen = $state(false);

  function handleNavigation(path: string) {
    isMenuOpen = false;
    goto(path);
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
    >
      <MenuIcon class="h-5 w-5" />
    </Button>
  </Sheet.Trigger>
  <Sheet.Content side="right" class="menu-sheet-content">
    <Sheet.Header>
      <Sheet.Title>{m.common_appName()}</Sheet.Title>
      <Sheet.Description>{m.common_appTagline()}</Sheet.Description>
    </Sheet.Header>
    <div class="menu-items-container">
      {@render MenuItem(House, m.nav_home(), () => handleNavigation("/"))}
      {@render MenuItem(Dumbbell, m.nav_planned_exercise(), () =>
        handleNavigation("/planned-exercises"),
      )}
      {@render MenuItem(BookSearch, m.nav_library(), () =>
        handleNavigation("/exercises"),
      )}
      {@render MenuItem(Settings, m.nav_settings(), () =>
        handleNavigation("/settings"),
      )}

      <div class="menu-separator"></div>

      {@render MenuItem(CircleQuestionMark, m.nav_faq(), () =>
        handleNavigation("/faq"),
      )}
      {@render MenuItem(
        LogOut,
        m.nav_logout(),
        handleLogout,
        "ghost",
        "logout-btn",
      )}
    </div>

    <Sheet.Footer class="menu-footer">
      <div class="footer-content">
        <p class="footer-text">{m.footer_lookingForDev()}</p>
        <a
          href="https://www.linkedin.com/in/neoju/"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-link"
        >
          {m.footer_letsConnect()}
          <Linkedin class="h-4 w-4" />
        </a>
      </div>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>

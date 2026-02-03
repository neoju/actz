<script lang="ts">
  import type { Component } from "svelte";
  import { ChevronRight } from "@lucide/svelte";

  interface Props {
    icon: Component;
    label: string;
    href?: string;
    onclick?: () => void;
  }

  let { icon: Icon, label, href, onclick }: Props = $props();
</script>

{#if href}
  <a {href} class="settings-menu-item">
    <div class="menu-item-content">
      <Icon class="menu-item-icon" />
      <span class="menu-item-label">{label}</span>
    </div>
    <ChevronRight class="menu-item-chevron" />
  </a>
{:else}
  <button class="settings-menu-item" {onclick} type="button">
    <div class="menu-item-content">
      <Icon class="menu-item-icon" />
      <span class="menu-item-label">{label}</span>
    </div>
    <ChevronRight class="menu-item-chevron" />
  </button>
{/if}

<style>
  .settings-menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid hsl(var(--border));
    background: hsl(var(--card));
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    color: inherit;
    width: 100%;
  }

  .settings-menu-item:hover {
    background: hsl(var(--accent));
    border-color: hsl(var(--accent-foreground) / 0.1);
  }

  .menu-item-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .menu-item-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: hsl(var(--muted-foreground));
  }

  .menu-item-label {
    font-size: 0.9375rem;
    font-weight: 500;
  }

  .menu-item-chevron {
    width: 1rem;
    height: 1rem;
    color: hsl(var(--muted-foreground));
  }
</style>

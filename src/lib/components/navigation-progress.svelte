<script lang="ts">
  import { navigating } from "$app/state";
  import { onMount } from "svelte";
  import "$lib/assets/css/components/navigation-progress.css";

  interface Props {
    height?: number;
    color?: string;
    speed?: number;
    showSpinner?: boolean;
  }

  let { height = 3, speed = 300, showSpinner = false }: Props = $props();

  let progress = $state(0);
  let isNavigating = $state(false);
  let progressInterval: ReturnType<typeof setInterval> | null = null;

  $effect(() => {
    if (navigating.to) {
      // Start navigation
      isNavigating = true;
      progress = 0;

      // Simulate progress with configurable speed
      progressInterval = setInterval(() => {
        if (progress < 90) {
          // Slow down as we approach 90% for smoother feel
          const increment = Math.random() * (90 - progress) * 0.15;
          progress = Math.min(90, progress + increment);
        }
      }, speed);
    } else if (isNavigating) {
      // Navigation complete
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      // Complete the progress bar
      progress = 100;

      // Reset after animation
      setTimeout(() => {
        isNavigating = false;
        progress = 0;
      }, 300);
    }
  });

  // Cleanup on unmount
  onMount(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  });
</script>

{#if isNavigating}
  <div
    class="navigation-progress-container"
    style="height: {height}px"
  >
    <div
      class="navigation-progress-bar"
      style="width: {progress}%; background: var(--primary); box-shadow: 0 0 10px var(--primary);"
    ></div>
    {#if showSpinner}
      <div class="navigation-spinner"></div>
    {/if}
  </div>
{/if}

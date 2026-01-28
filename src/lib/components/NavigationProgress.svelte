<script lang="ts">
    import { navigating } from "$app/state";
    import { onMount } from "svelte";

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
        class="navigation-progress-container fixed top-0 left-0 right-0 z-999999"
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

<style>
    .navigation-progress-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        background: transparent;
        pointer-events: none;
    }

    .navigation-progress-bar {
        height: 100%;
        transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: width;
    }

    .navigation-spinner {
        position: fixed;
        top: 15px;
        right: 15px;
        width: 18px;
        height: 18px;
        border: 2px solid transparent;
        border-top-color: hsl(var(--primary));
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        z-index: 9999;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>

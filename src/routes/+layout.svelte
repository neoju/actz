<script lang="ts">
    import "./layout.css";
    import NavigationProgress from "$lib/components/NavigationProgress.svelte";
    let { children } = $props();
</script>

<!--
    Navigation progress bar - NuxtJS-style loading indicator

    Customization options:
    - height: Bar height in pixels (default: 3)
    - speed: Animation speed in ms (default: 300, lower = faster)
    - color: Any valid CSS color (default: uses primary theme color)
    - showSpinner: Show spinner in top-right (default: false)

    Examples:
    <NavigationProgress />                                    // Basic usage
    <NavigationProgress height={4} speed={200} />            // Thicker & faster
    <NavigationProgress color="#3b82f6" showSpinner={true} /> // Custom color with spinner
-->
<NavigationProgress height={3} speed={300} />
{@render children()}

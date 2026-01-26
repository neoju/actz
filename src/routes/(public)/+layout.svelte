<script lang="ts">
    let { children } = $props();
</script>

<div class="min-h-screen bg-muted/20 text-foreground font-sans antialiased flex justify-center">
    <div class="w-full max-w-md min-h-screen bg-background shadow-2xl overflow-hidden relative flex flex-col border-x border-border">
        <main class="flex-1 p-6 flex flex-col">
            {@render children()}
        </main>
    </div>
</div>

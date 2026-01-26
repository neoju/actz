<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { ArrowLeft } from "@lucide/svelte";
</script>

<div class="space-y-6">
    <div class="flex items-center space-x-2">
        <Button variant="ghost" size="icon" href="/dashboard">
            <ArrowLeft class="h-4 w-4" />
        </Button>
        <h1 class="text-2xl font-bold">Settings</h1>
    </div>

    <div class="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
        <p class="text-muted-foreground">Settings content will go here.</p>
    </div>
</div>

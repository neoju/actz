<script lang="ts">
    import { cn } from "$lib/utils";
    import { Check, SkipForward, Play, Circle, Lock } from "@lucide/svelte";
    import { useExercise } from "./ctx.svelte";

    const ctx = useExercise();
</script>

<div class="flex items-center gap-3 w-full text-left">
    {#if ctx.status === "COMPLETED"}
        <Check class="text-green-500 w-5 h-5" />
    {:else if ctx.status === "SKIPPED"}
        <SkipForward class="text-yellow-500 w-5 h-5" />
    {:else if ctx.status === "IN_PROGRESS"}
        <Play class="text-blue-500 w-5 h-5" />
    {:else}
        <Circle class="text-muted-foreground w-5 h-5" />
    {/if}

    <div class="flex-1">
        <span
            class={cn(
                ctx.status === "COMPLETED" &&
                    "line-through text-muted-foreground",
            )}
        >
            {ctx.exercise.name}
        </span>
    </div>

    {#if ctx.isLocked}
        <div class="flex items-center text-muted-foreground mr-2">
            <Lock class="w-4 h-4 mr-1" />
            <span class="text-xs">Locked</span>
        </div>
    {/if}
</div>

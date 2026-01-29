<script lang="ts">
    import { cn } from "$lib/utils";
    import { Badge } from "$lib/components/ui/badge";
    import CheckIcon from "@lucide/svelte/icons/check";
    import SkipForwardIcon from "@lucide/svelte/icons/skip-forward";
    import PlayIcon from "@lucide/svelte/icons/play";
    import CircleIcon from "@lucide/svelte/icons/circle";
    import LockIcon from "@lucide/svelte/icons/lock";
    import { useExercise } from "./ctx.svelte";

    const ctx = useExercise();

    function getCategoryEmoji(category: string) {
        const emojiMap: Record<string, string> = {
            Chest: "💪",
            Legs: "🦵",
            Core: "🎯",
            Back: "🔙",
            Shoulders: "🏋️",
            Arms: "💪",
            Cardio: "❤️",
            Flexibility: "🧘",
            "Full Body": "🔥",
        };
        return emojiMap[category] || "🏃";
    }

    function getLevelColor(level: string) {
        switch (level?.toLowerCase()) {
            case "beginner":
                return "bg-green-500/10 text-green-700 border-green-500/20";
            case "intermediate":
                return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
            case "advanced":
                return "bg-red-500/10 text-red-700 border-red-500/20";
            default:
                return "bg-gray-500/10 text-gray-700 border-gray-500/20";
        }
    }
</script>

<div class="flex items-start gap-3 w-full text-left">
    <!-- Status Icon -->
    <div class="shrink-0 mt-1">
        {#if ctx.status === "COMPLETED"}
            <CheckIcon class="text-green-500 w-5 h-5" />
        {:else if ctx.status === "SKIPPED"}
            <SkipForwardIcon class="text-yellow-500 w-5 h-5" />
        {:else if ctx.status === "IN_PROGRESS"}
            <PlayIcon class="text-blue-500 w-5 h-5" />
        {:else}
            <CircleIcon class="text-muted-foreground w-5 h-5" />
        {/if}
    </div>

    <!-- Exercise Info -->
    <div class="flex-1 space-y-1">
        <div class="flex items-center gap-2">
            {#if ctx.detail?.category}
                <span class="text-lg">
                    {getCategoryEmoji(ctx.detail.category)}
                </span>
            {/if}
            <span
                class={cn(
                    "font-medium",
                    ctx.status === "COMPLETED" &&
                        "line-through text-muted-foreground",
                )}
            >
                {ctx.exercise.name}
            </span>
        </div>

        {#if ctx.detail?.description}
            <p class="text-xs text-muted-foreground line-clamp-2">
                {ctx.detail.description}
            </p>
        {/if}

        <!-- Sets and Reps -->
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{ctx.exercise.sets} sets</span>
            <span>•</span>
            <span>{ctx.exercise.reps} reps</span>
        </div>
    </div>

    <!-- Level Badge and Lock -->
    <div class="flex flex-col items-end gap-2 shrink-0">
        {#if ctx.detail?.level}
            <Badge
                variant="outline"
                class={cn("text-xs", getLevelColor(ctx.detail.level))}
            >
                {ctx.detail.level}
            </Badge>
        {/if}

        {#if ctx.isLocked}
            <div class="flex items-center text-muted-foreground">
                <LockIcon class="w-4 h-4 mr-1" />
                <span class="text-xs">Locked</span>
            </div>
        {/if}
    </div>
</div>

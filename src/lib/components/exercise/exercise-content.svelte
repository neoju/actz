<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import * as Collapsible from "$lib/components/ui/collapsible";
    import { slide } from "svelte/transition";
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import TargetIcon from "@lucide/svelte/icons/target";
    import DumbbellIcon from "@lucide/svelte/icons/dumbbell";
    import YoutubeIcon from "@lucide/svelte/icons/youtube";
    import { useExercise } from "./ctx.svelte";

    let { instructionsOpen = false } = $props();
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

<div class="space-y-4 pt-2">
    <!-- Key Principles -->
    {#if ctx.detail?.key_principles && ctx.initialized}
        <div class="space-y-2">
            <div class="flex items-center gap-2">
                <TargetIcon class="h-4 w-4 text-primary" />
                <h3 class="text-sm font-semibold">Key Principles</h3>
            </div>
            <p
                class="text-sm text-muted-foreground pl-6 bg-primary/5 p-3 rounded-md"
            >
                {ctx.detail.key_principles}
            </p>
        </div>
    {/if}

    <!-- Technical Checkpoints -->
    {#if ctx.detail?.key_technical_checkpoints && ctx.initialized}
        <div class="space-y-2">
            <div class="flex items-center gap-2">
                <DumbbellIcon class="h-4 w-4 text-primary" />
                <h3 class="text-sm font-semibold">Technical Checkpoints</h3>
            </div>
            <p
                class="text-sm text-muted-foreground pl-6 bg-orange-500/5 p-3 rounded-md"
            >
                {ctx.detail.key_technical_checkpoints}
            </p>
        </div>
    {/if}

    <!-- YouTube Video -->
    {#if ctx.detail?.tutor_video && ctx.initialized}
        <div class="space-y-2">
            <div class="flex items-center gap-2">
                <YoutubeIcon class="h-4 w-4 text-red-500" />
                <h3 class="text-sm font-semibold">Video Tutorial</h3>
            </div>
            <div
                class="aspect-video w-full rounded-md overflow-hidden border border-border"
            >
                <iframe
                    width="100%"
                    height="100%"
                    src={ctx.detail.tutor_video}
                    title="YouTube video player for {ctx.exercise.name}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
            </div>
        </div>
    {/if}

    <!-- Instructions (Collapsible) -->
    {#if ctx.detail?.instructions && ctx.initialized}
        <Collapsible.Root class="w-full" bind:open={instructionsOpen}>
            <Collapsible.Trigger
                class="flex items-center justify-between w-full py-2"
            >
                <span class="text-sm font-semibold">Instructions</span>
                <Button variant="ghost" size="sm" class="w-9 p-0">
                    <ChevronDownIcon
                        class="h-4 w-4 transition-transform {instructionsOpen
                            ? 'rotate-180'
                            : ''}"
                    />
                    <span class="sr-only">Toggle instructions</span>
                </Button>
            </Collapsible.Trigger>
            <Collapsible.Content>
                {#if instructionsOpen}
                    <div transition:slide={{ duration: 300 }}>
                        <ol
                            class="space-y-2 pl-6 text-sm text-muted-foreground"
                        >
                            {#each ctx.detail.instructions as instruction, index}
                                <li class="list-decimal">
                                    {instruction}
                                </li>
                            {/each}
                        </ol>
                    </div>
                {/if}
            </Collapsible.Content>
        </Collapsible.Root>
    {/if}
</div>

<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Accordion from "$lib/components/ui/accordion";
    import { ChevronLeft, Play, Timer, Info } from "@lucide/svelte";
    import { goto } from "$app/navigation";

    function goBack() {
        goto("/dashboard");
    }

    const exercises = [
        {
            id: "item-1",
            title: "Seated Row",
            type: "reps",
            description:
                "Sit with your chest against the pad. Pull the handles back towards your lower abdomen, squeezing your shoulder blades together.",
            sets: "3 sets x 12 reps",
        },
        {
            id: "item-2",
            title: "Lat Pulldowns",
            type: "reps",
            description:
                "Grip the bar wider than shoulder-width. Pull down to your upper chest while keeping your torso stationary.",
            sets: "3 sets x 10 reps",
        },
        {
            id: "item-3",
            title: "Chest Press",
            type: "reps",
            description:
                "Push the handles forward until your arms are fully extended but not locked. Return slowly.",
            sets: "4 sets x 8 reps",
        },
        {
            id: "item-4",
            title: "Plank",
            type: "time",
            description:
                "Maintain a straight line from head to heels. Engage your core and hold.",
            duration: "60s",
        },
    ];
</script>

<div class="flex flex-col h-full space-y-6">
    <!-- Header -->
    <div class="flex items-center space-x-4 py-2">
        <Button variant="ghost" size="icon" onclick={goBack} class="-ml-2">
            <ChevronLeft class="h-6 w-6" />
        </Button>
        <h1 class="text-2xl font-bold tracking-tight">Today's targets</h1>
    </div>

    <!-- Description -->
    <div class="bg-muted/50 p-4 rounded-xl border border-muted flex gap-3">
        <Info class="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p class="text-sm text-muted-foreground leading-relaxed">
            Focus on slow, controlled movements today. Keep rest periods under
            90 seconds to maintain intensity.
        </p>
    </div>

    <!-- Exercises List -->
    <Accordion.Root
        value={exercises[0]?.id}
        type="single"
        class="w-full space-y-4"
    >
        {#each exercises as exercise}
            <Accordion.Item
                value={exercise.id}
                class="border rounded-xl px-4 bg-card shadow-sm data-[state=open]:border-primary data-[state=open]:ring-1 data-[state=open]:ring-primary/20 transition-all"
            >
                <Accordion.Trigger
                    class="hover:no-underline py-4 text-base font-semibold"
                >
                    {exercise.title}
                </Accordion.Trigger>
                <Accordion.Content class="pb-4 pt-2 space-y-4">
                    <!-- Video Placeholder -->
                    <div
                        class="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer"
                    >
                        <div
                            class="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors"
                        ></div>
                        <Play
                            class="h-12 w-12 text-foreground/50 group-hover:scale-110 transition-transform"
                        />
                        <span class="sr-only">Play Video</span>
                    </div>

                    <!-- Details -->
                    <div class="space-y-2">
                        <p
                            class="text-sm text-muted-foreground leading-relaxed"
                        >
                            {exercise.description}
                        </p>

                        {#if exercise.type === "time"}
                            <div
                                class="flex items-center gap-2 text-primary font-bold bg-primary/10 p-3 rounded-lg justify-center mt-2"
                            >
                                <Timer class="h-5 w-5" />
                                <span>{exercise.duration}</span>
                            </div>
                        {:else}
                            <div
                                class="text-sm font-medium bg-muted p-2 rounded text-center"
                            >
                                {exercise.sets}
                            </div>
                        {/if}
                    </div>
                </Accordion.Content>
            </Accordion.Item>
        {/each}
        <div class="h-1 spacer"></div>
    </Accordion.Root>
</div>

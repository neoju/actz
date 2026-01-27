<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { cn } from "$lib/utils";
    import { Check, Lock } from "@lucide/svelte";

    let { data } = $props();
    let plan = $derived(data.plan);

    // Calculate current day index (0-based)
    let currentDayIndex = $derived.by(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(plan.startDate);
        start.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - start.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    });

    // Sort days
    let days = $derived(plan.days.sort((a: any, b: any) => a.order - b.order));

    // Collapsible state
    let planDescOpen = $state(false);
    let ptSummaryOpen = $state(false);
</script>

<div class="space-y-6 pb-8">
    <!-- Header -->
    <div class="space-y-2 pt-4">
        <h1 class="text-3xl font-bold tracking-tight mb-10">
            Your Weekly Plan
        </h1>

        <p class="text-sm font-bold">Description:</p>
        <p
            class={cn(
                "px-4 text-muted-foreground transition-all line-clamp-2 text-sm",
                planDescOpen && "line-clamp-none",
            )}
        >
            {plan.planDescription || "Stay consistent!"}
        </p>
        {#if !planDescOpen}
            <Button
                variant="ghost"
                class="text-primary ml-1"
                onclick={() => (planDescOpen = true)}>... Read more</Button
            >
        {/if}

        <p class="text-sm font-bold my-2">Personal Trainer's Note:</p>
        <p
            class={cn(
                "px-4 bg-muted/50 rounded-lg text-sm italic transition-all",
                !ptSummaryOpen && "line-clamp-2",
            )}
        >
            " {plan.ptSummary} "
        </p>
        {#if !ptSummaryOpen}
            <Button
                variant="ghost"
                class="text-primary ml-1"
                onclick={() => (ptSummaryOpen = true)}>... Read more</Button
            >
        {/if}
    </div>

    <!-- Days List -->
    <div class="grid gap-4">
        {#each days as day, index}
            {@const isToday = index === currentDayIndex}
            {@const isFuture = index > currentDayIndex}
            {@const isCompleted =
                day.exercises.length > 0 &&
                day.exercises.every(
                    (e: any) =>
                        e.activities[0]?.status === "COMPLETED" ||
                        e.activities[0]?.status === "SKIPPED",
                )}
            <a
                href={isFuture ? undefined : `/dashboard/day/${day.id}`}
                class={cn("block", isFuture && "pointer-events-none")}
            >
                <Card.Root
                    class={cn(
                        "transition-all hover:shadow-md",
                        isToday && "border-primary bg-primary/5",
                        isFuture && "opacity-60 bg-muted",
                        isCompleted && "bg-green-500/10 border-green-500/20",
                    )}
                >
                    <Card.Header
                        class="flex flex-row items-center justify-between pb-2"
                    >
                        <div class="space-y-1">
                            <Card.Title class="text-base">
                                Day {day.order}: {day.title}
                            </Card.Title>
                            <Card.Description>
                                {day.dayName}
                            </Card.Description>
                        </div>
                        {#if isCompleted}
                            <div
                                class="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-600"
                            >
                                <Check class="h-5 w-5" />
                            </div>
                        {:else if isFuture}
                            <Lock class="h-5 w-5 text-muted-foreground" />
                        {:else if isToday}
                            <span
                                class="text-xs font-bold px-2 py-1 bg-primary text-primary-foreground rounded-full"
                            >
                                TODAY
                            </span>
                        {/if}
                    </Card.Header>
                    <Card.Content>
                        <p class="text-sm text-muted-foreground line-clamp-2">
                            {day.exercises.length} exercises • {day.estimatedTime ||
                                "N/A"}
                        </p>
                    </Card.Content>
                </Card.Root>
            </a>
        {/each}
    </div>
</div>

<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    import { cn } from "$lib/utils";
    import {
        Check,
        Lock,
        Loader,
        Clock,
        Sparkles,
        ArrowRight,
    } from "@lucide/svelte";
    import { navigating } from "$app/state";
    import { onMount } from "svelte";
    import { hasCompletedTour, startCompleteTour } from "$lib/tour";

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

    // Check if plan is completed (currentDayIndex beyond all days)
    let isPlanCompleted = $derived(currentDayIndex >= days.length);

    // Collapsible state
    let planDescOpen = $state(false);
    let ptSummaryOpen = $state(false);

    // Auto-scroll to today's card or new adventure section on mount
    onMount(() => {
        setTimeout(() => {
            if (isPlanCompleted) {
                // Scroll to new adventure section
                const newAdventureEl = document.querySelector(
                    '[data-new-adventure="true"]',
                );
                if (newAdventureEl) {
                    newAdventureEl.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            } else {
                // Scroll to today's card
                const todayCard = document.querySelector('[data-today="true"]');
                if (todayCard) {
                    // Check if card is in viewport
                    const rect = todayCard.getBoundingClientRect();
                    const isInViewport =
                        rect.top >= 0 &&
                        rect.left >= 0 &&
                        rect.bottom <=
                            (window.innerHeight ||
                                document.documentElement.clientHeight) &&
                        rect.right <=
                            (window.innerWidth ||
                                document.documentElement.clientWidth);

                    // Only scroll if not in viewport
                    if (!isInViewport) {
                        todayCard.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }

                    // Add pulse animation briefly
                    todayCard.classList.add("today-pulse");
                    setTimeout(() => {
                        todayCard.classList.remove("today-pulse");
                    }, 2000);
                }
            }
        }, 100);

        // Start tour for first-time users
        const tourCompleted = hasCompletedTour();
        console.log("[Tour] Has completed tour:", tourCompleted);

        if (!tourCompleted) {
            console.log("[Tour] Starting tour in 1 second...");
            setTimeout(() => {
                console.log("[Tour] Launching complete tour");
                startCompleteTour();
            }, 1000);
        }
    });
</script>

<div class="space-y-6 pb-8">
    <!-- Header -->
    <div class="space-y-2 pt-4">
        <h1 class="text-3xl font-bold tracking-tight mb-10">
            Your Weekly Plan
        </h1>

        <p class="text-sm font-bold">Description:</p>
        <div data-tour="plan-description">
            <p
                class={cn(
                    "px-4 text-muted-foreground transition-all line-clamp-2 text-sm",
                    planDescOpen && "line-clamp-none",
                )}
            >
                {plan.planDescription || "Stay consistent!"}
            </p>
        </div>
        {#if !planDescOpen}
            <Button
                variant="ghost"
                class="text-primary ml-1"
                onclick={() => (planDescOpen = true)}>... Read more</Button
            >
        {/if}

        <p class="text-sm font-bold my-2">Personal Trainer's Note:</p>
        <div data-tour="pt-summary">
            <p
                class={cn(
                    "px-4 bg-muted/50 rounded-lg text-sm italic transition-all",
                    !ptSummaryOpen && "line-clamp-2",
                )}
            >
                " {plan.ptSummary} "
            </p>
        </div>
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
            {@const isPast = index < currentDayIndex}
            {@const isRestDay =
                day.exercises.length === 0 ||
                day.title.toLowerCase().includes("rest") ||
                day.dayName.toLowerCase().includes("rest")}
            {@const isCompleted =
                day.exercises.length > 0 &&
                day.exercises.every(
                    (e: any) =>
                        e.activities[0]?.status === "COMPLETED" ||
                        e.activities[0]?.status === "SKIPPED",
                )}
            {@const isTouched = day.exercises.some(
                (e: any) =>
                    e.activities[0]?.status === "IN_PROGRESS" ||
                    e.activities[0]?.status === "COMPLETED" ||
                    e.activities[0]?.status === "SKIPPED",
            )}
            {@const isPastUntouched = isPast && !isTouched}
            {@const isPastTouched = isPast && isTouched && !isCompleted}
            {@const isDisabled = isFuture || isPastUntouched || isRestDay}
            {@const dayLink = `/dashboard/day/${day.id}`}
            {@const isLoading = navigating.to?.url.pathname === dayLink}

            <a
                href={isDisabled ? undefined : dayLink}
                class={cn("block", isDisabled && "pointer-events-none")}
                data-today={isToday}
                data-tour={isToday && !isRestDay ? "today-card" : undefined}
            >
                <Card.Root
                    class={cn(
                        "transition-all",
                        !isDisabled && "hover:shadow-md hover:scale-[1.01]",
                        isToday && !isRestDay && "border-primary bg-primary/5",
                        isFuture && "opacity-60 bg-muted",
                        isCompleted && "bg-green-500/10 border-green-500/20",
                        isPastUntouched &&
                            "opacity-50 bg-red-500/5 border-red-500/20 cursor-not-allowed",
                        isPastTouched &&
                            "bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/15",
                        isRestDay &&
                            "bg-green-500/5 border-green-500/20 opacity-70 cursor-not-allowed",
                        isLoading && "opacity-80",
                    )}
                >
                    <Card.Header
                        class="flex flex-row items-center justify-between pb-2"
                    >
                        <div class="space-y-1">
                            <Card.Title
                                class={cn(
                                    "text-base",
                                    isPastUntouched &&
                                        !isRestDay &&
                                        "line-through opacity-70",
                                )}
                            >
                                Day {day.order}: {day.title}
                            </Card.Title>
                            <Card.Description
                                class={cn(
                                    isPastUntouched &&
                                        !isRestDay &&
                                        "line-through opacity-60",
                                )}
                            >
                                {day.dayName}
                            </Card.Description>
                        </div>
                        {#if isLoading}
                            <div
                                class="h-8 w-8 flex items-center justify-center"
                            >
                                <Loader
                                    class="h-8 w-8 animate-spin text-primary"
                                />
                            </div>
                        {:else if isCompleted}
                            <div
                                class="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-600"
                            >
                                <Check class="h-5 w-5" />
                            </div>
                        {:else if isRestDay}
                            <span
                                class="text-xs font-semibold px-2 py-1 bg-blue-500/20 text-blue-700 rounded-full"
                            >
                                REST
                            </span>
                        {:else if isPastUntouched}
                            <div
                                class="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center"
                            >
                                <Lock class="h-5 w-5 text-red-600" />
                            </div>
                        {:else if isPastTouched}
                            <div
                                class="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center"
                            >
                                <Clock class="h-5 w-5 text-yellow-600" />
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
                        {#if isRestDay}
                            <p class="text-sm font-medium italic">
                                Recovery Day - No exercises scheduled
                            </p>
                        {:else}
                            <p
                                class={cn(
                                    "text-sm text-muted-foreground line-clamp-2",
                                    isPastUntouched &&
                                        !isRestDay &&
                                        "line-through opacity-60",
                                )}
                            >
                                {day.exercises.length} exercises • {day.estimatedTime ||
                                    "N/A"}
                            </p>
                        {/if}
                    </Card.Content>
                </Card.Root>
            </a>
        {/each}
    </div>

    <!-- New Adventure Section (when plan is completed) -->
    {#if isPlanCompleted}
        <div
            class="mt-8 p-8 rounded-lg border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10"
            data-new-adventure="true"
        >
            <div class="text-center space-y-6">
                <!-- Celebration Icon -->
                <div class="flex justify-center">
                    <div
                        class="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse"
                    >
                        <Sparkles class="h-10 w-10 text-primary" />
                    </div>
                </div>

                <!-- Congratulations Message -->
                <div class="space-y-2">
                    <h2 class="text-3xl font-bold tracking-tight">
                        Congratulations!
                    </h2>
                    <p class="text-5xl my-6">🎉</p>
                    <p class="text-md text-muted-foreground">
                        You've completed your workout plan!
                    </p>
                </div>

                <!-- Stats Summary -->
                <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <div
                        class="p-4 rounded-lg bg-background/50 border border-border"
                    >
                        <p class="text-sm text-muted-foreground">Total Days</p>
                        <p class="text-2xl font-bold text-primary">
                            {days.length}
                        </p>
                    </div>
                    <div
                        class="p-4 rounded-lg bg-background/50 border border-border"
                    >
                        <p class="text-sm text-muted-foreground">Completed</p>
                        <p class="text-2xl font-bold text-green-600">
                            {days.filter((d) =>
                                d.exercises.every(
                                    (e: any) =>
                                        e.activities[0]?.status ===
                                            "COMPLETED" ||
                                        e.activities[0]?.status === "SKIPPED",
                                ),
                            ).length}
                        </p>
                    </div>
                </div>

                <!-- Call to Action -->
                <div class="pt-4">
                    <p class="text-muted-foreground mb-4">
                        Ready to continue your fitness journey?
                    </p>
                    <Button
                        href="/settings"
                        size="lg"
                        class="w-full max-w-xs mx-auto font-bold text-lg h-14 shadow-lg group"
                    >
                        Start New Adventure
                        <ArrowRight
                            class="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
                        />
                    </Button>
                    <p class="text-xs text-muted-foreground mt-4">
                        Generate a new workout plan in settings
                    </p>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(.today-pulse) {
        animation: pulse 2s ease-in-out;
    }

    @keyframes pulse {
        0%,
        100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.02);
        }
    }
</style>

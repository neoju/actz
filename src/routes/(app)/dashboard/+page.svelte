<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion";
    import { Button } from "$lib/components/ui/button";
    import * as Card from "$lib/components/ui/card";
    // Removed Badge import
    import exercisesDB from "../../api/exercises.json";
    import { invalidateAll } from "$app/navigation";
    import { cn } from "$lib/utils";

    let { data } = $props();
    let plan = $derived(data.plan);

    // Calculate current day index (0-based)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // plan is derived, so we should react to it, but startDate won't change often.
    // However, if we navigate, data changes.
    let startDate = $derived(new Date(plan.startDate));

    let diffTime = $derived(today.getTime() - startDate.getTime());
    let currentDayIndex = $derived(
        Math.floor(diffTime / (1000 * 60 * 60 * 24)),
    );

    // Determine selected day
    let selectedDayIndex = $state(0);

    // Initialize selected day to today
    $effect(() => {
        if (currentDayIndex >= 0 && currentDayIndex <= 6) {
            selectedDayIndex = currentDayIndex;
        } else if (currentDayIndex > 6) {
            selectedDayIndex = 6;
        } else {
            selectedDayIndex = 0;
        }
    });

    // Helper to find exercise details
    function getExerciseDetail(name: string) {
        return (
            exercisesDB.find(
                (e) => e.name.toLowerCase() === name.toLowerCase(),
            ) ||
            exercisesDB.find((e) =>
                e.name.toLowerCase().includes(name.toLowerCase()),
            )
        );
    }

    async function updateActivity(
        plannedExerciseId: string,
        status: string,
        activityId?: string,
    ) {
        await fetch("/api/activity", {
            method: "POST",
            body: JSON.stringify({ plannedExerciseId, status, activityId }),
        });
        await invalidateAll();
    }

    // Sort days
    let days = $derived(plan.days.sort((a: any, b: any) => a.order - b.order));

    // Get selected day data
    let selectedDay = $derived(days[selectedDayIndex]);

    // Check if previous exercise is completed
    function isExerciseLocked(index: number, exercises: any[]) {
        if (index === 0) return false;
        const prev = exercises[index - 1];
        const prevActivity = prev.activities[0];
        return (
            !prevActivity ||
            (prevActivity.status !== "COMPLETED" &&
                prevActivity.status !== "SKIPPED")
        );
    }

    // Cooldown Logic
    let cooldownActive = $state(false);
    let cooldownTime = $state(120);

    function startCooldown() {
        cooldownActive = true;
        cooldownTime = 120;
        const interval = setInterval(() => {
            cooldownTime--;
            if (cooldownTime <= 0) {
                clearInterval(interval);
                cooldownActive = false;
            }
        }, 1000);
    }
</script>

<div class="space-y-6 pb-8">
    <!-- Header -->
    <div class="space-y-2 pt-4">
        <h1 class="text-3xl font-bold tracking-tight">Your Weekly Plan</h1>
        <p class="text-muted-foreground">
            {plan.planDescription || "Stay consistent!"}
        </p>
        <div class="p-4 bg-muted/50 rounded-lg text-sm italic">
            " {plan.ptSummary} "
        </div>
    </div>

    <!-- Timeline Scroll Area -->
    <div class="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {#each days as day, index}
            {@const isToday = index === currentDayIndex}
            {@const isFuture = index > currentDayIndex}
            {@const isPast = index < currentDayIndex}
            {@const isSelected = index === selectedDayIndex}
            {@const isCompleted = day.exercises.every(
                (e: any) =>
                    e.activities[0]?.status === "COMPLETED" ||
                    e.activities[0]?.status === "SKIPPED",
            )}
            {@const isRestDay = day.title.toLowerCase().includes("rest")}

            <button
                class={cn(
                    "flex flex-col items-center justify-center min-w-[100px] h-[80px] rounded-lg border transition-all",
                    isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card",
                    isFuture && "opacity-50 cursor-not-allowed",
                    !isFuture && "hover:bg-accent cursor-pointer",
                )}
                onclick={() => {
                    if (!isFuture) selectedDayIndex = index;
                }}
                disabled={isFuture}
            >
                <span class="text-xs font-semibold text-muted-foreground"
                    >Day {day.order}</span
                >
                <span
                    class={cn(
                        "font-bold text-sm text-center px-2 truncate w-full",
                        isPast &&
                            !isCompleted &&
                            !isRestDay &&
                            "line-through text-muted-foreground",
                    )}
                >
                    {day.dayName}
                </span>
                {#if isToday}
                    <span
                        class="mt-1 text-[10px] h-5 px-1 bg-primary text-primary-foreground rounded-full flex items-center"
                        >Today</span
                    >
                {/if}
            </button>
        {/each}
    </div>

    <!-- Selected Day Detail -->
    {#if selectedDay}
        <Card.Root>
            <Card.Header>
                <Card.Title>{selectedDay.title}</Card.Title>
                <p class="text-sm text-muted-foreground">
                    Estimated Time: {selectedDay.estimatedTime || "N/A"}
                </p>
            </Card.Header>
            <Card.Content>
                <Accordion.Root type="single" class="w-full">
                    {#each selectedDay.exercises as exercise, index}
                        {@const detail = getExerciseDetail(exercise.name)}
                        {@const activity = exercise.activities[0]}
                        {@const status = activity?.status || "PENDING"}
                        {@const locked = isExerciseLocked(
                            index,
                            selectedDay.exercises,
                        )}

                        <Accordion.Item value={exercise.id} disabled={locked}>
                            <Accordion.Trigger class="hover:no-underline">
                                <div
                                    class="flex items-center gap-3 w-full text-left"
                                >
                                    {#if status === "COMPLETED"}
                                        <!-- Icon placeholder since import issue might exist, using text if icons fail or simple svg -->
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            class="text-green-500 w-5 h-5"
                                            ><path
                                                d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                                            /><polyline
                                                points="22 4 12 14.01 9 11.01"
                                            /></svg
                                        >
                                    {:else if status === "SKIPPED"}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            class="text-yellow-500 w-5 h-5"
                                            ><polygon
                                                points="5 4 15 12 5 20 5 4"
                                            /><line
                                                x1="19"
                                                x2="19"
                                                y1="5"
                                                y2="19"
                                            /></svg
                                        >
                                    {:else if status === "IN_PROGRESS"}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            class="text-blue-500 w-5 h-5"
                                            ><polygon
                                                points="5 3 19 12 5 21 5 3"
                                            /></svg
                                        >
                                    {:else}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            class="text-muted-foreground w-5 h-5"
                                            ><circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                            /></svg
                                        >
                                    {/if}

                                    <div class="flex-1">
                                        <span
                                            class={cn(
                                                status === "COMPLETED" &&
                                                    "line-through text-muted-foreground",
                                            )}
                                        >
                                            {exercise.name}
                                        </span>
                                    </div>

                                    {#if locked}
                                        <span
                                            class="text-xs text-muted-foreground mr-2"
                                            >Locked</span
                                        >
                                    {/if}
                                </div>
                            </Accordion.Trigger>
                            <Accordion.Content>
                                <div class="space-y-4 pt-2">
                                    {#if detail?.youtube_tutor_video}
                                        <div
                                            class="aspect-video w-full rounded-md overflow-hidden bg-black"
                                        >
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={detail.youtube_tutor_video.replace(
                                                    "watch?v=",
                                                    "embed/",
                                                )}
                                                title={exercise.name}
                                                frameborder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowfullscreen
                                            ></iframe>
                                        </div>
                                    {/if}

                                    <div class="text-sm text-muted-foreground">
                                        {detail?.description ||
                                            "No description available."}
                                    </div>

                                    <div
                                        class="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg"
                                    >
                                        <div>
                                            <span class="font-bold block"
                                                >Sets</span
                                            >
                                            {exercise.sets}
                                        </div>
                                        <div>
                                            <span class="font-bold block"
                                                >Reps</span
                                            >
                                            {exercise.reps}
                                        </div>
                                        {#if exercise.notes}
                                            <div class="col-span-2">
                                                <span class="font-bold block"
                                                    >Notes</span
                                                >
                                                {exercise.notes}
                                            </div>
                                        {/if}
                                    </div>

                                    <!-- Actions -->
                                    <div class="flex gap-2">
                                        {#if status === "PENDING"}
                                            <Button
                                                onclick={() =>
                                                    updateActivity(
                                                        exercise.id,
                                                        "IN_PROGRESS",
                                                    )}
                                                class="w-full"
                                            >
                                                Start Exercise
                                            </Button>
                                        {:else if status === "IN_PROGRESS"}
                                            <Button
                                                onclick={() => {
                                                    updateActivity(
                                                        exercise.id,
                                                        "COMPLETED",
                                                        activity?.id,
                                                    );
                                                    startCooldown();
                                                }}
                                                variant="default"
                                                class="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                                Finish
                                            </Button>
                                            <Button
                                                onclick={() =>
                                                    updateActivity(
                                                        exercise.id,
                                                        "SKIPPED",
                                                        activity?.id,
                                                    )}
                                                variant="outline"
                                            >
                                                Skip
                                            </Button>
                                        {:else}
                                            <Button
                                                onclick={() =>
                                                    updateActivity(
                                                        exercise.id,
                                                        "IN_PROGRESS",
                                                        activity?.id,
                                                    )}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Reset
                                            </Button>
                                            <span
                                                class="text-sm text-muted-foreground self-center ml-2"
                                            >
                                                {status === "COMPLETED"
                                                    ? "Done!"
                                                    : "Skipped"}
                                            </span>
                                        {/if}
                                    </div>

                                    {#if cooldownActive && status === "COMPLETED"}
                                        <div
                                            class="p-2 bg-blue-100 text-blue-800 rounded text-center text-sm font-bold animate-pulse"
                                        >
                                            Rest: {Math.floor(
                                                cooldownTime / 60,
                                            )}:{(cooldownTime % 60)
                                                .toString()
                                                .padStart(2, "0")}
                                        </div>
                                    {/if}
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    {/each}
                </Accordion.Root>
            </Card.Content>
        </Card.Root>
    {/if}
</div>

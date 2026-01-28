<script lang="ts">
    import { scale, fade } from "svelte/transition";
    import * as Accordion from "$lib/components/ui/accordion";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { ChevronLeft, Trophy, Clock, Timer } from "@lucide/svelte";
    import { useUpdateActivityMutation } from "$lib/queries/activity";
    import ExerciseItem from "$lib/components/exercise/ExerciseItem.svelte";

    let { data } = $props();
    let selectedDay = $derived(data.day);

    // svelte-ignore state_referenced_locally
    let openedExercise = $state<string | undefined>(data.day.exercises[0]?.id);

    // Use TanStack Query mutation for updating activity
    const updateActivityMutation = useUpdateActivityMutation();

    async function updateActivity(
        plannedExerciseId: string,
        status: string,
        activityId?: string,
    ) {
        await updateActivityMutation.mutateAsync({
            plannedExerciseId,
            status,
            activityId,
        });

        // Open next exercise
        if (status === "COMPLETED" || status === "SKIPPED") {
            openedExercise = selectedDay.exercises[maxReachedIndex + 1]?.id;
        }
    }

    let maxReachedIndex = $state(0);
    let completedCount = $state(0);
    let startTime = $state(Date.now());
    let finishTime = $state<number | null>(null);
    let showCongrats = $state(false);

    // Initial calculation & Progress tracking
    $effect(() => {
        let currentMax = 0;
        let done = 0;
        let allInitiallyDone = false;

        if (selectedDay) {
            for (let i = 0; i < selectedDay.exercises.length; i++) {
                const ex = selectedDay.exercises[i];
                const status = ex.activities[0]?.status;
                if (status === "COMPLETED" || status === "SKIPPED") {
                    currentMax = i + 1;
                    done++;
                } else {
                    break;
                }
            }
            // Check if already 100% done before any interaction
            if (done === selectedDay.exercises.length && completedCount === 0) {
                allInitiallyDone = true;
            }
        }

        // If progress improved, auto-advance accordion
        if (currentMax > maxReachedIndex) {
            const nextIndex = currentMax;
            if (nextIndex < selectedDay.exercises.length) {
                openedExercise = selectedDay.exercises[nextIndex].id;
            } else {
                // All done
                openedExercise = undefined;
                if (!finishTime) finishTime = Date.now();

                // Only show congrats if we didn't start with it all done
                if (
                    !allInitiallyDone &&
                    completedCount < selectedDay.exercises.length
                ) {
                    showCongrats = true;
                }
            }
        }

        if (currentMax > maxReachedIndex) {
            maxReachedIndex = currentMax;
        }
        completedCount = done;
    });

    function isExerciseLocked(index: number) {
        if (index === 0) return false;
        return index > maxReachedIndex;
    }

    // Cooldown Logic
    let cooldownActive = $state(false);
    let cooldownTime = $state(120);

    function startCooldown() {
        // Only start cooldown if there are more exercises
        if (maxReachedIndex < selectedDay.exercises.length - 1) {
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
    }

    $effect(() => {
        if (cooldownActive) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    });

    function formatTime(ms: number) {
        const seconds = Math.floor(ms / 1000);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    }
</script>

{#if cooldownActive}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        transition:fade
    >
        <div
            class="bg-card p-6 rounded-lg shadow-lg border border-border w-full h-full max-w-sm text-center space-y-4 flex justify-center items-center flex-col"
            transition:scale
        >
            <h2 class="text-2xl font-bold">Rest Time</h2>
            <div class="text-6xl font-mono font-bold text-primary">
                {Math.floor(cooldownTime / 60)}:{(cooldownTime % 60)
                    .toString()
                    .padStart(2, "0")}
            </div>
            <p class="text-muted-foreground">
                Take a breather before your next exercise!
            </p>
            <Button variant="outline" onclick={() => (cooldownActive = false)}>
                Skip Rest
            </Button>
        </div>
    </div>
{/if}

{#if showCongrats}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4"
        transition:fade={{ duration: 500 }}
    >
        <div
            class="max-w-md w-full text-center space-y-8"
            in:scale={{ duration: 600, start: 0.5, delay: 200 }}
        >
            <div class="relative inline-block">
                <div
                    class="absolute inset-0 animate-ping opacity-20 bg-yellow-400 rounded-full blur-xl"
                ></div>
                <Trophy
                    class="w-32 h-32 text-yellow-500 mx-auto relative z-10 drop-shadow-2xl"
                />
            </div>

            <div class="space-y-2">
                <h1 class="text-4xl font-extrabold tracking-tight text-primary">
                    Congratulations!
                </h1>
                <p class="text-xl text-muted-foreground">
                    You crushed today's workout!
                </p>
            </div>

            <Card.Root class="overflow-hidden border-2 border-primary/20">
                <Card.Content class="p-6 grid grid-cols-2 gap-4">
                    <div
                        class="flex flex-col items-center p-3 bg-muted/50 rounded-xl"
                    >
                        <Clock class="w-6 h-6 text-primary mb-2" />
                        <span
                            class="text-xs text-muted-foreground uppercase font-bold"
                            >Total Time</span
                        >
                        <span class="text-xl font-bold">
                            {finishTime
                                ? formatTime(finishTime - startTime)
                                : "0m 0s"}
                        </span>
                    </div>
                    <div
                        class="flex flex-col items-center p-3 bg-muted/50 rounded-xl"
                    >
                        <Timer class="w-6 h-6 text-primary mb-2" />
                        <span
                            class="text-xs text-muted-foreground uppercase font-bold"
                            >Exercises</span
                        >
                        <span class="text-xl font-bold">{completedCount}</span>
                    </div>
                </Card.Content>
            </Card.Root>

            <div class="flex gap-4 pt-4 justify-center">
                <Button
                    href="/dashboard"
                    size="lg"
                    class="w-full max-w-xs font-bold text-lg h-14 shadow-lg shadow-primary/20"
                >
                    Back to Dashboard
                </Button>
            </div>
        </div>
    </div>
{/if}

<div class="space-y-6 pb-8 main-content">
    <!-- Header with Back Button -->
    <div class="flex items-center space-x-2 pt-4">
        <Button variant="ghost" size="icon" href="/dashboard">
            <ChevronLeft class="h-6 w-6" />
        </Button>
        <div>
            <h1 class="text-2xl font-bold tracking-tight">
                {selectedDay.title}
            </h1>
            <p class="text-sm text-muted-foreground">
                Estimated Time: {selectedDay.estimatedTime || "N/A"}
            </p>
        </div>
    </div>

    <!-- Details -->

    <Accordion.Root type="single" class="w-full" bind:value={openedExercise}>
        {#each selectedDay.exercises as exercise, index}
            <ExerciseItem
                {exercise}
                {cooldownActive}
                isOpened={openedExercise === exercise.id}
                isLocked={isExerciseLocked(index)}
                onUpdateActivity={updateActivity}
                onStartCooldown={startCooldown}
            />
        {/each}
    </Accordion.Root>
</div>

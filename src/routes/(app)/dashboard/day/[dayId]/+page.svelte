<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion";
    import { Button } from "$lib/components/ui/button";
    import { ChevronLeft } from "@lucide/svelte";
    import ExerciseItem from "../../ExerciseItem.svelte";
    import { useUpdateActivityMutation } from "$lib/queries/activity";

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
    }

    let maxReachedIndex = $state(0);

    // Initial calculation
    $effect(() => {
        let currentMax = 0;
        if (selectedDay) {
            for (let i = 0; i < selectedDay.exercises.length; i++) {
                const ex = selectedDay.exercises[i];
                const status = ex.activities[0]?.status;
                if (status === "COMPLETED" || status === "SKIPPED") {
                    currentMax = i + 1;
                } else {
                    break;
                }
            }
        }
        if (currentMax > maxReachedIndex) {
            maxReachedIndex = currentMax;
        }
    });

    function isExerciseLocked(index: number) {
        if (index === 0) return false;
        return index > maxReachedIndex;
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
</script>

{#if cooldownActive}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
        <div
            class="bg-card p-6 rounded-lg shadow-lg border border-border w-full h-full max-w-sm text-center space-y-4 flex justify-center items-center flex-col"
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
        </div>
    </div>
{/if}

<div class="space-y-6 pb-8">
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

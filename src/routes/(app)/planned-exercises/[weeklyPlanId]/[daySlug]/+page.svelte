<script lang="ts">
  import { scale, fade } from "svelte/transition";
  import { toast } from "svelte-sonner";
  import { useUpdateActivityMutation } from "$lib/queries/activity";
  import * as Accordion from "$lib/components/ui/accordion";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Lock, Trophy, Clock, Timer } from "@lucide/svelte";
  import ExerciseItem from "$lib/components/exercise/ExerciseItem.svelte";

  let { data } = $props();
  let selectedDay = $derived(data.day);
  let isPastDay = $derived(data.isPastDay);

  // Check if this is a rest day
  let isRestDay = $derived(selectedDay.exercises.length === 0);

  // Check if any exercise has been touched (started)
  let isTouched = $derived(
    selectedDay.exercises.some(
      (e: any) =>
        e.activities[0]?.status === "IN_PROGRESS" ||
        e.activities[0]?.status === "COMPLETED" ||
        e.activities[0]?.status === "SKIPPED",
    ),
  );

  // Only lock if past AND untouched
  let isPastUntouched = $derived(isPastDay && !isTouched);

  // svelte-ignore state_referenced_locally
  let openedExercise = $state<string>(data.day.exercises[0]?.id.toString());

  // Use TanStack Query mutation for updating activity
  const updateActivityMutation = useUpdateActivityMutation();

  function updateActivity(
    plannedExerciseId: number,
    status: string,
    activityId?: number,
  ) {
    // Prevent updates on past untouched days only
    if (isPastUntouched) {
      toast.error("Cannot modify past untouched days", {
        description: "This workout day has passed and was never started.",
      });
      return;
    }

    // Optimistically update UI immediately
    if (status === "COMPLETED" || status === "SKIPPED") {
      // Find the exercise and update its activity status optimistically
      const exerciseIndex = selectedDay.exercises.findIndex(
        (ex) => ex.id === plannedExerciseId,
      );

      if (exerciseIndex !== -1) {
        const exercise = selectedDay.exercises[exerciseIndex];

        // Optimistically update the activity status in the UI
        if (exercise.activities && exercise.activities[0]) {
          exercise.activities[0].status = status;
        }

        // Trigger UI update by advancing to next exercise
        openedExercise =
          selectedDay.exercises[maxReachedIndex + 1]?.id.toString();
      }
    }

    return updateActivityMutation
      .mutateAsync({
        plannedExerciseId,
        status,
        activityId,
      })
      .catch((error) => {
        console.error("Failed to update activity:", error);
        toast.error("Failed to update exercise", {
          description: "Your progress may not be saved. Please try again.",
        });
      });
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
        openedExercise = selectedDay.exercises[nextIndex].id.toString();
      } else {
        // All done
        openedExercise = "";
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
      class="bg-card rounded-lg shadow-lg border border-border w-full h-full max-w-md text-center space-y-4 flex justify-center items-center flex-col"
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
          <div class="flex flex-col items-center p-3 bg-muted/50 rounded-xl">
            <Clock class="w-6 h-6 text-primary mb-2" />
            <span class="text-xs text-muted-foreground uppercase font-bold"
              >Total Time</span
            >
            <span class="text-xl font-bold">
              {finishTime ? formatTime(finishTime - startTime) : "0m 0s"}
            </span>
          </div>
          <div class="flex flex-col items-center p-3 bg-muted/50 rounded-xl">
            <Timer class="w-6 h-6 text-primary mb-2" />
            <span class="text-xs text-muted-foreground uppercase font-bold"
              >Exercises</span
            >
            <span class="text-xl font-bold">{completedCount}</span>
          </div>
        </Card.Content>
      </Card.Root>

      <div class="flex gap-4 pt-4 justify-center">
        <Button
          href="/"
          size="lg"
          class="w-full max-w-xs font-bold text-lg h-14 shadow-lg shadow-primary/20"
        >
          Back to Home
        </Button>
      </div>
    </div>
  </div>
{/if}

<div class="space-y-6 pb-8 main-content">
  <!-- Header with Back Button -->
  <div class="flex items-center space-x-2 pt-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">
        {selectedDay.title}
      </h1>
      <p class="text-sm text-muted-foreground">
        Estimated Time: {selectedDay.estimatedTime || "N/A"}
      </p>
    </div>
  </div>

  <!-- Banner for Past Days -->
  {#if isPastUntouched}
    <!-- Past Untouched - Readonly Banner -->
    <div
      class="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3"
      transition:scale={{ duration: 200 }}
    >
      <Lock class="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-red-600">
          Missed Workout - Read Only
        </h3>
        <p class="text-xs text-muted-foreground">
          This workout day was never started and cannot be modified. Focus on
          today's workout to stay on track with your fitness goals.
        </p>
      </div>
    </div>
  {:else if isPastDay && isTouched}
    <!-- Past Touched - Can Still Complete Banner -->
    <div
      class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3"
      transition:scale={{ duration: 200 }}
    >
      <Clock class="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-yellow-600">
          In Progress - Complete Anytime
        </h3>
        <p class="text-xs text-muted-foreground">
          You started this workout. You can still complete the remaining
          exercises whenever you're ready.
        </p>
      </div>
    </div>
  {/if}

  <!-- Details -->
  {#if isRestDay}
    <!-- Rest Day Message -->
    <div
      class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-8 text-center space-y-4"
      transition:scale={{ duration: 200 }}
    >
      <div class="flex justify-center">
        <div
          class="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
      <div class="space-y-2">
        <h3 class="text-xl font-bold text-blue-600">Rest Day</h3>
        <p class="text-muted-foreground">
          No exercises scheduled for today. Take this time to recover and
          prepare for your next workout.
        </p>
      </div>
      <div class="pt-4">
        <p class="text-sm text-muted-foreground italic">
          Rest is an essential part of your fitness journey. Use this day to
          stretch, hydrate, and let your muscles recover.
        </p>
      </div>
    </div>
  {:else}
    <Accordion.Root type="single" class="w-full" bind:value={openedExercise}>
      {#each selectedDay.exercises as exercise, index}
        <div data-tour={index === 0 ? "exercise-item" : undefined}>
          <ExerciseItem
            {exercise}
            {cooldownActive}
            isOpened={openedExercise === exercise.id.toString()}
            isLocked={isPastUntouched || isExerciseLocked(index)}
            onUpdateActivity={updateActivity}
            onStartCooldown={startCooldown}
          />
        </div>
      {/each}
    </Accordion.Root>
  {/if}
</div>

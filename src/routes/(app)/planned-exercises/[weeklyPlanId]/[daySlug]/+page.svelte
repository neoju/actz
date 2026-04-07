<script lang="ts">
  import { scale, fade } from "svelte/transition";
  import { toast } from "svelte-sonner";
  import { useUpdateActivityMutation } from "$lib/queries/activity";
  import * as Accordion from "$lib/components/ui/accordion";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Lock, Trophy, Clock, Timer } from "@lucide/svelte";
  import ExerciseItem from "$lib/components/exercise/exercise-item.svelte";
  import "$lib/assets/css/exercise-detail.css";
  import * as m from "$lib/paraglide/messages.js";

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
      toast.error(m.dayDetail_toast_cannotModify(), {
        description: m.dayDetail_toast_cannotModifyDesc(),
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
        toast.error(m.dayDetail_toast_updateFailed(), {
          description: m.dayDetail_toast_updateFailedDesc(),
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
  <div class="cooldown-overlay" transition:fade>
    <div class="cooldown-modal" transition:scale>
      <h2 class="cooldown-title">{m.dayDetail_cooldown_title()}</h2>
      <div class="cooldown-timer">
        {Math.floor(cooldownTime / 60)}:{(cooldownTime % 60)
          .toString()
          .padStart(2, "0")}
      </div>
      <p class="cooldown-desc">
        {m.dayDetail_cooldown_desc()}
      </p>
      <Button variant="outline" onclick={() => (cooldownActive = false)}>
        {m.dayDetail_cooldown_skip()}
      </Button>
    </div>
  </div>
{/if}

{#if showCongrats}
  <div class="congrats-overlay" transition:fade={{ duration: 500 }}>
    <div
      class="congrats-content"
      in:scale={{ duration: 600, start: 0.5, delay: 200 }}
    >
      <div class="trophy-wrapper">
        <div class="trophy-glow"></div>
        <Trophy class="trophy-icon" />
      </div>

      <div class="congrats-text">
        <h1 class="congrats-title">{m.dayDetail_congrats_title()}</h1>
        <p class="congrats-subtitle">
          {m.dayDetail_congrats_subtitle()}
        </p>
      </div>

      <Card.Root class="stats-card">
        <Card.Content class="stats-grid">
          <div class="stat-item">
            <Clock class="stat-icon" />
            <span class="stat-label">{m.dayDetail_congrats_totalTime()}</span>
            <span class="stat-value">
              {finishTime ? formatTime(finishTime - startTime) : "0m 0s"}
            </span>
          </div>
          <div class="stat-item">
            <Timer class="stat-icon" />
            <span class="stat-label">{m.dayDetail_congrats_exercises()}</span>
            <span class="stat-value">{completedCount}</span>
          </div>
        </Card.Content>
      </Card.Root>

      <div class="congrats-actions">
        <Button href="/" size="lg" class="home-btn">
          {m.dayDetail_congrats_backHome()}
        </Button>
      </div>
    </div>
  </div>
{/if}

<div class="exercise-detail-container">
  <!-- Header with Back Button -->
  <div class="detail-header">
    <div>
      <h1 class="detail-title">
        {selectedDay.title}
      </h1>
      <p class="detail-subtitle">
        {m.dayDetail_estimatedTime({ time: selectedDay.estimatedTime || "N/A" })}
      </p>
    </div>
  </div>

  <!-- Banner for Past Days -->
  {#if isPastUntouched}
    <!-- Past Untouched - Readonly Banner -->
    <div class="banner-past-untouched" transition:scale={{ duration: 200 }}>
      <Lock class="banner-icon-red" />
      <div class="space-y-1">
        <h3 class="banner-title-red">{m.dayDetail_banner_missedTitle()}</h3>
        <p class="banner-text">
          {m.dayDetail_banner_missedDesc()}
        </p>
      </div>
    </div>
  {:else if isPastDay && isTouched}
    <!-- Past Touched - Can Still Complete Banner -->
    <div class="banner-past-touched" transition:scale={{ duration: 200 }}>
      <Clock class="banner-icon-yellow" />
      <div class="space-y-1">
        <h3 class="banner-title-yellow">{m.dayDetail_banner_inProgressTitle()}</h3>
        <p class="banner-text">
          {m.dayDetail_banner_inProgressDesc()}
        </p>
      </div>
    </div>
  {/if}

  <!-- Details -->
  {#if isRestDay}
    <!-- Rest Day Message -->
    <div class="rest-day-container" transition:scale={{ duration: 200 }}>
      <div class="rest-icon-wrapper">
        <div class="rest-icon-bg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="rest-icon"
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
      <div class="rest-content">
        <h3 class="rest-title">{m.plan_restDay()}</h3>
        <p class="rest-desc">
          {m.plan_restDayDesc()}
        </p>
      </div>
      <div class="rest-footer">
        <p class="rest-footer-text">
          {m.dayDetail_restDay_desc()}
        </p>
      </div>
    </div>
  {:else}
    <Accordion.Root type="single" class="accordion-root" bind:value={openedExercise}>
      {#each selectedDay.exercises as exercise, index (exercise.id)}
        <ExerciseItem
          {exercise}
          {cooldownActive}
          isOpened={openedExercise === exercise.id.toString()}
          isLocked={isPastUntouched || isExerciseLocked(index)}
          onUpdateActivity={updateActivity}
          onStartCooldown={startCooldown}
        />
      {/each}
    </Accordion.Root>
  {/if}
</div>

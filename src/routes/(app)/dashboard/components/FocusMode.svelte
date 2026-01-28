<script lang="ts">
    import { scale } from "svelte/transition";
    import ExerciseContent from "./ExerciseContent.svelte";
    import ExerciseControls from "./ExerciseControls.svelte";

    let {
        exercise,
        detail,
        status,
        activity,
        isLocked,
        cooldownActive,
        totalSets,
        currentSet,
        isSetInProgress,
        timeLeft,
        isTimerExercise,
        onUpdateActivity,
        onStartSet,
        onFinishSet,
        onStartCooldown,
    } = $props();
</script>

<div
    class="fixed inset-0 z-50 bg-background flex flex-col"
    in:scale={{ duration: 300, start: 0.95, opacity: 0 }}
    out:scale={{ duration: 200, start: 0.95, opacity: 0 }}
>
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-xl font-bold px-2">{exercise.name}</h2>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
        <ExerciseContent {detail} {exercise} initialized instructionsOpen />
    </div>

    <!-- Footer Controls -->
    <div class="p-4 border-t bg-card pb-8">
        <ExerciseControls
            {exercise}
            {activity}
            {status}
            {isLocked}
            {cooldownActive}
            {totalSets}
            {currentSet}
            {isSetInProgress}
            {timeLeft}
            {isTimerExercise}
            {onUpdateActivity}
            {onStartSet}
            {onFinishSet}
            {onStartCooldown}
        />
    </div>
</div>

<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion";
    import exercisesDB from "../../api/exercises.json";
    import ExerciseHeader from "./components/ExerciseHeader.svelte";
    import ExerciseContent from "./components/ExerciseContent.svelte";
    import ExerciseControls from "./components/ExerciseControls.svelte";
    import FocusMode from "./components/FocusMode.svelte";

    let {
        isOpened,
        exercise,
        isLocked,
        cooldownActive,
        onUpdateActivity,
        onStartCooldown,
    } = $props();

    let initialized = $state(false);
    let isFullScreen = $state(false);

    $effect(() => {
        if (!initialized && isOpened) {
            initialized = true;
        }
    });

    let detail = $derived(
        exercisesDB.find(
            (e) => e.name.toLowerCase() === exercise.name.toLowerCase(),
        ) ||
            exercisesDB.find((e) =>
                e.name.toLowerCase().includes(exercise.name.toLowerCase()),
            ),
    );

    let activity = $derived(exercise.activities[0]);
    let status = $derived(activity?.status || "PENDING");

    // Sets logic
    let totalSets = $derived(
        exercise.sets && !isNaN(parseInt(exercise.sets))
            ? parseInt(exercise.sets)
            : 1,
    );

    // Client-state for sets
    let currentSet = $state(1);
    let isSetInProgress = $state(false);

    // Timer logic
    let isTimerExercise = $derived(detail?.tags?.includes("timer") ?? false);
    let duration = $derived.by(() => {
        if (!isTimerExercise || !exercise.reps) return 0;
        const text = exercise.reps.toLowerCase();
        if (text.includes("min")) {
            return parseInt(text) * 60;
        }
        return parseInt(text) || 0;
    });

    let timeLeft = $state(0);
    let timerInterval: any;

    // Reset if status changes back to PENDING
    $effect(() => {
        if (status === "PENDING") {
            currentSet = 1;
            isSetInProgress = false;
            clearInterval(timerInterval);
            timeLeft = 0;
        }
    });

    function startTimer() {
        timeLeft = duration;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                // Optional: Play sound?
            }
        }, 1000);
    }

    function handleStartSet() {
        isSetInProgress = true;
        if (isTimerExercise) {
            startTimer();
        }
    }

    function handleFinishSet() {
        isSetInProgress = false;
        clearInterval(timerInterval);
        if (currentSet < totalSets) {
            currentSet++;
        } else {
            // Finished last set
            handleComplete();
        }
    }

    function handleComplete() {
        // Optimistically update
        // NOTE: The parent component should handle the actual mutation and cooldown
        // We just trigger it here.

        // Close fullscreen if open
        isFullScreen = false;

        onUpdateActivity(exercise.id, "COMPLETED", activity?.id);
        onStartCooldown();
    }

    async function handleUpdateActivity(
        id: string,
        status: string,
        aid?: string,
    ) {
        if (status === "SKIPPED" || status === "COMPLETED") {
            isFullScreen = false;
        }
        await onUpdateActivity(id, status, aid);
    }

    function handleFullscreenStart() {
        isFullScreen = true;
    }
</script>

{#if isFullScreen}
    <FocusMode
        {exercise}
        {detail}
        {status}
        {activity}
        {isLocked}
        {cooldownActive}
        {totalSets}
        {currentSet}
        {isSetInProgress}
        {timeLeft}
        {isTimerExercise}
        onUpdateActivity={handleUpdateActivity}
        onStartSet={handleStartSet}
        onFinishSet={handleFinishSet}
        onStartCooldown={handleComplete}
    />
{/if}

<Accordion.Item
    value={exercise.id}
    disabled={isLocked || (status === "PENDING" && cooldownActive)}
>
    <Accordion.Trigger class="hover:no-underline">
        <ExerciseHeader {status} name={exercise.name} {isLocked} />
    </Accordion.Trigger>
    <Accordion.Content>
        <ExerciseContent {detail} {exercise} {initialized} />

        <!-- Actions -->
        <div class="mt-4">
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
                onUpdateActivity={handleUpdateActivity}
                onStartSet={handleStartSet}
                onFinishSet={handleFinishSet}
                onStartCooldown={handleComplete}
                onFullscreenStart={handleFullscreenStart}
            />
        </div>
    </Accordion.Content>
</Accordion.Item>

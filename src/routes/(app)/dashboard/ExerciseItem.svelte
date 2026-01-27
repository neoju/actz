<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion";
    import * as Collapsible from "$lib/components/ui/collapsible";
    import { Button } from "$lib/components/ui/button";
    import PressHoldButton from "$lib/components/PressHoldButton.svelte";
    import { cn } from "$lib/utils";
    import exercisesDB from "../../api/exercises.json";
    import {
        Check,
        ChevronDown,
        SkipForward,
        Play,
        Circle,
        Lock,
    } from "@lucide/svelte";
    import Loader from "@lucide/svelte/icons/loader";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";

    let {
        isOpened,
        exercise,
        isLocked,
        cooldownActive,
        onUpdateActivity,
        onStartCooldown,
    } = $props();

    // AlertDialog state for reset confirmation
    let showResetDialog = $state(false);
    let initialized = $state(false);

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
            onUpdateActivity(exercise.id, "COMPLETED", activity?.id);
            onStartCooldown();
        }
    }

    async function handleMainAction() {
        if (status === "PENDING") {
            onUpdateActivity(exercise.id, "IN_PROGRESS");
        } else if (status === "IN_PROGRESS") {
            if (totalSets > 1) {
                if (isSetInProgress) {
                    handleFinishSet();
                } else {
                    handleStartSet();
                }
            } else {
                // Single set flow
                if (isTimerExercise && !isSetInProgress) {
                    handleStartSet();
                    return;
                }

                await onUpdateActivity(exercise.id, "COMPLETED", activity?.id);
                onStartCooldown();
            }
        }
    }

    function requiresHold() {
        if (status !== "IN_PROGRESS") return false;
        if (isTimerExercise && timeLeft > 0) return false;

        if (currentSet === totalSets && isSetInProgress) {
            return true;
        }
        if (totalSets > 1) return isSetInProgress;
        if (isTimerExercise && isSetInProgress) return true;
        return false;
    }

    // Derived button content for set exercises
    let buttonContent = $derived.by(() => {
        if (isTimerExercise && timeLeft > 0) {
            return `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`;
        }
        if (isSetInProgress) {
            return totalSets > 1 ? `Finish Set ${currentSet}` : "Finish";
        }
        return totalSets > 1 ? `Start Set ${currentSet}` : "Start";
    });

    // Derived button classes for set exercises
    let buttonClasses = $derived(
        cn(
            "flex-1",
            isSetInProgress
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700",
        ),
    );
</script>

<Accordion.Item
    value={exercise.id}
    disabled={isLocked || (status === "PENDING" && cooldownActive)}
>
    <Accordion.Trigger class="hover:no-underline">
        <div class="flex items-center gap-3 w-full text-left">
            {#if status === "COMPLETED"}
                <Check class="text-green-500 w-5 h-5" />
            {:else if status === "SKIPPED"}
                <SkipForward class="text-yellow-500 w-5 h-5" />
            {:else if status === "IN_PROGRESS"}
                <Play class="text-blue-500 w-5 h-5" />
            {:else}
                <Circle class="text-muted-foreground w-5 h-5" />
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

            {#if isLocked}
                <div class="flex items-center text-muted-foreground mr-2">
                    <Lock class="w-4 h-4 mr-1" />
                    <span class="text-xs">Locked</span>
                </div>
            {/if}
        </div>
    </Accordion.Trigger>
    <Accordion.Content>
        <div class="space-y-4 pt-2">
            {#if detail?.youtube_tutor_video && initialized}
                <div
                    class="aspect-video w-full rounded-md overflow-hidden bg-gray-500"
                >
                    <iframe
                        width="100%"
                        height="100%"
                        src={detail.youtube_tutor_video}
                        title={exercise.name}
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
            {/if}

            <div class="text-sm text-muted-foreground">
                {detail?.description || "No description available."}
            </div>

            {#if detail?.instructions}
                <Collapsible.Root class="w-full">
                    <Collapsible.Trigger
                        class="flex items-center justify-between w-full"
                    >
                        <span class="font-semibold">Instructions</span>
                        <Button variant="ghost" size="sm" class="w-9 p-0">
                            <ChevronDown
                                class="h-4 w-4 transition-transform data-[state=open]:rotate-180"
                            />
                            <span class="sr-only">Toggle</span>
                        </Button>
                    </Collapsible.Trigger>
                    <Collapsible.Content
                        class="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down flex flex-col gap-2 overflow-hidden transition-all duration-300"
                    >
                        <ol
                            class="list-decimal list-inside space-y-2 text-sm text-muted-foreground mt-2"
                        >
                            {#each detail.instructions as instruction}
                                <li class="text-sm">{instruction}</li>
                            {/each}
                        </ol>
                    </Collapsible.Content>
                </Collapsible.Root>
            {/if}

            <div class="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                    <span class="font-bold block">Sets</span>
                    {exercise.sets}
                </div>
                <div>
                    <span class="font-bold block">Reps</span>
                    {exercise.reps}
                </div>
                {#if exercise.notes}
                    <div class="col-span-2">
                        <span class="font-bold block">Notes</span>
                        {exercise.notes}
                    </div>
                {/if}
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
                {#if status === "PENDING"}
                    <div class="flex gap-2 w-full">
                        <Button class="flex-1" onclick={handleMainAction}>
                            Start Exercise
                        </Button>
                        <PressHoldButton
                            class="flex-1 border-yellow-500 text-yellow-700"
                            variant="outline"
                            onAction={() =>
                                onUpdateActivity(
                                    exercise.id,
                                    "SKIPPED",
                                    activity?.id,
                                )}
                        >
                            Skip
                        </PressHoldButton>
                    </div>
                {:else if status === "IN_PROGRESS"}
                    <!-- Dynamic Button for Sets -->
                    {#if totalSets > 1}
                        {#if requiresHold()}
                            <PressHoldButton
                                onAction={handleMainAction}
                                variant="default"
                                class={buttonClasses}
                            >
                                {buttonContent}
                            </PressHoldButton>
                        {:else}
                            <Button
                                onclick={handleMainAction}
                                variant="default"
                                class={buttonClasses}
                            >
                                {buttonContent}
                            </Button>
                        {/if}
                    {:else if requiresHold()}
                        <PressHoldButton
                            onAction={handleMainAction}
                            variant="default"
                            class={buttonClasses}
                        >
                            {buttonContent}
                        </PressHoldButton>
                    {:else}
                        <Button
                            onclick={handleMainAction}
                            variant="default"
                            class={buttonClasses}
                        >
                            {buttonContent}
                        </Button>
                    {/if}

                    <PressHoldButton
                        variant="outline"
                        class="flex-1 border-yellow-500 text-yellow-700"
                        onAction={() =>
                            onUpdateActivity(
                                exercise.id,
                                "SKIPPED",
                                activity?.id,
                            )}
                        disabled={isLocked || cooldownActive}
                    >
                        Skip
                    </PressHoldButton>
                {:else}
                    <AlertDialog.Root
                        open={showResetDialog}
                        onOpenChange={(e) => (showResetDialog = e)}
                    >
                        <AlertDialog.Trigger>
                            {#snippet child()}
                                <Button
                                    onclick={() => (showResetDialog = true)}
                                    variant="outline"
                                    size="sm"
                                >
                                    Reset
                                </Button>
                            {/snippet}
                        </AlertDialog.Trigger>
                        <AlertDialog.Content>
                            <AlertDialog.Header>
                                <AlertDialog.Title
                                    >Reset Exercise</AlertDialog.Title
                                >
                                <AlertDialog.Description>
                                    Are you sure you want to reset this
                                    exercise? This will set its status back to
                                    pending.
                                </AlertDialog.Description>
                            </AlertDialog.Header>
                            <AlertDialog.Footer>
                                <AlertDialog.Cancel>
                                    {#snippet child()}
                                        <Button
                                            variant="outline"
                                            onclick={() =>
                                                (showResetDialog = false)}
                                        >
                                            Cancel
                                        </Button>
                                    {/snippet}
                                </AlertDialog.Cancel>
                                <AlertDialog.Action>
                                    {#snippet child()}
                                        <Button
                                            variant="destructive"
                                            onclick={async () => {
                                                await onUpdateActivity(
                                                    exercise.id,
                                                    "IN_PROGRESS",
                                                    activity?.id,
                                                );
                                                showResetDialog = false;
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    {/snippet}
                                </AlertDialog.Action>
                            </AlertDialog.Footer>
                        </AlertDialog.Content>
                    </AlertDialog.Root>
                    <span
                        class="text-sm text-muted-foreground self-center ml-2"
                    >
                        {status === "COMPLETED" ? "Done!" : "Skipped"}
                    </span>
                {/if}
            </div>
        </div>
    </Accordion.Content>
</Accordion.Item>

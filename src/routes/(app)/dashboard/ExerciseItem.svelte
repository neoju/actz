<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion";
    import * as Collapsible from "$lib/components/ui/collapsible";
    import { Button } from "$lib/components/ui/button";
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

    let {
        isOpened,
        exercise,
        isLocked,
        cooldownActive,
        onUpdateActivity,
        onStartCooldown,
    } = $props();

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
    let pressTimer: any;
    let pressedButton = $state<"main" | "skip" | null>(null);

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
            pressedButton = null;
            clearTimeout(pressTimer);
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

    function handleMainAction() {
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

                onUpdateActivity(exercise.id, "COMPLETED", activity?.id);
                onStartCooldown();
            }
        }
    }

    function requiresHold() {
        if (status !== "IN_PROGRESS") return false;
        if (isTimerExercise && timeLeft > 0) return false;

        if (totalSets > 1) return isSetInProgress;
        if (isTimerExercise && isSetInProgress) return true;
        return true;
    }

    function handlePressStart(
        e: Event,
        type: "main" | "skip",
        action: () => void,
    ) {
        let needHold = false;
        if (type === "skip") needHold = true;
        else if (type === "main") needHold = requiresHold();

        if (needHold) {
            e.preventDefault();
            pressedButton = type;
            pressTimer = setTimeout(() => {
                action();
                pressedButton = null;
            }, 1000);
        }
    }

    function handlePressEnd() {
        if (pressedButton) {
            clearTimeout(pressTimer);
            pressedButton = null;
        }
    }

    function handleClick() {
        if (!requiresHold()) {
            handleMainAction();
        }
    }
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
                        <Button
                            class="flex-1"
                            onmousedown={(e) =>
                                handlePressStart(e, "main", handleClick)}
                            ontouchstart={(e) =>
                                handlePressStart(e, "main", handleClick)}
                            onmouseup={handlePressEnd}
                            onmouseleave={handlePressEnd}
                            ontouchend={handlePressEnd}
                        >
                            Start Exercise
                        </Button>
                        <Button
                            class="flex-1 border-yellow-500 text-yellow-700"
                            variant="outline"
                            onmousedown={(e) =>
                                handlePressStart(e, "skip", () =>
                                    onUpdateActivity(
                                        exercise.id,
                                        "SKIPPED",
                                        activity?.id,
                                    ),
                                )}
                            ontouchstart={(e) =>
                                handlePressStart(e, "skip", () =>
                                    onUpdateActivity(
                                        exercise.id,
                                        "SKIPPED",
                                        activity?.id,
                                    ),
                                )}
                            onmouseup={handlePressEnd}
                            onmouseleave={handlePressEnd}
                            ontouchend={handlePressEnd}
                            disabled={pressedButton === "skip"}
                        >
                            Skip
                        </Button>
                    </div>
                {:else if status === "IN_PROGRESS"}
                    <!-- Dynamic Button for Sets -->
                    {#if totalSets > 1}
                        <Button
                            onmousedown={(e) =>
                                handlePressStart(e, "main", handleMainAction)}
                            onmouseup={handlePressEnd}
                            onmouseleave={handlePressEnd}
                            ontouchstart={(e) =>
                                handlePressStart(e, "main", handleMainAction)}
                            ontouchend={handlePressEnd}
                            onclick={handleClick}
                            variant="default"
                            class={cn(
                                "flex-1 transition-transform select-none touch-none relative overflow-hidden",
                                isSetInProgress
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700",
                                pressedButton === "main" &&
                                    isSetInProgress &&
                                    "scale-95 duration-1000 ease-linear",
                            )}
                        >
                            <div
                                class={cn(
                                    "absolute left-0 top-0 bottom-0 bg-white/20 transition-all ease-linear h-full",
                                    pressedButton === "main" && isSetInProgress
                                        ? "w-full duration-1000"
                                        : "w-0 duration-0",
                                )}
                            ></div>
                            <span class="relative z-10">
                                {#if isSetInProgress}
                                    {#if isTimerExercise && timeLeft > 0}
                                        {Math.floor(timeLeft / 60)}:{(
                                            timeLeft % 60
                                        )
                                            .toString()
                                            .padStart(2, "0")}
                                    {:else}
                                        {pressedButton === "main"
                                            ? "Hold to Finish..."
                                            : `Finish Set ${currentSet}`}
                                    {/if}
                                {:else}
                                    Start Set {currentSet}
                                {/if}
                            </span>
                        </Button>
                    {:else}
                        <Button
                            onmousedown={(e) =>
                                handlePressStart(e, "main", handleMainAction)}
                            onmouseup={handlePressEnd}
                            onmouseleave={handlePressEnd}
                            ontouchstart={(e) =>
                                handlePressStart(e, "main", handleMainAction)}
                            ontouchend={handlePressEnd}
                            onclick={handleClick}
                            variant="default"
                            class={cn(
                                "flex-1 bg-green-600 hover:bg-green-700 transition-transform select-none touch-none relative overflow-hidden",
                                pressedButton === "main" &&
                                    "scale-95 duration-1000 ease-linear",
                            )}
                        >
                            <div
                                class={cn(
                                    "absolute left-0 top-0 bottom-0 bg-white/20 transition-all ease-linear h-full",
                                    pressedButton === "main"
                                        ? "w-full duration-1000"
                                        : "w-0 duration-0",
                                )}
                            ></div>
                            <span class="relative z-10">
                                {#if isTimerExercise && isSetInProgress && timeLeft > 0}
                                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60)
                                        .toString()
                                        .padStart(2, "0")}
                                {:else}
                                    {pressedButton === "main"
                                        ? "Hold to Finish..."
                                        : "Finish"}
                                {/if}
                            </span>
                        </Button>
                    {/if}

                    <Button
                        onmousedown={(e) =>
                            handlePressStart(e, "skip", () =>
                                onUpdateActivity(
                                    exercise.id,
                                    "SKIPPED",
                                    activity?.id,
                                ),
                            )}
                        onmouseup={handlePressEnd}
                        onmouseleave={handlePressEnd}
                        ontouchstart={(e) =>
                            handlePressStart(e, "skip", () =>
                                onUpdateActivity(
                                    exercise.id,
                                    "SKIPPED",
                                    activity?.id,
                                ),
                            )}
                        ontouchend={handlePressEnd}
                        variant="outline"
                        class={cn(
                            "relative overflow-hidden transition-transform select-none touch-none",
                            pressedButton === "skip" &&
                                "scale-95 duration-1000 ease-linear",
                        )}
                    >
                        <div
                            class={cn(
                                "absolute left-0 top-0 bottom-0 bg-black/10 transition-all ease-linear h-full",
                                pressedButton === "skip"
                                    ? "w-full duration-1000"
                                    : "w-0 duration-0",
                            )}
                        ></div>
                        <span class="relative z-10">
                            {pressedButton === "skip" ? "Hold..." : "Skip"}
                        </span>
                    </Button>
                {:else}
                    <Button
                        onclick={() =>
                            onUpdateActivity(
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
                        {status === "COMPLETED" ? "Done!" : "Skipped"}
                    </span>
                {/if}
            </div>
        </div>
    </Accordion.Content>
</Accordion.Item>

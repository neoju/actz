<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import PressHoldButton from "$lib/components/PressHoldButton.svelte";
    import { cn } from "$lib/utils";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { useExercise } from "./ctx.svelte";

    let { isFocusMode = false } = $props();

    const ctx = useExercise();

    // Skip Dialog
    let showSkipDialog = $state(false);

    // Derived button content
    let buttonContent = $derived.by(() => {
        if (ctx.isTimerExercise && ctx.timeLeft > 0) {
            const minutes = Math.floor(ctx.timeLeft / 60);
            const seconds = (ctx.timeLeft % 60).toString().padStart(2, "0");
            return `${minutes}:${seconds}`;
        }
        if (ctx.isSetInProgress) {
            return ctx.totalSets > 1
                ? `Finish Set ${ctx.currentSet}`
                : "Finish";
        }
        return ctx.totalSets > 1 ? `Start Set ${ctx.currentSet}` : "Start";
    });

    // Derived button classes
    let buttonClasses = $derived(
        cn(
            "flex-1",
            ctx.isFullScreen ? "h-16 text-xl font-bold" : "",
            ctx.isSetInProgress
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700",
        ),
    );

    function requiresHold() {
        if (ctx.status !== "IN_PROGRESS") return false;
        if (ctx.isTimerExercise && ctx.timeLeft > 0) return false;

        if (ctx.currentSet === ctx.totalSets && ctx.isSetInProgress) {
            return true;
        }
        if (ctx.totalSets > 1) return ctx.isSetInProgress;
        if (ctx.isTimerExercise && ctx.isSetInProgress) return true;
        return false;
    }

    async function handleMainAction() {
        if (ctx.status === "PENDING") {
            await ctx.handleUpdateActivity(ctx.exercise.id, "IN_PROGRESS");
            ctx.handleFullscreenStart();
        } else if (ctx.status === "IN_PROGRESS") {
            if (ctx.totalSets > 1) {
                if (ctx.isSetInProgress) {
                    ctx.handleFinishSet();
                } else {
                    ctx.handleStartSet();
                }
            } else {
                // Single set flow
                if (ctx.isTimerExercise && !ctx.isSetInProgress) {
                    ctx.handleStartSet();
                    return;
                }

                // Non-blocking: Fire and forget
                ctx.handleUpdateActivity(
                    ctx.exercise.id,
                    "COMPLETED",
                    ctx.activity?.id,
                );
                ctx.handleComplete();
            }

            ctx.handleFullscreenStart();
        }
    }

    // Reset Dialog
    let showResetDialog = $state(false);

    function handleSkip() {
        ctx.handleUpdateActivity(ctx.exercise.id, "SKIPPED", ctx.activity?.id);
        showSkipDialog = false;
    }
</script>

<div class="flex gap-2">
    {#if ctx.status === "PENDING"}
        <div class="flex gap-2 w-full">
            <Button
                class={cn(
                    isFocusMode ? "w-full" : "flex-1",
                    ctx.isFullScreen ? "h-16 text-xl font-bold" : "",
                )}
                onclick={handleMainAction}
            >
                Start Exercise
            </Button>
            {#if !isFocusMode}
                <AlertDialog.Root
                    open={showSkipDialog}
                    onOpenChange={(e) => (showSkipDialog = e)}
                >
                    <AlertDialog.Trigger>
                        {#snippet child({ props })}
                            <Button
                                {...props}
                                variant="outline"
                                class={cn(
                                    "flex-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50",
                                    ctx.isFullScreen
                                        ? "h-16 text-xl font-bold"
                                        : "",
                                )}
                            >
                                Skip
                            </Button>
                        {/snippet}
                    </AlertDialog.Trigger>
                    <AlertDialog.Content>
                        <AlertDialog.Header>
                            <AlertDialog.Title>Skip Exercise</AlertDialog.Title>
                            <AlertDialog.Description>
                                Are you sure you want to skip "{ctx.exercise
                                    .name}"? This exercise will be marked as
                                skipped.
                            </AlertDialog.Description>
                        </AlertDialog.Header>
                        <AlertDialog.Footer>
                            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                            <AlertDialog.Action
                                onclick={handleSkip}
                                class="bg-yellow-600 hover:bg-yellow-700"
                            >
                                Skip Exercise
                            </AlertDialog.Action>
                        </AlertDialog.Footer>
                    </AlertDialog.Content>
                </AlertDialog.Root>
            {/if}
        </div>
    {:else if ctx.status === "IN_PROGRESS"}
        <!-- Dynamic Button for Sets -->
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

        {#if !isFocusMode}
            <AlertDialog.Root
                open={showSkipDialog}
                onOpenChange={(e) => (showSkipDialog = e)}
            >
                <AlertDialog.Trigger>
                    {#snippet child({ props })}
                        <Button
                            {...props}
                            variant="outline"
                            class={cn(
                                "flex-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50",
                                ctx.isFullScreen
                                    ? "h-16 text-xl font-bold"
                                    : "",
                            )}
                            disabled={ctx.isLocked || ctx.cooldownActive}
                        >
                            Skip
                        </Button>
                    {/snippet}
                </AlertDialog.Trigger>
                <AlertDialog.Content>
                    <AlertDialog.Header>
                        <AlertDialog.Title>Skip Exercise</AlertDialog.Title>
                        <AlertDialog.Description>
                            Are you sure you want to skip "{ctx.exercise.name}"?
                            This exercise will be marked as skipped.
                        </AlertDialog.Description>
                    </AlertDialog.Header>
                    <AlertDialog.Footer>
                        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                        <AlertDialog.Action
                            onclick={handleSkip}
                            class="bg-yellow-600 hover:bg-yellow-700"
                        >
                            Skip Exercise
                        </AlertDialog.Action>
                    </AlertDialog.Footer>
                </AlertDialog.Content>
            </AlertDialog.Root>
        {/if}
    {:else}
        <AlertDialog.Root
            open={showResetDialog}
            onOpenChange={(e) => (showResetDialog = e)}
        >
            <AlertDialog.Trigger>
                {#snippet child({ props })}
                    <Button {...props} variant="outline" size="sm">
                        Reset
                    </Button>
                {/snippet}
            </AlertDialog.Trigger>
            <AlertDialog.Content>
                <AlertDialog.Header>
                    <AlertDialog.Title>Reset Exercise</AlertDialog.Title>
                    <AlertDialog.Description>
                        Are you sure you want to reset this exercise? This will
                        set its status back to pending.
                    </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                    <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                    <AlertDialog.Action
                        onclick={() => {
                            // Non-blocking: Fire and forget
                            ctx.handleUpdateActivity(
                                ctx.exercise.id,
                                "PENDING",
                                ctx.activity?.id,
                            );
                            showResetDialog = false;
                        }}
                    >
                        Reset
                    </AlertDialog.Action>
                </AlertDialog.Footer>
            </AlertDialog.Content>
        </AlertDialog.Root>
        <span class="text-sm text-muted-foreground self-center ml-2">
            {ctx.status === "COMPLETED" ? "Done!" : "Skipped"}
        </span>
    {/if}
</div>

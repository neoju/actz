<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import PressHoldButton from "$lib/components/PressHoldButton.svelte";
    import { cn } from "$lib/utils";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";

    let {
        exercise,
        activity,
        status,
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
        onFullscreenStart = undefined,
    } = $props();

    // Derived button content
    let buttonContent = $derived.by(() => {
        if (isTimerExercise && timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = (timeLeft % 60).toString().padStart(2, "0");
            return `${minutes}:${seconds}`;
        }
        if (isSetInProgress) {
            return totalSets > 1 ? `Finish Set ${currentSet}` : "Finish";
        }
        return totalSets > 1 ? `Start Set ${currentSet}` : "Start";
    });

    // Derived button classes
    let buttonClasses = $derived(
        cn(
            "flex-1",
            isSetInProgress
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700",
        ),
    );

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

    async function handleMainAction() {
        if (status === "PENDING") {
            // Eagerly trigger fullscreen
            onFullscreenStart?.();
            await onUpdateActivity(exercise.id, "IN_PROGRESS");
        } else if (status === "IN_PROGRESS") {
            // Also trigger fullscreen if interacting with in-progress exercise
            onFullscreenStart?.();

            if (totalSets > 1) {
                if (isSetInProgress) {
                    onFinishSet();
                } else {
                    onStartSet();
                }
            } else {
                // Single set flow
                if (isTimerExercise && !isSetInProgress) {
                    onStartSet();
                    return;
                }

                await onUpdateActivity(exercise.id, "COMPLETED", activity?.id);
                onStartCooldown();
            }
        }
    }

    // Reset Dialog
    let showResetDialog = $state(false);
</script>

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
                    onUpdateActivity(exercise.id, "SKIPPED", activity?.id)}
            >
                Skip
            </PressHoldButton>
        </div>
    {:else if status === "IN_PROGRESS"}
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

        <PressHoldButton
            variant="outline"
            class="flex-1 border-yellow-500 text-yellow-700"
            onAction={() =>
                onUpdateActivity(exercise.id, "SKIPPED", activity?.id)}
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
                        onclick={async () => {
                            await onUpdateActivity(
                                exercise.id,
                                "PENDING",
                                activity?.id,
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
            {status === "COMPLETED" ? "Done!" : "Skipped"}
        </span>
    {/if}
</div>

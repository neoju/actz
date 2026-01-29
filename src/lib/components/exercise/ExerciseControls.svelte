<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { cn } from "$lib/utils";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import MaximizeIcon from "@lucide/svelte/icons/maximize";
    import { useExercise } from "./ctx.svelte";

    let { isFocusMode = false } = $props();

    const ctx = useExercise();

    // Skip Dialog
    let showSkipDialog = $state(false);
    // Reset Dialog
    let showResetDialog = $state(false);

    function handleStartFocusMode() {
        if (ctx.status === "PENDING") {
            // Start the exercise and enter focus mode
            ctx.handleUpdateActivity(ctx.exercise.id, "IN_PROGRESS");
        }
        // Enter focus mode
        ctx.handleFullscreenStart();
    }

    function handleSkip() {
        ctx.handleUpdateActivity(ctx.exercise.id, "SKIPPED", ctx.activity?.id);
        showSkipDialog = false;
    }
</script>

<div class="flex gap-2">
    {#if ctx.status === "PENDING"}
        <!-- PENDING: Only show Start in Focus Mode and Skip buttons -->
        <div class="flex gap-2 w-full">
            {#if isFocusMode}
                <!-- In focus mode - should not happen for PENDING, but just in case -->
                <Button
                    class="w-full h-16 text-xl font-bold"
                    onclick={handleStartFocusMode}
                >
                    Start Exercise
                </Button>
            {:else}
                <!-- Normal mode - Start button opens focus mode -->
                <Button class="flex-1" onclick={handleStartFocusMode}>
                    <MaximizeIcon class="h-4 w-4 mr-2" />
                    Start in Focus Mode
                </Button>
                <AlertDialog.Root
                    open={showSkipDialog}
                    onOpenChange={(e) => (showSkipDialog = e)}
                >
                    <AlertDialog.Trigger>
                        {#snippet child({ props })}
                            <Button
                                {...props}
                                variant="outline"
                                class="flex-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
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
        <!-- IN_PROGRESS: Only show Continue in Focus Mode and Skip in normal mode -->
        {#if isFocusMode}
            <!-- In focus mode - skip is in header, don't show anything here except main action -->
            <!-- This content is actually in FocusMode.svelte footer -->
        {:else}
            <!-- Normal mode - Only show Continue in Focus Mode and Skip -->
            <Button class="flex-1" onclick={handleStartFocusMode}>
                <MaximizeIcon class="h-4 w-4 mr-2" />
                Continue in Focus Mode
            </Button>
            <AlertDialog.Root
                open={showSkipDialog}
                onOpenChange={(e) => (showSkipDialog = e)}
            >
                <AlertDialog.Trigger>
                    {#snippet child({ props })}
                        <Button
                            {...props}
                            variant="outline"
                            class="flex-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
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
        <!-- COMPLETED or SKIPPED: Show Reset and status -->
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

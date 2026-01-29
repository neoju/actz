<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import PressHoldButton from "$lib/components/PressHoldButton.svelte";
    import { cn } from "$lib/utils";
    import { useExercise } from "./ctx.svelte";

    const ctx = useExercise();

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
            "w-full h-16 text-xl font-bold",
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

    function handleMainAction() {
        if (ctx.status === "IN_PROGRESS") {
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

                // Complete the exercise
                ctx.handleUpdateActivity(
                    ctx.exercise.id,
                    "COMPLETED",
                    ctx.activity?.id,
                );
                ctx.handleComplete();
            }
        }
    }
</script>

<div class="flex gap-2">
    {#if ctx.status === "IN_PROGRESS"}
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
    {/if}
</div>

<script lang="ts">
    import * as Accordion from "$lib/components/ui/accordion";
    import ExerciseHeader from "$lib/components/exercise/exercise-header.svelte";
    import ExerciseContent from "$lib/components/exercise/exercise-content.svelte";
    import ExerciseControls from "$lib/components/exercise/exercise-controls.svelte";
    import FocusMode from "$lib/components/exercise/focus-mode.svelte";    import { setExerciseContext } from "$lib/components/exercise/ctx.svelte";

    let {
        isOpened,
        exercise,
        isLocked,
        cooldownActive,
        onUpdateActivity,
        onStartCooldown,
    } = $props();

    // svelte-ignore state_referenced_locally
    const ctx = setExerciseContext({
        isOpened,
        exercise,
        isLocked,
        cooldownActive,
        onUpdateActivity,
        onStartCooldown,
    });

    // Reactively update context props
    $effect(() => {
        ctx.updateProps({
            isOpened,
            exercise,
            isLocked,
            cooldownActive,
            onUpdateActivity,
            onStartCooldown,
        });
    });
</script>

{#if ctx.isFullScreen}
    <FocusMode />
{/if}

<Accordion.Item
    value={exercise.id.toString()}
    disabled={isLocked || (ctx.status === "PENDING" && cooldownActive)}
>
    <Accordion.Trigger class="hover:no-underline">
        <ExerciseHeader />
    </Accordion.Trigger>
    <Accordion.Content>
        <ExerciseContent />

        <!-- Actions -->
        <div class="mt-4">
            <ExerciseControls />
        </div>
    </Accordion.Content>
</Accordion.Item>

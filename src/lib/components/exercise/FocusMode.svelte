<script lang="ts">
    import { scale } from "svelte/transition";
    import ExerciseContent from "./ExerciseContent.svelte";
    import ExerciseControls from "./ExerciseControls.svelte";
    import { useExercise } from "./ctx.svelte";

    const ctx = useExercise();
</script>

<div
    class="fixed inset-0 z-50 bg-background flex flex-col"
    in:scale={{ duration: 300, start: 0.95, opacity: 0 }}
    out:scale={{ duration: 200, start: 0.95, opacity: 0 }}
>
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b">
        <h2 class="text-2xl font-bold">{ctx.exercise.name}</h2>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <ExerciseContent instructionsOpen={true} />
    </div>

    <!-- Footer Controls -->
    <div class="p-6 border-t bg-card pb-safe space-y-2">
        <ExerciseControls />
    </div>
</div>

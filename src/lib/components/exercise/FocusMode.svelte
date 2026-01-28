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
    <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-xl font-bold px-2">{ctx.exercise.name}</h2>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
        <ExerciseContent instructionsOpen={true} />
    </div>

    <!-- Footer Controls -->
    <div class="p-4 border-t bg-card pb-8">
        <ExerciseControls />
    </div>
</div>

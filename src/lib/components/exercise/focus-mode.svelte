<script lang="ts">
  import { scale } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import XIcon from "@lucide/svelte/icons/x";
  import SkipForwardIcon from "@lucide/svelte/icons/skip-forward";
  import ExerciseContent from "./exercise-content.svelte";
  import FocusModeControls from "./focus-mode-controls.svelte";
  import { useExercise } from "./ctx.svelte";

  const ctx = useExercise();
  let showSkipDialog = $state(false);

  function handleSkip() {
    ctx.handleUpdateActivity(ctx.exercise.id, "SKIPPED", ctx.activity?.id);
    showSkipDialog = false;
  }
</script>

<div
  class="fixed inset-0 z-50 bg-background flex flex-col"
  in:scale={{ duration: 300, start: 0.95, opacity: 0 }}
  out:scale={{ duration: 200, start: 0.95, opacity: 0 }}
>
  <!-- Header -->
  <div class="flex items-center justify-between p-6 border-b">
    <div class="flex items-center gap-3 flex-1">
      <Button
        class="px-0!"
        variant="ghost"
        onclick={() => ctx.closeFullscreen()}
      >
        <XIcon class="size-5" />
      </Button>
      <h2 class="text-xl font-bold truncate">{ctx.exercise.name}</h2>
    </div>

    <!-- Skip Button in Header -->
    <AlertDialog.Root
      open={showSkipDialog}
      onOpenChange={(e) => (showSkipDialog = e)}
    >
      <AlertDialog.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="outline"
            size="sm"
            class="gap-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
          >
            <SkipForwardIcon class="h-4 w-4" />
            Skip
          </Button>
        {/snippet}
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Skip Exercise</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to skip "{ctx.exercise.name}"? This exercise
            will be marked as skipped.
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
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto p-6 space-y-6">
    <ExerciseContent instructionsOpen={true} />
  </div>

  <!-- Footer Controls -->
  <div class="p-6 border-t bg-card pb-safe space-y-2">
    <FocusModeControls />
  </div>
</div>

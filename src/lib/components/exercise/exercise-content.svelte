<script lang="ts">
  import { slide } from "svelte/transition";

  import { Button } from "$lib/components/ui/button";
  import * as Collapsible from "$lib/components/ui/collapsible";

  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import TargetIcon from "@lucide/svelte/icons/target";
  import DumbbellIcon from "@lucide/svelte/icons/dumbbell";
  import YoutubeIcon from "@lucide/svelte/icons/youtube";

  import { useExercise } from "./ctx.svelte";

  let { instructionsOpen = false } = $props();
  const ctx = useExercise();
</script>

<div class="space-y-4 pt-2">
  <!-- Key Principles -->
  {#if ctx.detail?.key_principles && ctx.initialized}
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <TargetIcon class="h-4 w-4 text-primary" />
        <h3 class="text-sm font-semibold">Key Principles</h3>
      </div>
      <p class="text-sm text-muted-foreground pl-6 bg-primary/5 p-3 rounded-md">
        {ctx.detail.key_principles}
      </p>
    </div>
  {/if}

  <!-- Technical Checkpoints -->
  {#if ctx.detail?.key_technical_checkpoints && ctx.initialized}
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <DumbbellIcon class="h-4 w-4 text-primary" />
        <h3 class="text-sm font-semibold">Technical Checkpoints</h3>
      </div>
      <p
        class="text-sm text-muted-foreground pl-6 bg-orange-500/5 p-3 rounded-md"
      >
        {ctx.detail.key_technical_checkpoints}
      </p>
    </div>
  {/if}

  <!-- YouTube Video -->
  {#if ctx.detail?.tutor_video && ctx.initialized}
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <YoutubeIcon class="h-4 w-4 text-red-500" />
        <h3 class="text-sm font-semibold">Video Tutorial</h3>
      </div>
      <div
        class="aspect-video w-full rounded-md overflow-hidden border border-border"
      >
        <iframe
          width="100%"
          height="100%"
          src={ctx.detail.tutor_video}
          title="YouTube video player for {ctx.exercise.name}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  {/if}

  <!-- Instructions (Collapsible) -->
  {#if ctx.detail?.instructions && ctx.initialized}
    <Collapsible.Root class="w-full" bind:open={instructionsOpen}>
      <Collapsible.Trigger
        class="flex items-center justify-between w-full py-2"
      >
        <span class="text-sm font-semibold">Instructions</span>
        <Button variant="ghost" size="sm" class="w-9 p-0">
          <ChevronDownIcon
            class="h-4 w-4 transition-transform {instructionsOpen
              ? 'rotate-180'
              : ''}"
          />
          <span class="sr-only">Toggle instructions</span>
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        {#if instructionsOpen}
          <div transition:slide={{ duration: 300 }}>
            <ol class="space-y-2 pl-6 text-sm text-muted-foreground">
              {#each ctx.detail.instructions as instruction (instruction)}
                <li class="list-decimal">
                  {instruction}
                </li>
              {/each}
            </ol>
          </div>
        {/if}
      </Collapsible.Content>
    </Collapsible.Root>
  {/if}
</div>

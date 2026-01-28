<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Collapsible from "$lib/components/ui/collapsible";
    import { ChevronDown } from "@lucide/svelte";

    let {
        detail,
        exercise,
        initialized = true,
        instructionsOpen = false,
    } = $props();
</script>

<div class="space-y-4 pt-2">
    {#if detail?.youtube_tutor_video && initialized}
        <div class="aspect-video w-full rounded-md overflow-hidden bg-gray-500">
            <iframe
                width="100%"
                height="100%"
                src={detail.youtube_tutor_video}
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
        <Collapsible.Root class="w-full" open={instructionsOpen}>
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
</div>

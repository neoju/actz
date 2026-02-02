<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Sparkles, ArrowRight, Calendar } from "@lucide/svelte";

  let { data } = $props();
  let hasActivePlan = $derived(data.hasActivePlan);
</script>

<div class="space-y-6 pb-8">
  <!-- Welcome Greeting -->
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
      <div class="bg-primary/10 p-6 rounded-full">
          <Sparkles class="w-12 h-12 text-primary" />
      </div>
      
      <div class="space-y-2 max-w-md">
          <h1 class="text-3xl font-bold tracking-tight">Welcome to Action Z!</h1>
          <p class="text-muted-foreground text-lg">
              Your journey to a better you starts here. 
          </p>
      </div>

      <div class="flex flex-col gap-4 w-full max-w-xs">
          {#if hasActivePlan}
            <Button href="/planned-exercises" size="lg" class="w-full gap-2 text-lg h-14">
                View My Plan
                <Calendar class="w-5 h-5" />
            </Button>
          {:else}
            <Button href="/settings" variant="default" size="lg" class="w-full gap-2 h-14 text-lg">
                Generate a Plan
                <ArrowRight class="w-5 h-5" />
            </Button>
          {/if}
          
          <Button href="/exercises" variant="outline" size="lg" class="w-full gap-2">
              Explore Exercises
          </Button>
      </div>
  </div>
</div>
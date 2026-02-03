<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Sparkles, ArrowRight, Calendar } from "@lucide/svelte";
  import "$lib/assets/css/dashboard.css";

  let { data } = $props();
  let hasActivePlan = $derived(data.hasActivePlan);
</script>

<div class="dashboard-container">
  <!-- Welcome Greeting -->
  <div class="welcome-section">
    <div class="welcome-icon-wrapper">
      <Sparkles class="welcome-icon" />
    </div>

    <div class="welcome-text-container">
      <h1 class="welcome-title">Welcome to Action Z!</h1>
      <p class="welcome-desc">
        Your journey to a better you starts here.
      </p>
    </div>

    <div class="action-buttons">
      {#if hasActivePlan}
        <Button
          href="/planned-exercises"
          size="lg"
          class="primary-action-btn"
        >
          View My Plan
          <Calendar class="btn-icon" />
        </Button>
      {:else}
        <Button
          href="/settings"
          variant="default"
          size="lg"
          class="primary-action-btn"
        >
          Generate a Plan
          <ArrowRight class="btn-icon" />
        </Button>
      {/if}

      <Button
        href="/exercises"
        variant="outline"
        size="lg"
        class="secondary-action-btn"
      >
        Explore Exercises
      </Button>
    </div>
  </div>
</div>


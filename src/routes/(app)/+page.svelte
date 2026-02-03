<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Sparkles, ArrowRight, Calendar } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
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
      <h1 class="welcome-title">{m.common_welcome()}</h1>
      <p class="welcome-desc">
        {m.common_welcomeDesc()}
      </p>
    </div>

    <div class="action-buttons">
      {#if hasActivePlan}
        <Button
          href="/planned-exercises"
          size="lg"
          class="primary-action-btn"
        >
          {m.dashboard_viewPlan()}
          <Calendar class="btn-icon" />
        </Button>
      {:else}
        <Button
          href="/settings"
          variant="default"
          size="lg"
          class="primary-action-btn"
        >
          {m.dashboard_generatePlan()}
          <ArrowRight class="btn-icon" />
        </Button>
      {/if}

      <Button
        href="/exercises"
        variant="outline"
        size="lg"
        class="secondary-action-btn"
      >
        {m.dashboard_browseExercises()}
      </Button>
    </div>
  </div>
</div>


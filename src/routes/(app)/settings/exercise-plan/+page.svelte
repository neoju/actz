<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import { RefreshCw } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as m from "$lib/paraglide/messages.js";
  import { useGenerateWeeklyPlanMutation } from "$lib/queries/weekly-plan";
  import { useGenerateMonthlyPlanMutation } from "$lib/queries/monthly-plan";

  import "$lib/assets/css/settings.css";

  let { data } = $props();

  const generateWeeklyPlanMutation = useGenerateWeeklyPlanMutation();
  const generateMonthlyPlanMutation = useGenerateMonthlyPlanMutation();

  let isRefreshingLimit = $state(false);
  let generatingPlan = $state<"week" | "month" | null>(null);

  async function refreshPlanLimit() {
    try {
      isRefreshingLimit = true;
      await invalidate("app:planLimit");
      toast.success(m.toast_usageLimitRefreshed());
    } finally {
      isRefreshingLimit = false;
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  async function handleRegeneratePlan(duration: "week" | "month") {
    try {
      generatingPlan = duration;
      if (duration === "week") {
        await generateWeeklyPlanMutation.mutateAsync();
        await invalidate("app:planLimit");
        toast.success(m.toast_weeklyPlanGenerated(), {
          description: m.toast_planGeneratedDesc(),
          duration: 2000,
          onAutoClose: () => {
            goto("/");
          },
        });
      } else {
        await generateMonthlyPlanMutation.mutateAsync();
        await invalidate("app:planLimit");
        toast.success(m.toast_monthlyPlanGenerated(), {
          description: m.toast_planGeneratedDesc(),
          duration: 2000,
          onAutoClose: () => {
            goto("/");
          },
        });
      }
    } catch (error: any) {
      console.error("Error regenerating plan:", error);
      const planType = duration === "week" ? "weekly" : "monthly";

      const errorMessage =
        error instanceof Error
          ? error.message
          : m.toast_profileUpdateFailedDesc();

      toast.error(m.toast_planGenerationFailed({ type: planType }), {
        description: errorMessage,
      });
    } finally {
      generatingPlan = null;
    }
  }
</script>

<div class="settings-container">
  <div class="settings-header">
    <h1 class="settings-title">{m.exercisePlan_title()}</h1>
  </div>

  {#if data.planLimit}
    <div class="plan-limit-container">
      <div class="plan-limit-header">
        <span class="plan-limit-label">{m.exercisePlan_weeklyGenerations()}</span>
        <div class="plan-limit-stats">
          <span class="plan-limit-value"
            >{data.planLimit.used} / {data.planLimit.max}</span
          >
          <Button
            variant="ghost"
            size="icon"
            class="refresh-btn"
            onclick={refreshPlanLimit}
            disabled={isRefreshingLimit}
            title={m.action_refresh()}
          >
            <RefreshCw
              class="refresh-icon {isRefreshingLimit ? 'animate-spin' : ''}"
            />
          </Button>
        </div>
      </div>
      <div class="progress-bar-bg">
        <div
          class="progress-bar-fill"
          style="width: {(data.planLimit.used / data.planLimit.max) * 100}%"
        ></div>
      </div>
      {#if data.planLimit.resetAt}
        <p class="reset-date">
          {m.exercisePlan_nextReset({ date: formatDate(data.planLimit.resetAt) })}
        </p>
      {/if}
    </div>
  {/if}

  <div class="plans-grid">
    <Card.Root>
      <Card.Header>
        <Card.Title>{m.exercisePlan_weekly()}</Card.Title>
        <Card.Description>
          {m.exercisePlan_weeklyDesc()}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Button
          variant="secondary"
          class="plan-generate-btn"
          disabled={generatingPlan !== null ||
            data.planLimit?.remaining === 0}
          onclick={() => handleRegeneratePlan("week")}
        >
          {#if generatingPlan === "week"}
            <RefreshCw class="btn-icon animate-spin" />
            {m.action_generating()}
          {:else}
            <RefreshCw class="btn-icon" />
            {m.exercisePlan_generateWeekly()}
          {/if}
        </Button>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header>
        <Card.Title>{m.exercisePlan_monthly()}</Card.Title>
        <Card.Description>
          {m.exercisePlan_monthlyDesc()}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Button
          class="plan-generate-btn"
          disabled={generatingPlan !== null ||
            data.planLimit?.remaining === 0}
          onclick={() => handleRegeneratePlan("month")}
        >
          {#if generatingPlan === "month"}
            <RefreshCw class="btn-icon animate-spin" />
            {m.action_generating()}
          {:else}
            <RefreshCw class="btn-icon" />
            {m.exercisePlan_generateMonthly()}
          {/if}
        </Button>
      </Card.Content>
    </Card.Root>
  </div>
</div>

<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    FormInput,
    FormSelect,
    FormMultiSelect,
  } from "$lib/components/ui/form";
  import * as Card from "$lib/components/ui/card";
  import { goto } from "$app/navigation";
  import { Check, CalendarRange, CalendarDays } from "@lucide/svelte";
  import {
    getProfileSchema,
    getEquipmentOptions,
    getGenderOptions,
    getFitnessLevelOptions,
    getTargetOptions,
    getLimitationOptions,
    getMuscleOptions,
    createInitialProfileData,
  } from "$lib/schemas/profile";
  import { useUpdateProfileMutation } from "$lib/queries/profile";
  import { useGenerateWeeklyPlanMutation } from "$lib/queries/weekly-plan";
  import { useGenerateMonthlyPlanMutation } from "$lib/queries/monthly-plan";
  import "$lib/assets/css/setup.css";
  import * as m from "$lib/paraglide/messages.js";

  // Use TanStack Query mutations
  const updateProfileMutation = useUpdateProfileMutation();
  const generateWeeklyPlanMutation = useGenerateWeeklyPlanMutation();
  const generateMonthlyPlanMutation = useGenerateMonthlyPlanMutation();

  let profileData = $state(createInitialProfileData());
  let step = $state<"profile" | "selection">("profile");
  let loadingStep = $state<"profile" | "plan" | null>(null);
  let selectingPlan = $state<"week" | "month" | null>(null);
  let errors: Record<string, string[] | undefined> = $state({});

  // Derive loading state
  let isLoading = $derived(
    updateProfileMutation.isPending ||
      generateWeeklyPlanMutation.isPending ||
      generateMonthlyPlanMutation.isPending,
  );

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errors = {};

    const result = getProfileSchema().safeParse(profileData);

    if (!result.success) {
      errors = result.error.flatten().fieldErrors;
      return;
    }

    try {
      // Step 1: Update user profile
      loadingStep = "profile";
      await updateProfileMutation.mutateAsync(result.data);

      // Advance to selection step
      step = "selection";
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      loadingStep = null;
    }
  }

  async function handleGeneratePlan(type: "week" | "month") {
    try {
      selectingPlan = type;
      loadingStep = "plan";

      if (type === "week") {
        await generateWeeklyPlanMutation.mutateAsync();
      } else {
        await generateMonthlyPlanMutation.mutateAsync();
      }

      goto("/");
    } catch (error) {
      console.error(`Error generating ${type} plan:`, error);
    } finally {
      loadingStep = null;
      selectingPlan = null;
    }
  }
</script>

<div class="setup-container">
  <div class="setup-header">
    {#if step === "profile"}
      <h1 class="setup-title">{m.setup_step1_title()}</h1>
      <p class="setup-desc">
        {m.setup_step1_desc()}
      </p>
    {:else}
      <h1 class="setup-title">{m.setup_step2_title()}</h1>
      <p class="setup-desc">
        {m.setup_step2_desc()}
      </p>
    {/if}
  </div>

  {#if step === "profile"}
    <form onsubmit={handleSubmit} class="setup-form">
      <fieldset disabled={isLoading} class="form-fieldset">
        <div class="form-grid-2">
          <FormInput
            id="age"
            label={m.profile_age()}
            type="number"
            placeholder={m.setup_placeholder_age()}
            bind:value={profileData.age}
            error={errors.age?.[0]}
          />
          <FormSelect
            label={m.profile_gender()}
            options={getGenderOptions()}
            bind:value={profileData.gender}
            error={errors.gender?.[0]}
          />
        </div>

        <div class="form-grid-2">
          <FormInput
            id="weight"
            label={m.profile_weight()}
            type="number"
            placeholder={m.setup_placeholder_weight()}
            bind:value={profileData.weight}
            error={errors.weight?.[0]}
          />
          <FormInput
            id="height"
            label={m.profile_height()}
            type="number"
            placeholder={m.setup_placeholder_height()}
            bind:value={profileData.height}
            error={errors.height?.[0]}
          />
        </div>

        <div class="form-grid-2">
          <FormSelect
            label={m.profile_fitnessLevel()}
            options={getFitnessLevelOptions()}
            bind:value={profileData.fitnessLevel}
            placeholder={m.setup_placeholder_selectLevel()}
            error={errors.fitnessLevel?.[0]}
          />

          <FormSelect
            label={m.profile_equipment()}
            options={getEquipmentOptions()}
            bind:value={profileData.equipment}
            placeholder={m.setup_placeholder_selectEquipment()}
            error={errors.equipment?.[0]}
          />
        </div>

        <FormInput
          id="schedule"
          label={m.profile_schedule()}
          placeholder={m.setup_placeholder_schedule()}
          bind:value={profileData.schedule}
          error={errors.schedule?.[0]}
        />

        <FormMultiSelect
          id="limitations"
          label={m.profile_limitations()}
          options={getLimitationOptions()}
          bind:value={profileData.limitations}
          placeholder={m.setup_placeholder_selectLimitations()}
          error={errors.limitations?.[0]}
        />

        <FormMultiSelect
          id="target"
          label={m.profile_target()}
          options={getTargetOptions()}
          bind:value={profileData.target}
          placeholder={m.setup_placeholder_selectGoals()}
          error={errors.target?.[0]}
          max={3}
        />

        <div class="form-grid-2">
          <FormSelect
            label={m.profile_primaryFocus()}
            options={getMuscleOptions()}
            bind:value={profileData.primaryFocus}
            placeholder={m.setup_placeholder_selectMuscle()}
            error={errors.primaryFocus?.[0]}
          />

          <FormSelect
            label={m.profile_secondaryFocus()}
            options={getMuscleOptions()}
            bind:value={profileData.secondaryFocus}
            placeholder={m.setup_placeholder_selectMuscle()}
            error={errors.secondaryFocus?.[0]}
          />
        </div>

        <Button
          type="submit"
          class="submit-btn"
          disabled={isLoading}
        >
          {#if isLoading && loadingStep === "profile"}
            {m.setup_button_updatingProfile()}
          {:else}
            {m.setup_button_next()}
          {/if}
        </Button>

        <div class="skip-container">
          <button
            type="button"
            class="skip-btn"
            onclick={() => {
              if (confirm(m.setup_confirm_skipProfile())) {
                goto("/");
              }
            }}
          >
            {m.setup_button_skipNow()}
          </button>
        </div>
      </fieldset>
    </form>
  {:else}
    <div class="plans-selection-grid">
      <!-- Monthly Plan Option (Recommended) -->
      <button
        class="plan-option-btn"
        disabled={isLoading}
        onclick={() => handleGeneratePlan("month")}
      >
        <Card.Root
          class="plan-card plan-card-wrapper {selectingPlan ===
          'month'
            ? 'plan-card-selected'
            : 'plan-card-default'}"
        >
          <div
            class="recommended-badge"
          >
            {m.setup_badge_recommended()}
          </div>
          <Card.Header>
            <div class="card-header-flex">
              <div class="icon-wrapper-primary">
                <CalendarRange class="plan-icon" />
              </div>
              <Card.Title>{m.setup_monthlyPlan_title()}</Card.Title>
            </div>
            <Card.Description>
              {m.setup_monthlyPlan_desc()}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <ul class="features-list">
              <li class="feature-item">
                <Check class="check-icon" />
                {m.setup_monthlyPlan_feature1()}
              </li>
              <li class="feature-item">
                <Check class="check-icon" />
                {m.setup_monthlyPlan_feature2()}
              </li>
              <li class="feature-item">
                <Check class="check-icon" />
                {m.setup_monthlyPlan_feature3()}
              </li>
            </ul>
            <Button class="select-plan-btn" variant="default" disabled={isLoading}>
              {#if selectingPlan === "month"}
                {m.setup_monthlyPlan_generating()}
              {:else}
                {m.setup_monthlyPlan_button()}
              {/if}
            </Button>
          </Card.Content>
        </Card.Root>
      </button>

      <!-- Weekly Plan Option -->
      <button
        class="plan-option-btn"
        disabled={isLoading}
        onclick={() => handleGeneratePlan("week")}
      >
        <Card.Root
          class="plan-card {selectingPlan ===
          'week'
            ? 'plan-card-selected'
            : 'plan-card-default'}"
        >
          <Card.Header>
            <div class="card-header-flex">
              <div
                class="icon-wrapper-secondary"
              >
                <CalendarDays class="plan-icon" />
              </div>
              <Card.Title>{m.setup_weeklyPlan_title()}</Card.Title>
            </div>
            <Card.Description>
              {m.setup_weeklyPlan_desc()}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <ul class="features-list">
              <li class="feature-item">
                <Check class="check-icon" />
                {m.setup_weeklyPlan_feature1()}
              </li>
              <li class="feature-item">
                <Check class="check-icon" />
                {m.setup_weeklyPlan_feature2()}
              </li>
              <li class="feature-item">
                <Check class="check-icon" />
                {m.setup_weeklyPlan_feature3()}
              </li>
            </ul>
            <Button
              class="select-plan-btn"
              variant="secondary"
              disabled={isLoading}
            >
              {#if selectingPlan === "week"}
                {m.setup_weeklyPlan_generating()}
              {:else}
                {m.setup_weeklyPlan_button()}
              {/if}
            </Button>
          </Card.Content>
        </Card.Root>
      </button>
    </div>

    <div class="skip-plan-container">
      <button
        type="button"
        class="skip-btn"
        onclick={() => {
          if (confirm(m.setup_confirm_skipPlan())) {
            goto("/");
          }
        }}
      >
        {m.setup_button_skipPlan()}
      </button>
    </div>
  {/if}
</div>

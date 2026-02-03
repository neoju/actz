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
    profileSchema,
    equipmentOptions,
    genderOptions,
    fitnessLevelOptions,
    targetOptions,
    limitationOptions,
    muscleOptions,
    createInitialProfileData,
  } from "$lib/schemas/profile";
  import { useUpdateProfileMutation } from "$lib/queries/profile";
  import { useGenerateWeeklyPlanMutation } from "$lib/queries/weekly-plan";
  import { useGenerateMonthlyPlanMutation } from "$lib/queries/monthly-plan";
  import "$lib/assets/css/setup.css";

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

    const result = profileSchema.safeParse(profileData);

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
      <h1 class="setup-title">Tell us about you</h1>
      <p class="setup-desc">
        We need some info to create your personalized plan.
      </p>
    {:else}
      <h1 class="setup-title">Choose your path</h1>
      <p class="setup-desc">
        How would you like to start your fitness journey?
      </p>
    {/if}
  </div>

  {#if step === "profile"}
    <form onsubmit={handleSubmit} class="setup-form">
      <fieldset disabled={isLoading} class="form-fieldset">
        <div class="form-grid-2">
          <FormInput
            id="age"
            label="Age"
            type="number"
            placeholder="25"
            bind:value={profileData.age}
            error={errors.age?.[0]}
          />
          <FormSelect
            label="Gender"
            options={genderOptions}
            bind:value={profileData.gender}
            error={errors.gender?.[0]}
          />
        </div>

        <div class="form-grid-2">
          <FormInput
            id="weight"
            label="Weight (kg)"
            type="number"
            placeholder="70"
            bind:value={profileData.weight}
            error={errors.weight?.[0]}
          />
          <FormInput
            id="height"
            label="Height (cm)"
            type="number"
            placeholder="175"
            bind:value={profileData.height}
            error={errors.height?.[0]}
          />
        </div>

        <div class="form-grid-2">
          <FormSelect
            label="Fitness Level"
            options={fitnessLevelOptions}
            bind:value={profileData.fitnessLevel}
            placeholder="Select Level"
            error={errors.fitnessLevel?.[0]}
          />

          <FormSelect
            label="Equipment"
            options={equipmentOptions}
            bind:value={profileData.equipment}
            placeholder="Select Equipment"
            error={errors.equipment?.[0]}
          />
        </div>

        <FormInput
          id="schedule"
          label="Schedule"
          placeholder="30 mins/day, 3 days/week"
          bind:value={profileData.schedule}
          error={errors.schedule?.[0]}
        />

        <FormMultiSelect
          id="limitations"
          label="Limitations"
          options={limitationOptions}
          bind:value={profileData.limitations}
          placeholder="Select Limitations"
          error={errors.limitations?.[0]}
        />

        <FormMultiSelect
          id="target"
          label="Goal / Target"
          options={targetOptions}
          bind:value={profileData.target}
          placeholder="Select Goals"
          error={errors.target?.[0]}
          max={3}
        />

        <div class="form-grid-2">
          <FormSelect
            label="Primary Focus"
            options={muscleOptions}
            bind:value={profileData.primaryFocus}
            placeholder="Select Muscle"
            error={errors.primaryFocus?.[0]}
          />

          <FormSelect
            label="Secondary Focus"
            options={muscleOptions}
            bind:value={profileData.secondaryFocus}
            placeholder="Select Muscle"
            error={errors.secondaryFocus?.[0]}
          />
        </div>

        <Button
          type="submit"
          class="submit-btn"
          disabled={isLoading}
        >
          {#if isLoading && loadingStep === "profile"}
            Updating Profile...
          {:else}
            Next
          {/if}
        </Button>

        <div class="skip-container">
          <button
            type="button"
            class="skip-btn"
            onclick={() => {
              if (
                confirm(
                  "Are you sure you want to skip? You can update your profile and generate a plan later in Settings.",
                )
              ) {
                goto("/");
              }
            }}
          >
            Skip for now
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
            RECOMMENDED
          </div>
          <Card.Header>
            <div class="card-header-flex">
              <div class="icon-wrapper-primary">
                <CalendarRange class="plan-icon" />
              </div>
              <Card.Title>Monthly Plan</Card.Title>
            </div>
            <Card.Description>
              A comprehensive 4-week progression designed to build habits.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <ul class="features-list">
              <li class="feature-item">
                <Check class="check-icon" />
                4-Week Periodization
              </li>
              <li class="feature-item">
                <Check class="check-icon" />
                Progressive Overload
              </li>
              <li class="feature-item">
                <Check class="check-icon" />
                Built-in Deload Week
              </li>
            </ul>
            <Button class="select-plan-btn" variant="default" disabled={isLoading}>
              {#if selectingPlan === "month"}
                Generating Month...
              {:else}
                Start 4-Week Journey
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
              <Card.Title>Weekly Plan</Card.Title>
            </div>
            <Card.Description>
              Focus on one week at a time. Ideal for flexibility.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <ul class="features-list">
              <li class="feature-item">
                <Check class="check-icon" />
                7-Day Schedule
              </li>
              <li class="feature-item">
                <Check class="check-icon" />
                Quick Start
              </li>
              <li class="feature-item">
                <Check class="check-icon" />
                Flexible Commitment
              </li>
            </ul>
            <Button
              class="select-plan-btn"
              variant="secondary"
              disabled={isLoading}
            >
              {#if selectingPlan === "week"}
                Generating Week...
              {:else}
                Start 1-Week Plan
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
          if (
            confirm(
              "Are you sure you want to skip? You can generate a plan later in Settings.",
            )
          ) {
            goto("/");
          }
        }}
      >
        Skip plan generation for now
      </button>
    </div>
  {/if}
</div>

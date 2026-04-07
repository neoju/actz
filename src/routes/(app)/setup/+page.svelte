<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount, tick } from "svelte";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import {
    FormInput,
    FormSelect,
    FormMultiSelect,
  } from "$lib/components/ui/form";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import { goto } from "$app/navigation";
  import { Check, CalendarRange, CalendarDays } from "@lucide/svelte";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import {
    getProfileSchema,
    getEquipmentOptions,
    getGenderOptions,
    getFitnessLevelOptions,
    getTargetOptions,
    getLimitationOptions,
    getMuscleOptions,
    getReminderTimeOptions,
    createInitialProfileData,
  } from "$lib/schemas/profile";
  import {
    useUpdateProfileMutation,
    useApplySampleProfileMutation,
  } from "$lib/queries/profile";
  import { useGenerateWeeklyPlanMutation } from "$lib/queries/weekly-plan";
  import { useGenerateMonthlyPlanMutation } from "$lib/queries/monthly-plan";
  import "$lib/assets/css/setup.css";
  import * as m from "$lib/paraglide/messages.js";

  // Use TanStack Query mutations
  const updateProfileMutation = useUpdateProfileMutation();
  const applySampleProfileMutation = useApplySampleProfileMutation();
  const generateWeeklyPlanMutation = useGenerateWeeklyPlanMutation();
  const generateMonthlyPlanMutation = useGenerateMonthlyPlanMutation();

  let profileData = $state(createInitialProfileData());
  let step = $state<"profile" | "selection">("profile");
  let loadingStep = $state<"profile" | "plan" | null>(null);
  /** Which profile save path is active — avoids reading mutation `isPending` in markup (SSR/client mismatch). */
  let profileSaveKind = $state<"form" | "sample" | null>(null);
  let selectingPlan = $state<"week" | "month" | null>(null);
  let errors: Record<string, string[] | undefined> = $state({});
  let formLevelErrors = $state<string[]>([]);

  let sampleDialogOpen = $state(false);
  let sampleDialogFlyOut = $state(false);
  let iconBouncing = $state(false);
  let sampleIconBtnEl = $state<HTMLButtonElement | null>(null);
  let dialogPanelRef = $state<HTMLDivElement | null>(null);

  /** Local busy flags only — set before the first `await` so server and hydration match. */
  let isBusy = $derived(
    loadingStep !== null || selectingPlan !== null,
  );

  function prefersReducedMotion(): boolean {
    return (
      browser &&
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function triggerIconBounce() {
    iconBouncing = true;
    setTimeout(() => {
      iconBouncing = false;
    }, 1000);
  }

  function openSampleDialog() {
    sampleDialogFlyOut = false;
    sampleDialogOpen = true;
  }

  function dismissSampleDialogWithFly() {
    if (!browser || sampleDialogFlyOut) return;
    if (prefersReducedMotion() || !sampleIconBtnEl || !dialogPanelRef) {
      sampleDialogOpen = false;
      triggerIconBounce();
      return;
    }
    const ir = sampleIconBtnEl.getBoundingClientRect();
    const pr = dialogPanelRef.getBoundingClientRect();
    const dx = ir.left + ir.width / 2 - (pr.left + pr.width / 2);
    const dy = ir.top + ir.height / 2 - (pr.top + pr.height / 2);
    dialogPanelRef.style.setProperty("--fly-x", `${dx}px`);
    dialogPanelRef.style.setProperty("--fly-y", `${dy}px`);
    requestAnimationFrame(() => {
      sampleDialogFlyOut = true;
    });
  }

  function handleFlyOutTransitionEnd(e: TransitionEvent) {
    if (e.target !== e.currentTarget) return;
    if (!sampleDialogFlyOut || e.propertyName !== "transform") return;
    sampleDialogFlyOut = false;
    sampleDialogOpen = false;
    dialogPanelRef?.style.removeProperty("--fly-x");
    dialogPanelRef?.style.removeProperty("--fly-y");
    triggerIconBounce();
  }

  onMount(() => {
    if (!browser) return;
    sampleDialogOpen = true;
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    errors = {};
    formLevelErrors = [];

    const result = getProfileSchema().safeParse(profileData);

    if (!result.success) {
      const flat = result.error.flatten();
      errors = flat.fieldErrors;
      formLevelErrors = flat.formErrors;
      await tick();
      if (browser) {
        const firstInvalid = document.querySelector(
          ".setup-form .border-red-500",
        );
        firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    try {
      profileSaveKind = "form";
      loadingStep = "profile";
      await updateProfileMutation.mutateAsync(result.data);

      sampleDialogOpen = false;
      sampleDialogFlyOut = false;
      // Advance to selection step
      step = "selection";
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      profileSaveKind = null;
      loadingStep = null;
    }
  }

  async function handleUseSampleProfile() {
    errors = {};
    formLevelErrors = [];
    try {
      profileSaveKind = "sample";
      loadingStep = "profile";
      await applySampleProfileMutation.mutateAsync();
      sampleDialogOpen = false;
      sampleDialogFlyOut = false;
      step = "selection";
    } catch (error) {
      console.error("Error applying sample profile:", error);
    } finally {
      profileSaveKind = null;
      loadingStep = null;
    }
  }

  function planCardKeydown(
    e: KeyboardEvent,
    fn: () => void,
  ) {
    if (isBusy) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
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
      <h1 class="setup-title setup-title-with-icon">
        <span class="setup-title-text">{m.setup_step1_title()}</span>
        <button
          type="button"
          class={cn(
            "setup-sample-icon-btn",
            iconBouncing && "setup-sample-icon-btn--bouncing",
          )}
          aria-label={m.setup_sample_icon_aria()}
          aria-haspopup="dialog"
          aria-expanded={sampleDialogOpen}
          bind:this={sampleIconBtnEl}
          onclick={openSampleDialog}
        >
          <Sparkles class="size-5" aria-hidden="true" />
        </button>
      </h1>
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
    <Dialog.Root bind:open={sampleDialogOpen}>
      <Dialog.Content
        showCloseButton={false}
        class="max-w-[calc(100%-2rem)] border-0 bg-transparent p-0 shadow-none sm:max-w-md"
        onEscapeKeydown={(e) => {
          e.preventDefault();
          dismissSampleDialogWithFly();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
          dismissSampleDialogWithFly();
        }}
      >
        <div
          bind:this={dialogPanelRef}
          class={cn(
            "sample-dialog-panel rounded-lg border bg-background p-6 shadow-lg",
            sampleDialogFlyOut && "sample-dialog-panel--flying",
          )}
          ontransitionend={handleFlyOutTransitionEnd}
        >
          <Dialog.Header>
            <Dialog.Title>{m.setup_sample_dialog_title()}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Description class="text-muted-foreground text-sm leading-relaxed">
            {m.setup_sample_hint()}
          </Dialog.Description>
          <Dialog.Footer class="mt-4 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              class="w-full sm:w-auto"
              disabled={(isBusy && profileSaveKind === "sample") || sampleDialogFlyOut}
              onclick={dismissSampleDialogWithFly}
            >
              {m.action_cancel()}
            </Button>
            <Button
              type="button"
              class="w-full sm:w-auto"
              disabled={isBusy || sampleDialogFlyOut}
              onclick={() => void handleUseSampleProfile()}
            >
              {#if profileSaveKind === "sample" && isBusy}
                {m.setup_button_updatingProfile()}
              {:else}
                {m.setup_sample_button()}
              {/if}
            </Button>
          </Dialog.Footer>
        </div>
      </Dialog.Content>
    </Dialog.Root>

    <form onsubmit={handleSubmit} class="setup-form" novalidate>
      <fieldset disabled={isBusy} class="form-fieldset">
        {#if formLevelErrors.length > 0}
          <div
            class="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {#each formLevelErrors as msg}
              <p>{msg}</p>
            {/each}
          </div>
        {/if}
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
          label={m.profile_goalTarget()}
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

        <div class="form-grid-2">
          <FormInput
            id="preferredWorkoutTime"
            label={m.profile_workoutTime()}
            type="time"
            placeholder={m.profile_placeholder_workoutTime()}
            bind:value={profileData.preferredWorkoutTime}
            error={errors.preferredWorkoutTime?.[0]}
          />

          <FormSelect
            label={m.profile_reminderTime()}
            options={getReminderTimeOptions()}
            bind:value={profileData.reminderMinutesBefore}
            placeholder="Select reminder time"
            error={errors.reminderMinutesBefore?.[0]}
          />
        </div>

        <Button type="submit" class="submit-btn" disabled={isBusy}>
          {#if profileSaveKind === "form"}
            {m.setup_button_updatingProfile()}
          {:else}
            {m.setup_button_next()}
          {/if}
        </Button>
      </fieldset>
    </form>
  {:else}
    <div class="plans-selection-grid">
      <!-- Monthly: single focus target — never nest <button> inside <button> (breaks hydration). -->
      <div
        class="plan-option-btn"
        role="button"
        tabindex={isBusy ? -1 : 0}
        aria-disabled={isBusy}
        aria-busy={selectingPlan === "month"}
        class:opacity-50={isBusy}
        class:pointer-events-none={isBusy}
        onclick={() => handleGeneratePlan("month")}
        onkeydown={(e) =>
          planCardKeydown(e, () => handleGeneratePlan("month"))}
      >
        <Card.Root
          class="plan-card plan-card-wrapper {selectingPlan === 'month'
            ? 'plan-card-selected'
            : 'plan-card-default'}"
        >
          <div class="recommended-badge">
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
            <div
              class={cn(
                buttonVariants({ variant: "default" }),
                "select-plan-btn pointer-events-none",
              )}
            >
              {#if selectingPlan === "month"}
                {m.setup_monthlyPlan_generating()}
              {:else}
                {m.setup_monthlyPlan_button()}
              {/if}
            </div>
          </Card.Content>
        </Card.Root>
      </div>

      <div
        class="plan-option-btn"
        role="button"
        tabindex={isBusy ? -1 : 0}
        aria-disabled={isBusy}
        aria-busy={selectingPlan === "week"}
        class:opacity-50={isBusy}
        class:pointer-events-none={isBusy}
        onclick={() => handleGeneratePlan("week")}
        onkeydown={(e) => planCardKeydown(e, () => handleGeneratePlan("week"))}
      >
        <Card.Root
          class="plan-card {selectingPlan === 'week'
            ? 'plan-card-selected'
            : 'plan-card-default'}"
        >
          <Card.Header>
            <div class="card-header-flex">
              <div class="icon-wrapper-secondary">
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
            <div
              class={cn(
                buttonVariants({ variant: "secondary" }),
                "select-plan-btn pointer-events-none",
              )}
            >
              {#if selectingPlan === "week"}
                {m.setup_weeklyPlan_generating()}
              {:else}
                {m.setup_weeklyPlan_button()}
              {/if}
            </div>
          </Card.Content>
        </Card.Root>
      </div>
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

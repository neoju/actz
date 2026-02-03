<script lang="ts">
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";
  import {
    FormInput,
    FormSelect,
    FormMultiSelect,
  } from "$lib/components/ui/form";
  import * as m from "$lib/paraglide/messages.js";

  import {
    profileSchema,
    equipmentOptions,
    genderOptions,
    fitnessLevelOptions,
    targetOptions,
    limitationOptions,
    muscleOptions,
    reminderTimeOptions,
    createInitialProfileData,
  } from "$lib/schemas/profile";
  import {
    useProfileQuery,
    useUpdateProfileMutation,
  } from "$lib/queries/profile";

  import "$lib/assets/css/settings.css";

  // Use TanStack Query
  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  let profileData = $state(createInitialProfileData());
  let isEditing = $state(false);
  let errors: Record<string, string[] | undefined> = $state({});

  // Update profileData when query data changes
  $effect(() => {
    if (profileQuery.data) {
      const user = (profileQuery.data as any).user;
      profileData = {
        age: user.age?.toString() || "",
        gender: user.gender || "",
        weight: user.weight?.toString() || "",
        height: user.height?.toString() || "",
        bmi: user.bmi || "",
        fitnessLevel: user.fitnessLevel || "",
        equipment: user.equipment || "",
        schedule: user.schedule || "",
        limitations: user.limitations ? user.limitations.split(",") : [],
        target: user.target ? user.target.split(",") : [],
        primaryFocus: user.primaryFocus || "",
        secondaryFocus: user.secondaryFocus || "",
        preferredWorkoutTime: user.preferredWorkoutTime || "",
        reminderMinutesBefore: user.reminderMinutesBefore?.toString() || "30",
        notificationsEnabled: user.notificationsEnabled || false,
      };
    }
  });

  async function handleUpdateProfile(e: Event) {
    e.preventDefault();
    errors = {};

    const result = profileSchema.safeParse(profileData);

    if (!result.success) {
      errors = result.error.flatten().fieldErrors;
      toast.error(m.toast_validationFailed(), {
        description: m.toast_validationFailedDesc(),
      });
      return;
    }

    try {
      const data = await updateProfileMutation.mutateAsync(result.data);
      profileData.bmi = (data as any).user.bmi || "";
      isEditing = false;
      toast.success(m.toast_profileUpdated(), {
        description: m.toast_profileUpdatedDesc(),
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(m.toast_profileUpdateFailed(), {
        description: m.toast_profileUpdateFailedDesc(),
      });
    }
  }
</script>

<div class="settings-container">
  <div class="settings-header">
    <h1 class="settings-title">{m.profile_title()}</h1>
  </div>

  <p class="text-sm text-muted-foreground">
    {m.profile_editDesc()}
  </p>

  {#if profileQuery.isLoading}
    <p class="loading-state">{m.common_loading()}</p>
  {:else if profileQuery.isError}
    <p class="error-state">{m.common_error()}</p>
  {:else}
    <form class="flex flex-col gap-3" onsubmit={handleUpdateProfile}>
      <div class="form-grid-2">
        <FormInput
          id="age"
          label={m.profile_age()}
          type="number"
          placeholder={m.profile_placeholder_age()}
          bind:value={profileData.age}
          error={errors.age?.[0]}
        />
        <FormSelect
          label={m.profile_gender()}
          options={genderOptions}
          bind:value={profileData.gender}
          error={errors.gender?.[0]}
        />
      </div>

      <div class="form-grid-2">
        <FormInput
          id="weight"
          label={m.profile_weight()}
          type="number"
          placeholder={m.profile_placeholder_weight()}
          bind:value={profileData.weight}
          error={errors.weight?.[0]}
        />
        <FormInput
          id="height"
          label={m.profile_height()}
          type="number"
          placeholder={m.profile_placeholder_height()}
          bind:value={profileData.height}
          error={errors.height?.[0]}
        />
      </div>

      <div class="form-grid-2">
        <FormSelect
          label={m.profile_fitnessLevel()}
          options={fitnessLevelOptions}
          bind:value={profileData.fitnessLevel}
          placeholder="Select Level"
          error={errors.fitnessLevel?.[0]}
        />

        <FormSelect
          label={m.profile_equipment()}
          options={equipmentOptions}
          bind:value={profileData.equipment}
          placeholder="Select Equipment"
          error={errors.equipment?.[0]}
        />
      </div>

      <FormInput
        id="schedule"
        label={m.profile_schedule()}
        placeholder={m.profile_placeholder_schedule()}
        bind:value={profileData.schedule}
        error={errors.schedule?.[0]}
      />

      <FormMultiSelect
        id="limitations"
        label={m.profile_limitations()}
        options={limitationOptions}
        bind:value={profileData.limitations}
        placeholder="Select Limitations"
        error={errors.limitations?.[0]}
      />

      <FormMultiSelect
        id="target"
        label={m.profile_goalTarget()}
        options={targetOptions}
        bind:value={profileData.target}
        placeholder="Select Goals"
        error={errors.target?.[0]}
        max={3}
      />

      <div class="form-grid-2">
        <FormSelect
          label={m.profile_primaryFocus()}
          options={muscleOptions}
          bind:value={profileData.primaryFocus}
          placeholder="Select Muscle"
          error={errors.primaryFocus?.[0]}
        />

        <FormSelect
          label={m.profile_secondaryFocus()}
          options={muscleOptions}
          bind:value={profileData.secondaryFocus}
          placeholder="Select Muscle"
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
          options={reminderTimeOptions}
          bind:value={profileData.reminderMinutesBefore}
          placeholder="Select reminder time"
          error={errors.reminderMinutesBefore?.[0]}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        class="form-cancel-btn"
        onclick={() => {
          isEditing = false;
          if (profileQuery.data) {
            const user = (profileQuery.data as any).user;
            profileData = {
              age: user.age?.toString() || "",
              gender: user.gender || "",
              weight: user.weight?.toString() || "",
              height: user.height?.toString() || "",
              bmi: user.bmi || "",
              fitnessLevel: user.fitnessLevel || "",
              equipment: user.equipment || "",
              schedule: user.schedule || "",
              limitations: user.limitations ? user.limitations.split(",") : [],
              target: user.target ? user.target.split(",") : [],
              primaryFocus: user.primaryFocus || "",
              secondaryFocus: user.secondaryFocus || "",
              preferredWorkoutTime: user.preferredWorkoutTime || "",
              reminderMinutesBefore:
                user.reminderMinutesBefore?.toString() || "30",
              notificationsEnabled: user.notificationsEnabled || false,
            };
          }
        }}
        disabled={updateProfileMutation.isPending}
      >
        {m.action_cancel()}
      </Button>
      <Button
        type="submit"
        class="form-save-btn"
        disabled={updateProfileMutation.isPending}
      >
        {updateProfileMutation.isPending
          ? m.action_saving()
          : m.action_saveChanges()}
      </Button>
    </form>
  {/if}
</div>

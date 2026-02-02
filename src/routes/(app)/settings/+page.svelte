<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Tabs from "$lib/components/ui/tabs";
  import * as Card from "$lib/components/ui/card";
  import {
    FormInput,
    FormSelect,
    FormMultiSelect,
  } from "$lib/components/ui/form";
  import { RefreshCw } from "@lucide/svelte";
  import { goto, invalidate } from "$app/navigation";
  import {
    profileSchema,
    equipmentOptions,
    genderOptions,
    fitnessLevelOptions,
    targetOptions,
    limitationOptions,
    muscleOptions,
  } from "$lib/schemas/profile";
  import {
    useProfileQuery,
    useUpdateProfileMutation,
  } from "$lib/queries/profile";
  import { useGenerateWeeklyPlanMutation } from "$lib/queries/weekly-plan";
  import { useGenerateMonthlyPlanMutation } from "$lib/queries/monthly-plan";
  import { toast } from "svelte-sonner";

  let { data } = $props();

  // Use TanStack Query
  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const generateWeeklyPlanMutation = useGenerateWeeklyPlanMutation();
  const generateMonthlyPlanMutation = useGenerateMonthlyPlanMutation();

  let profileData = $state({
    age: "",
    gender: "",
    weight: "",
    height: "",
    bmi: "",
    fitnessLevel: "",
    equipment: "",
    schedule: "",
    limitations: [] as string[],
    target: [] as string[],
    primaryFocus: "",
    secondaryFocus: "",
  });

  let isEditing = $state(false);
  let isRefreshingLimit = $state(false);
  let generatingPlan = $state<"week" | "month" | null>(null);
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
      };
    }
  });

  async function handleUpdateProfile(e: Event) {
    e.preventDefault();
    errors = {};

    const result = profileSchema.safeParse(profileData);

    if (!result.success) {
      errors = result.error.flatten().fieldErrors;
      toast.error("Validation failed", {
        description: "Please check your inputs and try again.",
      });
      return;
    }

    try {
      const data = await updateProfileMutation.mutateAsync(result.data);
      profileData.bmi = (data as any).user.bmi || "";
      isEditing = false;
      toast.success("Profile updated successfully!", {
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description:
          "Please try again or contact support if the issue persists.",
      });
    }
  }

  async function refreshPlanLimit() {
    try {
      isRefreshingLimit = true;
      await invalidate("app:planLimit");
      toast.success("Usage limit refreshed");
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
        toast.success("Weekly plan generated successfully!", {
          description: "Redirecting to dashboard...",
          duration: 2000,
          onAutoClose: () => {
            goto("/");
          },
        });
      } else {
        await generateMonthlyPlanMutation.mutateAsync();
        await invalidate("app:planLimit");
        toast.success("Monthly plan generated successfully!", {
          description: "Redirecting to dashboard...",
          duration: 2000,
          onAutoClose: () => {
            goto("/");
          },
        });
      }
    } catch (error: any) {
      console.error("Error regenerating plan:", error);
      const planType = duration === "week" ? "weekly" : "monthly";

      // Check if it's a known error structure with a message
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Please try again or contact support if the issue persists.";

      toast.error(`Failed to generate ${planType} plan`, {
        description: errorMessage,
      });
    } finally {
      generatingPlan = null;
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center space-x-2">
    <h1 class="text-2xl font-bold">Settings</h1>
  </div>

  <Tabs.Root value="profile" class="w-full">
    <Tabs.List class="w-full grid grid-cols-2">
      <Tabs.Trigger value="profile" data-tour="profile-tab"
        >Profile</Tabs.Trigger
      >
      <Tabs.Trigger value="plans" data-tour="plans-tab">Plans</Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="profile" class="mt-4">
      <Card.Root>
        <Card.Header>
          <div class="flex items-center justify-between">
            <div>
              <Card.Title>User Profile</Card.Title>
              <Card.Description>
                {#if isEditing}
                  Update your fitness profile information
                {:else}
                  View your current fitness profile
                {/if}
              </Card.Description>
            </div>
            {#if !isEditing}
              <Button
                size="sm"
                variant="outline"
                onclick={() => (isEditing = true)}
                data-tour="edit-profile"
              >
                Edit
              </Button>
            {/if}
          </div>
        </Card.Header>

        {#if profileQuery.isLoading}
          <Card.Content>
            <p class="text-muted-foreground text-center py-8">
              Loading profile...
            </p>
          </Card.Content>
        {:else if profileQuery.isError}
          <Card.Content>
            <p class="text-destructive text-center py-8">
              Failed to load profile. Please try again.
            </p>
          </Card.Content>
        {:else if isEditing}
          <form onsubmit={handleUpdateProfile}>
            <Card.Content class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
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

              <div class="grid grid-cols-2 gap-4">
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

              <div class="grid grid-cols-2 gap-4">
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

              <div class="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Primary Muscle Focus"
                  options={muscleOptions}
                  bind:value={profileData.primaryFocus}
                  placeholder="Select Primary Focus (Optional)"
                  error={errors.primaryFocus?.[0]}
                />

                <FormSelect
                  label="Secondary Muscle Focus"
                  options={muscleOptions}
                  bind:value={profileData.secondaryFocus}
                  placeholder="Select Secondary Focus (Optional)"
                  error={errors.secondaryFocus?.[0]}
                />
              </div>
            </Card.Content>

            <Card.Footer class="flex gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                class="flex-1"
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
                      limitations: user.limitations
                        ? user.limitations.split(",")
                        : [],
                      target: user.target ? user.target.split(",") : [],
                      primaryFocus: user.primaryFocus || "",
                      secondaryFocus: user.secondaryFocus || "",
                    };
                  }
                }}
                disabled={updateProfileMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                class="flex-1"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </Card.Footer>
          </form>
        {:else}
          <Card.Content class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-muted-foreground">Age</p>
                <p class="font-medium">
                  {profileData.age || "N/A"}
                </p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Gender</p>
                <p class="font-medium">
                  {profileData.gender || "N/A"}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <p class="text-sm text-muted-foreground">Weight</p>
                <p class="font-medium">
                  {profileData.weight ? `${profileData.weight} kg` : "N/A"}
                </p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Height</p>
                <p class="font-medium">
                  {profileData.height ? `${profileData.height} cm` : "N/A"}
                </p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground">BMI</p>
                <p class="font-medium">
                  {profileData.bmi || "N/A"}
                </p>
              </div>
            </div>

            <div>
              <p class="text-sm text-muted-foreground">Fitness Level</p>
              <p class="font-medium">
                {profileData.fitnessLevel || "N/A"}
              </p>
            </div>

            <div>
              <p class="text-sm text-muted-foreground">Equipment</p>
              <p class="font-medium">
                {profileData.equipment || "N/A"}
              </p>
            </div>

            <div>
              <p class="text-sm text-muted-foreground">Schedule</p>
              <p class="font-medium">
                {profileData.schedule || "N/A"}
              </p>
            </div>

            <div>
              <p class="text-sm text-muted-foreground">Limitations</p>
              <p class="font-medium">
                {profileData.limitations?.length
                  ? profileData.limitations.join(", ")
                  : "None"}
              </p>
            </div>

            <div>
              <p class="text-sm text-muted-foreground">Goal / Target</p>
              <p class="font-medium">
                {profileData.target?.length
                  ? profileData.target.join(", ")
                  : "N/A"}
              </p>
            </div>

            <div>
              <p class="text-sm text-muted-foreground">Primary Focus</p>
              <p class="font-medium">
                {profileData.primaryFocus || "N/A"}
              </p>
            </div>

            <div>
              <p class="text-sm text-muted-foreground">Secondary Focus</p>
              <p class="font-medium">
                {profileData.secondaryFocus || "N/A"}
              </p>
            </div>
          </Card.Content>
        {/if}
      </Card.Root>
    </Tabs.Content>

    <Tabs.Content value="plans" class="mt-4">
      {#if data.planLimit}
        <div class="mb-6 space-y-2 px-1">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Weekly Generations</span>
            <div class="flex items-center gap-2">
              <span class="font-medium"
                >{data.planLimit.used} / {data.planLimit.max}</span
              >
              <Button
                variant="ghost"
                size="icon"
                class="h-5 w-5"
                onclick={refreshPlanLimit}
                disabled={isRefreshingLimit}
                title="Refresh limit"
              >
                <RefreshCw
                  class="h-3 w-3 {isRefreshingLimit ? 'animate-spin' : ''}"
                />
              </Button>
            </div>
          </div>
          <div class="h-2 w-full rounded-full bg-secondary">
            <div
              class="h-full rounded-full bg-primary transition-all"
              style="width: {(data.planLimit.used / data.planLimit.max) * 100}%"
            ></div>
          </div>
          {#if data.planLimit.resetAt}
            <p class="text-xs text-muted-foreground text-right">
              Next reset: {formatDate(data.planLimit.resetAt)}
            </p>
          {/if}
        </div>
      {/if}

      <div class="grid gap-4">
        <Card.Root>
          <Card.Header>
            <Card.Title>Weekly Plan</Card.Title>
            <Card.Description>
              Generate a new 7-day workout plan based on your current profile.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Button
              variant="secondary"
              class="w-full"
              disabled={generatingPlan !== null ||
                data.planLimit?.remaining === 0}
              onclick={() => handleRegeneratePlan("week")}
            >
              {#if generatingPlan === "week"}
                <RefreshCw class="mr-2 h-4 w-4 animate-spin" />
                Generating...
              {:else}
                <RefreshCw class="mr-2 h-4 w-4" />
                Generate New Weekly Plan
              {/if}
            </Button>
          </Card.Content>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Card.Title>Monthly Plan</Card.Title>
            <Card.Description>
              Generate a full 4-week periodized plan (Recommended).
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Button
              class="w-full"
              disabled={generatingPlan !== null ||
                data.planLimit?.remaining === 0}
              onclick={() => handleRegeneratePlan("month")}
            >
              {#if generatingPlan === "month"}
                <RefreshCw class="mr-2 h-4 w-4 animate-spin" />
                Generating...
              {:else}
                <RefreshCw class="mr-2 h-4 w-4" />
                Generate New Monthly Plan
              {/if}
            </Button>
          </Card.Content>
        </Card.Root>
      </div>
    </Tabs.Content>
  </Tabs.Root>
</div>

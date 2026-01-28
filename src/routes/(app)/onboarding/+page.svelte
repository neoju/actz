<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import {
        FormInput,
        FormSelect,
        FormTextarea,
    } from "$lib/components/ui/form";
    import * as Card from "$lib/components/ui/card";
    import { goto } from "$app/navigation";
    import { Check, CalendarRange, CalendarDays } from "@lucide/svelte";
    import {
        profileSchema,
        equipmentOptions,
        genderOptions,
        fitnessLevelOptions,
        createInitialProfileData,
    } from "$lib/schemas/profile";
    import { useUpdateProfileMutation } from "$lib/queries/profile";
    import { useGenerateWeeklyPlanMutation } from "$lib/queries/weekly-plan";
    import { useGenerateMonthlyPlanMutation } from "$lib/queries/monthly-plan";

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

            goto("/dashboard");
        } catch (error) {
            console.error(`Error generating ${type} plan:`, error);
        } finally {
            loadingStep = null;
            selectingPlan = null;
        }
    }
</script>

<div class="space-y-6 pb-8">
    <div class="space-y-2 pt-4">
        {#if step === "profile"}
            <h1 class="text-3xl font-bold tracking-tight">Tell us about you</h1>
            <p class="text-muted-foreground">
                We need some info to create your personalized plan.
            </p>
        {:else}
            <h1 class="text-3xl font-bold tracking-tight">Choose your path</h1>
            <p class="text-muted-foreground">
                How would you like to start your fitness journey?
            </p>
        {/if}
    </div>

    {#if step === "profile"}
        <form onsubmit={handleSubmit} class="space-y-6">
            <fieldset disabled={isLoading} class="space-y-6 group">
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

                <FormInput
                    id="schedule"
                    label="Schedule"
                    placeholder="30 mins/day, 3 days/week"
                    bind:value={profileData.schedule}
                    error={errors.schedule?.[0]}
                />

                <FormInput
                    id="limitations"
                    label="Limitations"
                    placeholder="Lower back pain..."
                    bind:value={profileData.limitations}
                    error={errors.limitations?.[0]}
                />

                <FormTextarea
                    id="target"
                    label="Goal / Target"
                    placeholder="I want to lose weight and build muscle..."
                    bind:value={profileData.target}
                    error={errors.target?.[0]}
                />

                <Button
                    type="submit"
                    class="w-full text-lg py-6 mt-4"
                    disabled={isLoading}
                >
                    {#if isLoading && loadingStep === "profile"}
                        Updating Profile...
                    {:else}
                        Next
                    {/if}
                </Button>
            </fieldset>
        </form>
    {:else}
        <div class="grid gap-4 md:grid-cols-2">
            <!-- Monthly Plan Option (Recommended) -->
            <button
                class="text-left w-full disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                onclick={() => handleGeneratePlan("month")}
            >
                <Card.Root
                    class="h-full hover:border-primary transition-colors cursor-pointer relative overflow-hidden border-2 {selectingPlan ===
                    'month'
                        ? 'border-primary'
                        : 'border-border'}"
                >
                    <div
                        class="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg z-10"
                    >
                        RECOMMENDED
                    </div>
                    <Card.Header>
                        <div class="flex items-center gap-2 mb-2">
                            <div
                                class="p-2 rounded-lg bg-primary/10 text-primary"
                            >
                                <CalendarRange class="w-6 h-6" />
                            </div>
                            <Card.Title>Monthly Plan</Card.Title>
                        </div>
                        <Card.Description>
                            A comprehensive 4-week progression designed to build
                            habits.
                        </Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <ul class="space-y-2 text-sm text-muted-foreground">
                            <li class="flex items-center gap-2">
                                <Check class="w-4 h-4 text-green-500" />
                                4-Week Periodization
                            </li>
                            <li class="flex items-center gap-2">
                                <Check class="w-4 h-4 text-green-500" />
                                Progressive Overload
                            </li>
                            <li class="flex items-center gap-2">
                                <Check class="w-4 h-4 text-green-500" />
                                Built-in Deload Week
                            </li>
                        </ul>
                        <Button
                            class="w-full mt-6"
                            variant="default"
                            disabled={isLoading}
                        >
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
                class="text-left w-full disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                onclick={() => handleGeneratePlan("week")}
            >
                <Card.Root
                    class="h-full hover:border-primary transition-colors cursor-pointer border-2 {selectingPlan ===
                    'week'
                        ? 'border-primary'
                        : 'border-border'}"
                >
                    <Card.Header>
                        <div class="flex items-center gap-2 mb-2">
                            <div
                                class="p-2 rounded-lg bg-secondary text-secondary-foreground"
                            >
                                <CalendarDays class="w-6 h-6" />
                            </div>
                            <Card.Title>Weekly Plan</Card.Title>
                        </div>
                        <Card.Description>
                            Focus on one week at a time. Ideal for flexibility.
                        </Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <ul class="space-y-2 text-sm text-muted-foreground">
                            <li class="flex items-center gap-2">
                                <Check class="w-4 h-4 text-green-500" />
                                7-Day Schedule
                            </li>
                            <li class="flex items-center gap-2">
                                <Check class="w-4 h-4 text-green-500" />
                                Quick Start
                            </li>
                            <li class="flex items-center gap-2">
                                <Check class="w-4 h-4 text-green-500" />
                                Flexible Commitment
                            </li>
                        </ul>
                        <Button
                            class="w-full mt-6"
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
    {/if}
</div>

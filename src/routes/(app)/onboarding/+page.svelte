<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import {
        FormInput,
        FormSelect,
        FormTextarea,
    } from "$lib/components/ui/form";
    import { goto } from "$app/navigation";
    import {
        profileSchema,
        equipmentOptions,
        genderOptions,
        fitnessLevelOptions,
        createInitialProfileData,
    } from "$lib/schemas/profile";

    let profileData = $state(createInitialProfileData());
    let isLoading = $state(false);
    let loadingStep = $state<"profile" | "plan" | null>(null);
    let errors: Record<string, string[] | undefined> = $state({});

    async function handleSubmit(e: Event) {
        e.preventDefault();
        isLoading = true;
        errors = {};

        const result = profileSchema.safeParse(profileData);

        if (!result.success) {
            errors = result.error.flatten().fieldErrors;
            isLoading = false;
            return;
        }

        try {
            // Step 1: Update user profile
            loadingStep = "profile";
            const profileResponse = await fetch("/api/user/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(profileData),
            });

            if (!profileResponse.ok) {
                const error = await profileResponse.json();
                console.error("Failed to update profile:", error);
                return;
            }

            // Step 2: Generate weekly plan
            loadingStep = "plan";
            const planResponse = await fetch("/api/weekly-plan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (planResponse.ok) {
                const result = await planResponse.json();
                goto("/dashboard");
            } else {
                const error = await planResponse.json();
                console.error("Failed to generate weekly plan:", error);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            isLoading = false;
            loadingStep = null;
        }
    }
</script>

<div class="space-y-6 pb-8">
    <div class="space-y-2 pt-4">
        <h1 class="text-3xl font-bold tracking-tight">Tell us about you</h1>
        <p class="text-muted-foreground">
            We need some info to create your personalized plan.
        </p>
    </div>

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
                placeholder="1 hr/day, 3 days/week"
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
                {:else if isLoading && loadingStep === "plan"}
                    Generating Your Plan...
                {:else if isLoading}
                    Processing...
                {:else}
                    Create Plan
                {/if}
            </Button>
        </fieldset>
    </form>
</div>

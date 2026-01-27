<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Card from "$lib/components/ui/card";
    import {
        FormInput,
        FormSelect,
        FormTextarea,
    } from "$lib/components/ui/form";
    import { ArrowLeft } from "@lucide/svelte";
    import { onMount } from "svelte";
    import {
        profileSchema,
        equipmentOptions,
        genderOptions,
        fitnessLevelOptions,
    } from "$lib/schemas/profile";

    let profileData = $state({
        age: "",
        gender: "",
        weight: "",
        height: "",
        bmi: "",
        fitnessLevel: "",
        equipment: "",
        schedule: "",
        limitations: "",
        target: "",
    });

    let isLoading = $state(false);
    let isEditing = $state(false);
    let isSaving = $state(false);
    let errors: Record<string, string[] | undefined> = $state({});

    async function fetchProfile() {
        isLoading = true;
        try {
            const response = await fetch("/api/user/profile");
            if (response.ok) {
                const data = await response.json();
                profileData = {
                    ...data.user,
                };
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            isLoading = false;
        }
    }

    async function handleUpdateProfile(e: Event) {
        e.preventDefault();
        isSaving = true;
        errors = {};

        const result = profileSchema.safeParse(profileData);

        if (!result.success) {
            errors = result.error.flatten().fieldErrors;
            isSaving = false;
            return;
        }

        try {
            const response = await fetch("/api/user/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(profileData),
            });

            if (response.ok) {
                const data = await response.json();
                profileData.bmi = data.user.bmi;
                isEditing = false;
            } else {
                console.error("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            isSaving = false;
        }
    }

    onMount(() => {
        fetchProfile();
    });
</script>

<div class="space-y-6">
    <div class="flex items-center space-x-2">
        <Button variant="ghost" size="icon" href="/dashboard">
            <ArrowLeft class="h-4 w-4" />
        </Button>
        <h1 class="text-2xl font-bold">Settings</h1>
    </div>

    <Tabs.Root value="profile" class="w-full">
        <Tabs.List class="w-full grid grid-cols-2">
            <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
            <Tabs.Trigger value="other">Other</Tabs.Trigger>
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
                            >
                                Edit
                            </Button>
                        {/if}
                    </div>
                </Card.Header>

                {#if isLoading}
                    <Card.Content>
                        <p class="text-muted-foreground text-center py-8">
                            Loading profile...
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
                        </Card.Content>

                        <Card.Footer class="flex gap-2 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                class="flex-1"
                                onclick={() => {
                                    isEditing = false;
                                    fetchProfile();
                                }}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                class="flex-1"
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save Changes"}
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
                                <p class="text-sm text-muted-foreground">
                                    Gender
                                </p>
                                <p class="font-medium">
                                    {profileData.gender || "N/A"}
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-3 gap-4">
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Weight
                                </p>
                                <p class="font-medium">
                                    {profileData.weight
                                        ? `${profileData.weight} kg`
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-muted-foreground">
                                    Height
                                </p>
                                <p class="font-medium">
                                    {profileData.height
                                        ? `${profileData.height} cm`
                                        : "N/A"}
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
                            <p class="text-sm text-muted-foreground">
                                Fitness Level
                            </p>
                            <p class="font-medium">
                                {profileData.fitnessLevel || "N/A"}
                            </p>
                        </div>

                        <div>
                            <p class="text-sm text-muted-foreground">
                                Equipment
                            </p>
                            <p class="font-medium">
                                {profileData.equipment || "N/A"}
                            </p>
                        </div>

                        <div>
                            <p class="text-sm text-muted-foreground">
                                Schedule
                            </p>
                            <p class="font-medium">
                                {profileData.schedule || "N/A"}
                            </p>
                        </div>

                        <div>
                            <p class="text-sm text-muted-foreground">
                                Limitations
                            </p>
                            <p class="font-medium">
                                {profileData.limitations || "None"}
                            </p>
                        </div>

                        <div>
                            <p class="text-sm text-muted-foreground">
                                Goal / Target
                            </p>
                            <p class="font-medium">
                                {profileData.target || "N/A"}
                            </p>
                        </div>
                    </Card.Content>
                {/if}
            </Card.Root>
        </Tabs.Content>

        <Tabs.Content value="other" class="mt-4">
            <Card.Root>
                <Card.Header>
                    <Card.Title>Other Settings</Card.Title>
                    <Card.Description>
                        Additional settings will be available here soon
                    </Card.Description>
                </Card.Header>
                <Card.Content>
                    <p class="text-muted-foreground text-center py-8">
                        Coming soon...
                    </p>
                </Card.Content>
            </Card.Root>
        </Tabs.Content>
    </Tabs.Root>
</div>

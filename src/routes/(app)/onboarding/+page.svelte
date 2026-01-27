<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import {
        FormInput,
        FormSelect,
        FormTextarea,
    } from "$lib/components/ui/form";
    import { goto } from "$app/navigation";
    import { z } from "zod";

    let gender = $state("");
    let fitnessLevel = $state("");
    let age = $state("");
    let weight = $state("");
    let height = $state("");
    let equipment = $state("");
    let schedule = $state("");
    let limitations = $state("");
    let target = $state("");

    let isLoading = $state(false);
    let errors: Record<string, string[] | undefined> = $state({});

    const equipmentOptions = [
        "Full Gym",
        "Dumbbells Only",
        "Bodyweight",
        "Home Gym",
        "Resistance Bands",
    ].map((opt) => ({ label: opt, value: opt }));

    const genderOptions = [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
    ];

    const fitnessLevelOptions = [
        { label: "Beginner", value: "Beginner" },
        { label: "Intermediate", value: "Intermediate" },
        { label: "Advanced", value: "Advanced" },
    ];

    const onboardingSchema = z.object({
        age: z.coerce
            .number()
            .gt(0, "Please enter a valid age.")
            .gt(16, "Sorry, this app is not for kids.")
            .lt(
                40,
                "You are quite experienced! Maybe too experienced for this app?",
            ),
        weight: z.coerce
            .number()
            .gt(20, "Please enter a valid weight.")
            .gt(40, "Please consult a doctor.")
            .lt(150, "Please consult a doctor."),
        height: z.coerce
            .number()
            .gt(50, "Please enter a valid height.")
            .gt(110, "You are too short for this app :))")
            .lt(200, "You are too tall for this app."),
        equipment: z
            .string()
            .refine((val) => equipmentOptions.some((o) => o.value === val), {
                message: "Please select valid equipment.",
            }),
        schedule: z.string().refine(
            (val) => {
                const parts = val.split(",").map((p) => p.trim());
                const regex = /^\d+\s*(hr\/day|days\/week)$/i;
                return parts.every((part) => regex.test(part));
            },
            {
                message:
                    "Format: 'X hr/day', 'X days/week' or comma separated list (e.g. '1hr/day, 3days/week')",
            },
        ),
        limitations: z
            .string()
            .optional()
            .refine((val) => !val || val.trim().split(/\s+/).length <= 50, {
                message: "Max 50 words allowed.",
            }),
        target: z
            .string()
            .refine((val) => val.trim().split(/\s+/).length <= 100, {
                message: "Max 100 words allowed.",
            }),
        gender: z.string().min(1, "Please select gender"),
        fitnessLevel: z.string().min(1, "Please select fitness level"),
    });

    async function handleSubmit(e: Event) {
        e.preventDefault();
        isLoading = true;
        errors = {};

        const formData = {
            age,
            gender,
            weight,
            height,
            fitnessLevel,
            equipment,
            schedule,
            limitations,
            target,
        };

        const result = onboardingSchema.safeParse(formData);

        if (!result.success) {
            errors = result.error.flatten().fieldErrors;
            isLoading = false;
            return;
        }

        try {
            const response = await fetch("/api/weekly-plan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Gemini Analysis Result:", result);
                goto("/dashboard");
            } else {
                console.error("Failed to analyze condition");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            isLoading = false;
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
                    bind:value={age}
                    error={errors.age?.[0]}
                />
                <FormSelect
                    label="Gender"
                    options={genderOptions}
                    bind:value={gender}
                    error={errors.gender?.[0]}
                />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <FormInput
                    id="weight"
                    label="Weight (kg)"
                    type="number"
                    placeholder="70"
                    bind:value={weight}
                    error={errors.weight?.[0]}
                />
                <FormInput
                    id="height"
                    label="Height (cm)"
                    type="number"
                    placeholder="175"
                    bind:value={height}
                    error={errors.height?.[0]}
                />
            </div>

            <FormSelect
                label="Fitness Level"
                options={fitnessLevelOptions}
                bind:value={fitnessLevel}
                placeholder="Select Level"
                error={errors.fitnessLevel?.[0]}
            />

            <FormSelect
                label="Equipment"
                options={equipmentOptions}
                bind:value={equipment}
                placeholder="Select Equipment"
                error={errors.equipment?.[0]}
            />

            <FormInput
                id="schedule"
                label="Schedule"
                placeholder="1 hr/day, 3 days/week"
                bind:value={schedule}
                error={errors.schedule?.[0]}
            />

            <FormInput
                id="limitations"
                label="Limitations"
                placeholder="Lower back pain..."
                bind:value={limitations}
                error={errors.limitations?.[0]}
            />

            <FormTextarea
                id="target"
                label="Goal / Target"
                placeholder="I want to lose weight and build muscle..."
                bind:value={target}
                error={errors.target?.[0]}
            />

            <Button
                type="submit"
                class="w-full text-lg py-6 mt-4"
                disabled={isLoading}
            >
                {#if isLoading}
                    Analyzing...
                {:else}
                    Create Plan
                {/if}
            </Button>
        </fieldset>
    </form>
</div>

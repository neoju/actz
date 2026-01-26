<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Select from "$lib/components/ui/select";
    import { goto } from "$app/navigation";

    let gender = $state("");
    let fitnessLevel = $state("");

    function handleSubmit(e: Event) {
        e.preventDefault();
        goto("/dashboard");
    }
</script>

<div class="space-y-6 pb-8">
    <div class="space-y-2 pt-4">
        <h1 class="text-3xl font-bold tracking-tight">Tell us about you</h1>
        <p class="text-muted-foreground">We need some info to create your personalized plan.</p>
    </div>

    <form onsubmit={handleSubmit} class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
                <Label for="age">Age</Label>
                <Input id="age" type="number" placeholder="25" required />
            </div>
            <div class="space-y-2">
                <Label for="gender">Gender</Label>
                 <Select.Root type="single" bind:value={gender}>
                    <Select.Trigger class="w-full">
                        {gender ? gender : "Select"}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="Male">Male</Select.Item>
                        <Select.Item value="Female">Female</Select.Item>
                        <Select.Item value="Other">Other</Select.Item>
                    </Select.Content>
                </Select.Root>
            </div>
        </div>

         <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
                <Label for="weight">Weight (kg)</Label>
                <Input id="weight" type="number" placeholder="70" required />
            </div>
            <div class="space-y-2">
                <Label for="height">Height (cm)</Label>
                <Input id="height" type="number" placeholder="175" required />
            </div>
        </div>

        <div class="space-y-2">
             <Label>Fitness Level</Label>
             <Select.Root type="single" bind:value={fitnessLevel}>
                <Select.Trigger class="w-full">
                    {fitnessLevel ? fitnessLevel : "Select Level"}
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="Beginner">Beginner</Select.Item>
                    <Select.Item value="Intermediate">Intermediate</Select.Item>
                    <Select.Item value="Advanced">Advanced</Select.Item>
                </Select.Content>
            </Select.Root>
        </div>

        <div class="space-y-2">
            <Label for="equipment">Equipment</Label>
            <Input id="equipment" placeholder="Dumbbells, Yoga mat" />
        </div>

        <div class="space-y-2">
            <Label for="schedule">Schedule</Label>
            <Input id="schedule" placeholder="1 hr/day, 3 days/week" />
        </div>

        <div class="space-y-2">
            <Label for="limitations">Limitations</Label>
            <Input id="limitations" placeholder="Lower back pain..." />
        </div>

        <Button type="submit" class="w-full text-lg py-6 mt-4">Create Plan</Button>
    </form>
</div>

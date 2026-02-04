<script lang="ts">
    import { Label } from "$lib/components/ui/label";
    import * as Select from "$lib/components/ui/select";

    let {
        label,
        value = $bindable(),
        options,
        placeholder = "Select",
        error,
    } = $props();

    let selectedLabel = $derived(
        options.find((o: any) => o.value == value)?.label ?? value
    );
</script>

<div class="space-y-2">
    <Label>{label}</Label>
    <Select.Root type="single" bind:value>
        <Select.Trigger class={`w-full ${error ? "border-red-500" : ""}`}>
            {selectedLabel ? selectedLabel : placeholder}
        </Select.Trigger>
        <Select.Content>
            {#each options as option}
                <Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
            {/each}
        </Select.Content>
    </Select.Root>
    {#if error}
        <p class="text-sm text-red-500">{error}</p>
    {/if}
</div>

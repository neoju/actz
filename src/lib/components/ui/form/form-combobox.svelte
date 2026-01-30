<script lang="ts">
    import { Label } from "$lib/components/ui/label";
    import Combobox from "$lib/components/ui/combobox.svelte";

    let {
        label,
        value = $bindable(),
        options,
        placeholder = "Select...",
        error,
        id,
        multiple = false,
    } = $props();
</script>

<div class="space-y-2">
    <Label for={id}>{label}</Label>
    <Combobox bind:value {options} {placeholder} {multiple} class={error ? "border-red-500" : ""} />
    {#if error}
        <p class="text-sm text-red-500">{error}</p>
    {/if}
</div>
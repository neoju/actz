<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";

    let {
        id,
        label,
        value = $bindable(),
        placeholder,
        type = "text",
        error,
        ...restProps
    } = $props();
</script>

<div class="space-y-2">
    <Label for={id}>{label}</Label>
    <Input
        {id}
        {type}
        {placeholder}
        bind:value
        class={error ? "border-red-500" : ""}
        {...restProps}
    />
    {#if error}
        <p class="text-sm text-red-500">{error}</p>
    {/if}
</div>

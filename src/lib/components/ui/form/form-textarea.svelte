<script lang="ts">
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";

    let {
        id,
        label,
        value = $bindable(),
        placeholder,
        error,
        ...restProps
    } = $props();
</script>

<div class="space-y-2">
    <Label for={id}>{label}</Label>
    <Textarea
        {id}
        {placeholder}
        bind:value
        class={error ? "border-red-500" : ""}
        {...restProps}
    />
    {#if error}
        <p class="text-sm text-red-500">{error}</p>
    {/if}
</div>

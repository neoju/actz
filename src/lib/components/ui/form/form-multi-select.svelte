<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import { Badge } from "$lib/components/ui/badge";
  import { X } from "@lucide/svelte";

  let {
    label,
    value = $bindable([]),
    options,
    placeholder = "Select",
    error,
    id,
    max = undefined,
  } = $props();

  let selectedValue = $state("");
  let previousSelectedValue = $state("");

  const isMaxReached = $derived(() => max && value.length >= max);

  $effect(() => {
    if (selectedValue && selectedValue !== previousSelectedValue) {
      if (!value.includes(selectedValue) && !isMaxReached()) {
        value = [...value, selectedValue];
      }
      previousSelectedValue = selectedValue;
      // Reset after adding
      setTimeout(() => {
        selectedValue = "";
        previousSelectedValue = "";
      }, 0);
    }
  });

  function removeValue(optionValue: string) {
    value = value.filter((v: string) => v !== optionValue);
  }

  const selectedOptions = $derived(() => {
    return options.filter((o: any) => value.includes(o.value));
  });
</script>

<div class="space-y-2">
  <Label for={id}>
    {label}
    {#if max}
      <span class="text-muted-foreground text-xs ml-1">
        ({value.length}/{max})
      </span>
    {/if}
  </Label>

  {#if value.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each selectedOptions() as option}
        <Badge variant="secondary" class="gap-1 pr-1.5">
          {option.label}
          <button
            type="button"
            onclick={(e) => {
              e.stopPropagation();
              removeValue(option.value);
            }}
            class="ml-1 hover:text-destructive focus:outline-none"
          >
            <X class="h-3 w-3" />
          </button>
        </Badge>
      {/each}
    </div>
  {/if}

  <Select.Root type="single" bind:value={selectedValue} disabled={isMaxReached()}>
    <Select.Trigger class={`w-full ${error ? "border-red-500" : ""}`}>
      {isMaxReached() ? `Maximum ${max} reached` : placeholder}
    </Select.Trigger>
    <Select.Content>
      {#each options as option}
        <Select.Item value={option.value} disabled={value.includes(option.value)}>
          {option.label}
        </Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
  {#if error}
    <p class="text-sm text-red-500">{error}</p>
  {/if}
</div>

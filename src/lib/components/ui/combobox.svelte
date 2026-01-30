<script lang="ts">
  import { Check, ChevronsUpDown, X } from "@lucide/svelte";
  import { tick } from "svelte";
  import { useId } from "bits-ui";
  import { cn } from "$lib/utils";
  import { Badge } from "$lib/components/ui/badge";
  import * as Popover from "$lib/components/ui/popover";
  import * as Command from "$lib/components/ui/command";
  import { buttonVariants } from "$lib/components/ui/button";

  let {
    value = $bindable(),
    placeholder = "Select...",
    options = [],
    class: className,
    multiple = false,
  } = $props();

  let open = $state(false);

  const selectedOption = $derived(() => {
    if (multiple) {
      return null;
    }
    return options.find((o: any) => o.value === value);
  });

  const selectedOptions = $derived(() => {
    if (!multiple || !Array.isArray(value)) {
      return [];
    }
    return options.filter((o: any) => value.includes(o.value));
  });

  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }

  function handleSelect(optionValue: string) {
    if (multiple) {
      if (Array.isArray(value)) {
        if (value.includes(optionValue)) {
          value = value.filter((v: string) => v !== optionValue);
        } else {
          value = [...value, optionValue];
        }
      } else {
        value = [optionValue];
      }
    } else {
      value = optionValue;
      closeAndFocusTrigger(triggerId);
    }
  }

  function removeValue(optionValue: string) {
    if (Array.isArray(value)) {
      value = value.filter((v: string) => v !== optionValue);
    }
  }

  const triggerId = useId();
</script>

<div class="w-full">
  {#if multiple && Array.isArray(value) && value.length > 0}
    <div class="flex flex-wrap gap-2 mb-2">
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

  <Popover.Root bind:open>
    <Popover.Trigger
      id={triggerId}
      class={cn(
        buttonVariants({ variant: "outline" }),
        "w-full justify-between",
        !value && "text-muted-foreground",
        className,
      )}
    >
      {#if multiple && Array.isArray(value) && value.length > 0}
        {value.length} selected
      {:else if selectedOption()}
        {selectedOption().label}
      {:else}
        {placeholder}
      {/if}
      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Popover.Trigger>
    <Popover.Content class="w-(--bits-popover-trigger-width) p-0">
      <Command.Root>
        <Command.Input placeholder="Search..." />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          <Command.Group>
            {#each options as option (option.value)}
              <Command.Item
                value={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <Check
                  class={cn(
                    "mr-2 h-4 w-4",
                    multiple
                      ? Array.isArray(value) && value.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                      : value === option.value
                        ? "opacity-100"
                        : "opacity-0",
                  )}
                />
                {option.label}
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.List>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
</div>

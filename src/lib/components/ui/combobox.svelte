<script lang="ts">
 import { Combobox } from "bits-ui";
 import { Check, ChevronsUpDown, X } from "@lucide/svelte";
 import { fly } from "svelte/transition";
 import { cn } from "$lib/utils";
 import { Badge } from "$lib/components/ui/badge";

 let { 
     value = $bindable(), 
     placeholder = "Select...", 
     options = [], 
     class: className,
     multiple = false
 } = $props();

 let inputValue = $state("");
 let touchedInput = $state(false);

 let filteredOptions = $derived(
  inputValue && touchedInput
   ? options.filter((option: any) =>
     option.label.toLowerCase().includes(inputValue.toLowerCase())
    )
   : options
 );
 
 // Sync inputValue with selected value label when value changes externally or initially (only for single mode)
 $effect(() => {
     if (!multiple && value) {
         const option = options.find((o: any) => o.value === value);
         if (option && !touchedInput) {
             inputValue = option.label;
         }
     }
 });
</script>

<Combobox.Root 
    type={multiple ? "multiple" : "single"} 
    bind:value 
    onOpenChange={(open) => {
        if (open) {
            touchedInput = false; 
        }
    }}
>
 <div class="relative w-full">
  {#if multiple && Array.isArray(value) && value.length > 0}
      <div class="flex flex-wrap gap-2 mb-2">
          {#each value as v}
              <Badge variant="secondary" class="gap-1 pr-1.5">
                  {options.find((o: any) => o.value === v)?.label || v}
                  <button 
                    type="button"
                    onclick={(e) => {
                        e.stopPropagation();
                        value = value.filter((i: any) => i !== v);
                    }} 
                    class="ml-1 hover:text-destructive focus:outline-none"
                  >
                      <X class="h-3 w-3" />
                  </button>
              </Badge>
          {/each}
      </div>
  {/if}
  <div class="relative">
      <Combobox.Input>
        {#snippet child({ props })}
            <input 
                {...props} 
                class={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8", className)}
                placeholder={placeholder}
                bind:value={inputValue}
                oninput={() => (touchedInput = true)}
            />
        {/snippet}
      </Combobox.Input>
      <Combobox.Trigger class="absolute right-0 top-0 h-full px-2 flex items-center justify-center">
          <ChevronsUpDown class="h-4 w-4 text-muted-foreground" />
      </Combobox.Trigger>
  </div>
 </div>

 <Combobox.Content
  class="z-50 min-w-[var(--bits-combobox-anchor-width)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md outline-none max-h-60 overflow-y-auto"
 >
  <div class="p-1">
      {#each filteredOptions as option (option.value)}
        <Combobox.Item
            class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50"
            value={option.value}
            label={option.label}
        >
            {#if multiple ? (Array.isArray(value) && value.includes(option.value)) : value === option.value}
                <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check class="h-4 w-4" />
                </span>
            {/if}
            {option.label}
        </Combobox.Item>
      {:else}
        <div class="py-6 text-center text-sm text-muted-foreground">No results found.</div>
      {/each}
  </div>
 </Combobox.Content>
</Combobox.Root>
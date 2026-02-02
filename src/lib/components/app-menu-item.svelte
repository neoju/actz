<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import type { Component } from "svelte";

  let {
    icon: Icon,
    label,
    onclick,
    variant = "ghost",
    class: className,
    'data-tour': dataTour
  } = $props<{
    icon: Component;
    label: string;
    onclick?: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    class?: string;
    'data-tour'?: string;
  }>();
</script>

<Button
  {variant}
  class="justify-start gap-3 {className}"
  {onclick}
  data-tour={dataTour}
>
  <Icon class="h-5 w-5" />
  <span>{label}</span>
</Button>

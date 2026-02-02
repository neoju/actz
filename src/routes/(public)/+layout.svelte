<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/ui/button/button.svelte";
  import { ChevronLeft } from "@lucide/svelte";

  let { children } = $props();
</script>

<div
  class="min-h-dvh bg-muted/20 text-foreground font-sans antialiased flex justify-center"
>
  <div
    class="w-full max-w-md min-h-full bg-background shadow-2xl overflow-hidden relative flex flex-col border-x border-border"
  >
    <header
      class="fixed max-w-md w-screen mx-auto top-0 z-40 bg-background border-b border-border p-4 flex items-end justify-end"
    >
      <div class="grow">
        <Button class="pl-0!" variant="ghost" onclick={() => goto("/")}>
          <ChevronLeft class="size-6" />
        </Button>
      </div>
    </header>
    <main class="flex-1 p-6 pt-20 flex flex-col">
      {@render children()}
    </main>
  </div>
</div>

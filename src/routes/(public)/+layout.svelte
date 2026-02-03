<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/ui/button/button.svelte";
  import { ChevronLeft } from "@lucide/svelte";
  import "$lib/assets/css/public-layout.css";

  let { children } = $props();
</script>

<div class="public-layout-wrapper">
  <div class="public-layout-container">
    <header class="public-header">
      <div class="header-grow">
        <Button class="back-btn" variant="ghost" onclick={() => goto("/")}>
          <ChevronLeft class="back-icon" />
        </Button>
      </div>
    </header>
    <main class="public-main">
      {@render children()}
    </main>
  </div>
</div>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { signIn, type SignInOptions } from "@auth/sveltekit/client";
  import { Button } from "$lib/components/ui/button";
  import { LoaderPinwheel, User } from "@lucide/svelte";
  import { useProfileQuery } from "$lib/queries/profile";

  let { data } = $props();

  let loading = $state(false);
  let providerId = $state("");

  const profileQuery = useProfileQuery();

  function handleLogin(provider: string) {
    let params: SignInOptions = {
      redirectTo: "/",
    };

    if (provider === "credentials") {
      params.guestUserId = localStorage.getItem("actz_device_id");
    }

    loading = true;
    providerId = provider;

    signIn(provider, params)
      .then(() => profileQuery.refetch())
      .then(() => {
        if (!profileQuery.data?.user.age) {
          return goto("/setup");
        }

        goto("/");
      })
      .finally(() => {
        loading = false;
      });
  }

  $effect(() => {
    if (data.session?.user) {
      goto("/");
    }
  });
</script>

<div
  class="min-h-dvh bg-muted/20 text-foreground font-sans antialiased flex justify-center"
>
  <div class="flex-1 flex flex-col items-center justify-center space-y-10 px-4">
    <img src="/actz.png" alt="App Logo" class="w-48 h-48" />

    <div class="w-full text-center flex-col items-center flex space-y-4">
      <Button
        class="border-[#e84133]! text-[#e84133]! w-3xs"
        variant="outline"
        disabled={loading}
        onclick={() => handleLogin("google")}
      >
        {#if loading && providerId === "google"}
          <LoaderPinwheel class="animate-spin" />
        {:else}
          <img
            src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png?width=20&height=20&format=auto"
            alt="Google Icon"
            class="size-5"
          />
        {/if}
        <span class="flex flex-1 justify-center">Continue with Google</span>
      </Button>

      <Button
        variant="outline"
        class="w-3xs"
        disabled={loading}
        onclick={() => handleLogin("credentials")}
      >
        {#if loading && providerId === "credentials"}
          <LoaderPinwheel class="animate-spin" />
        {:else}
          <User class="mr-2 size-5" />
        {/if}
        <span class="flex flex-1 justify-center">Continue as Guest</span>
      </Button>

      <p class="text-center text-sm text-muted-foreground mx-auto">
        By clicking continue, you agree to our

        <a href="/terms" class="underline underline-offset-4 hover:text-primary"
          >Terms of Service</a
        >

        and

        <a
          href="/privacy-policy"
          class="underline underline-offset-4 hover:text-primary"
          >Privacy Policy</a
        >.
      </p>

      <p class="text-center text-sm text-muted-foreground mx-auto">
        Have questions? Check out our

        <a href="/faq" class="underline underline-offset-4 hover:text-primary"
          >FAQ</a
        >.
      </p>
    </div>
  </div>
</div>

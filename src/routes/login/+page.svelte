<script lang="ts">
  import { goto } from "$app/navigation";
  import { signIn, type SignInOptions } from "@auth/sveltekit/client";
  import { Button } from "$lib/components/ui/button";
  import { LoaderPinwheel, User } from "@lucide/svelte";
  import { useProfileQuery } from "$lib/queries/profile";
  import "$lib/assets/css/login.css";

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

<div class="login-wrapper">
  <div class="login-container">
    <img src="/actz.png" alt="App Logo" class="login-logo" />

    <div class="login-actions">
      <Button
        class="google-btn"
        variant="outline"
        disabled={loading}
        onclick={() => handleLogin("google")}
      >
        {#if loading && providerId === "google"}
          <LoaderPinwheel class="loader-icon" />
        {:else}
          <img
            src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png?width=20&height=20&format=auto"
            alt="Google Icon"
            class="google-icon"
          />
        {/if}
        <span class="btn-text-center">Continue with Google</span>
      </Button>

      <Button
        variant="outline"
        class="guest-btn"
        disabled={loading}
        onclick={() => handleLogin("credentials")}
      >
        {#if loading && providerId === "credentials"}
          <LoaderPinwheel class="loader-icon" />
        {:else}
          <User class="user-icon" />
        {/if}
        <span class="btn-text-center">Continue as Guest</span>
      </Button>

      <p class="terms-text">
        By clicking continue, you agree to our

        <a href="/terms" class="link-text"
          >Terms of Service</a
        >

        and

        <a
          href="/privacy-policy"
          class="link-text"
          >Privacy Policy</a
        >.
      </p>

      <p class="terms-text">
        Have questions? Check out our

        <a href="/faq" class="link-text"
          >FAQ</a
        >.
      </p>
    </div>
  </div>
</div>

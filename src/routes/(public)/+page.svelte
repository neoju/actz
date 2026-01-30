<script lang="ts">
  import { signIn } from "@auth/sveltekit/client";
  import { Button } from "$lib/components/ui/button";
  import { User } from "@lucide/svelte";

  async function handleGuestLogin() {
    const deviceId = localStorage.getItem("actz_device_id");
    // If deviceId is null, the backend will create a new user.
    await signIn("credentials", { guestUserId: deviceId });
  }
</script>

<div class="flex-1 flex flex-col items-center justify-center space-y-10">
  <img src="/actz.png" alt="App Logo" class="w-48 h-48" />

  <div class="w-full text-center flex-col items-center flex space-y-4">
    <Button
      onclick={() => signIn("google")}
      variant="outline"
      class="border-[#e84133]! text-[#e84133]! w-3xs"
    >
      <img
        src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png?width=20&height=20&format=auto"
        alt="Google Icon"
        class="size-5"
      />
      <span class="flex flex-1 justify-center">Continue with Google</span>
    </Button>

    <Button onclick={handleGuestLogin} variant="outline" class="w-3xs">
      <User class="mr-2 size-5" />
      <span class="flex flex-1 justify-center">Continue as Guest</span>
    </Button>

            <p class="text-center text-sm text-muted-foreground mx-auto">

                By clicking continue, you agree to our

                <a

                    href="/terms"

                    class="underline underline-offset-4 hover:text-primary"

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

                <a

                    href="/faq"

                    class="underline underline-offset-4 hover:text-primary">FAQ</a

                >.

            </p>
  </div>
</div>

<script lang="ts">
    import { signIn } from "@auth/sveltekit/client";
    import { Button } from "$lib/components/ui/button";
    import {} from "@lucide/svelte";
</script>

<div class="flex-1 flex flex-col items-center justify-center space-y-12">
    <img src="/actz.png" alt="App Logo" class="w-48 h-48" />

    <div class="w-full text-center space-y-4">
        <Button
            onclick={() => signIn("google")}
            variant="outline"
            class="border-[#e84133]! text-[#e84133]!"
        >
            <img
                src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png?width=20&height=20&format=auto"
                alt="Google Icon"
                class="size-5"
            />
            <span class="flex flex-1 justify-center">Continue with Google</span>
        </Button>
        <p class="text-center text-sm text-muted-foreground mt-5">
            By clicking continue, you agree to our <a
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
    </div>
</div>

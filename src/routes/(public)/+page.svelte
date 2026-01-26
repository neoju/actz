<script lang="ts">
    import { signIn } from "@auth/sveltekit/client";
    import { Button } from "$lib/components/ui/button";
    import {} from "@lucide/svelte";
</script>

<div class="flex-1 flex flex-col items-center justify-center space-y-12">
    <div
        class="border-4 border-foreground p-8 rounded-3xl rotate-3 hover:rotate-0 transition-transform duration-300"
    >
        <h1 class="text-7xl font-bold tracking-tighter">Actz</h1>
    </div>

    <div class="w-full text-center space-y-4 mt-20">
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

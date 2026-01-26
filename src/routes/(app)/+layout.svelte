<script lang="ts">
    import { page } from '$app/stores';
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    let { children } = $props();

    onMount(() => {
        if (browser) {
            const session = $page.data.session;
            if (session?.user) {
                if (session.user.id) localStorage.setItem('user_id', session.user.id);
                document.cookie = "auth_state=true; path=/; max-age=31536000; SameSite=Lax";
            }
        }
    });
</script>

<div class="min-h-screen bg-muted/20 text-foreground font-sans antialiased flex justify-center">
    <div class="w-full max-w-md min-h-screen bg-background shadow-2xl overflow-hidden relative flex flex-col border-x border-border">
        <main class="flex-1 p-6 flex flex-col">
            {@render children()}
        </main>
    </div>
</div>

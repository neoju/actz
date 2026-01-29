<script lang="ts">
    import { page } from "$app/state";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { onNavigate } from "$app/navigation";
    import { goto } from "$app/navigation";
    import { signOut } from "@auth/sveltekit/client";
    import ModeSwitcher from "$lib/components/mode-switcher.svelte";
    import { Button } from "$lib/components/ui/button";
    import * as Sheet from "$lib/components/ui/sheet";
    import {
        Menu,
        House,
        Settings,
        LogOut,
        BookSearch,
        MapPin,
    } from "@lucide/svelte";
    import { ModeWatcher } from "mode-watcher";
    import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
    import { Toaster } from "$lib/components/ui/sonner";
    import "$lib/styles/view-transitions.css";
    import { resetTour, startCompleteTour } from "$lib/tour";

    let { children } = $props();
    let isMenuOpen = $state(false);

    // Enable view transitions with fade animation
    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });

    // Initialize TanStack Query Client
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                gcTime: 1000 * 60 * 10, // 10 minutes
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    });

    onMount(() => {
        if (browser) {
            const session = page.data.session;
            if (session?.user) {
                if (session.user.id)
                    localStorage.setItem("user_id", session.user.id);
                document.cookie =
                    "auth_state=true; path=/; max-age=31536000; SameSite=Lax";
            }
        }
    });

    function handleNavigation(path: string) {
        isMenuOpen = false;
        goto(path);
    }

    function handleRestartTour() {
        isMenuOpen = false;
        resetTour();
        goto("/dashboard").then(() => {
            setTimeout(() => {
                startCompleteTour();
            }, 500);
        });
    }

    async function handleLogout() {
        isMenuOpen = false;
        await signOut({ callbackUrl: "/" });
    }
</script>

<ModeWatcher />
<Toaster richColors position="top-center" />
<QueryClientProvider client={queryClient}>
    <div
        class="min-h-screen bg-muted/20 text-foreground font-sans antialiased flex justify-center"
    >
        <div
            class="w-full max-w-md min-h-screen bg-background shadow-2xl overflow-hidden relative flex flex-col border-x border-border"
        >
            <!-- Mobile Header with Hamburger Menu -->
            <header
                class="fixed max-w-md w-screen mx-auto top-0 z-40 bg-background border-b border-border p-4 flex items-end justify-end"
            >
                <Sheet.Root bind:open={isMenuOpen}>
                    <ModeSwitcher />
                    <Sheet.Trigger>
                        <Button
                            variant="outline"
                            size="icon"
                            class="ml-2 bg-primary!"
                            data-tour="menu-button"
                        >
                            <Menu class="h-5 w-5" />
                        </Button>
                    </Sheet.Trigger>
                    <Sheet.Content
                        side="right"
                        class="w-75 sm:w-100"
                        data-tour="menu-sheet"
                    >
                        <Sheet.Header>
                            <Sheet.Title>Menu</Sheet.Title>
                            <Sheet.Description>
                                Navigate through the app
                            </Sheet.Description>
                        </Sheet.Header>
                        <div class="flex flex-col gap-4 mt-6">
                            <Button
                                variant="ghost"
                                class="justify-start gap-3"
                                onclick={() => handleNavigation("/dashboard")}
                            >
                                <House class="h-5 w-5" />
                                <span>Home</span>
                            </Button>
                            <Button
                                variant="ghost"
                                class="justify-start gap-3"
                                onclick={() => handleNavigation("/exercises")}
                                data-tour="library-link"
                            >
                                <BookSearch class="h-5 w-5" />
                                <span>Library</span>
                            </Button>
                            <Button
                                variant="ghost"
                                class="justify-start gap-3"
                                onclick={() => handleNavigation("/settings")}
                                data-tour="settings-link"
                            >
                                <Settings class="h-5 w-5" />
                                <span>Settings</span>
                            </Button>
                            <div class="border-t border-border my-2"></div>
                            <Button
                                variant="ghost"
                                class="justify-start gap-3"
                                onclick={handleRestartTour}
                            >
                                <MapPin class="h-5 w-5" />
                                <span>Restart Guided Tour</span>
                            </Button>
                            <Button
                                variant="ghost"
                                class="justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onclick={handleLogout}
                            >
                                <LogOut class="h-5 w-5" />
                                <span>Logout</span>
                            </Button>
                        </div>
                    </Sheet.Content>
                </Sheet.Root>
            </header>

            <main
                class="flex-1 p-4 pt-20 flex flex-col overflow-auto page-transition"
            >
                {@render children()}
            </main>
        </div>
    </div>
</QueryClientProvider>

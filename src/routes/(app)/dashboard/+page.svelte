<script lang="ts">
    import { Button, buttonVariants } from "$lib/components/ui/button";
    import {
        Popover,
        PopoverContent,
        PopoverTrigger,
    } from "$lib/components/ui/popover";
    import { goto } from "$app/navigation";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Menu, Play, Settings, LogOut } from "@lucide/svelte";
    import { signOut } from "@auth/sveltekit/client";

    function goToWorkout() {
        goto("/workout");
    }
</script>

<div class="flex flex-col h-full space-y-8 relative pb-20 pt-4">
    <!-- Header / Start Action -->
    <div class="space-y-4">
        <h1 class="text-3xl font-bold tracking-tight">Welcome Back</h1>
        <Card
            class="bg-primary/90 text-primary-foreground border-none shadow-lg shadow-primary/20"
        >
            <CardContent
                class="p-6 flex flex-col items-center justify-center space-y-4"
            >
                <div class="text-lg font-medium opacity-90">
                    Ready for today?
                </div>
                <Button
                    variant="secondary"
                    size="lg"
                    class="w-full font-bold text-lg h-14"
                    onclick={goToWorkout}
                >
                    <Play class="mr-2 h-5 w-5 fill-current" />
                    Start Workout
                </Button>
            </CardContent>
        </Card>
    </div>

    <!-- Timeline -->
    <div class="space-y-4">
        <h2 class="text-xl font-semibold">Schedule</h2>
        <div class="relative pl-8 border-l-2 border-muted space-y-8 ml-2">
            <!-- Past Day 1 -->
            <div class="relative">
                <div
                    class="absolute -left-10.25 bg-muted rounded-full w-5 h-5 border-4 border-background"
                ></div>
                <div class="flex flex-col">
                    <span class="text-sm text-muted-foreground font-medium"
                        >Mon</span
                    >
                    <span
                        class="font-medium line-through decoration-muted-foreground/50 text-muted-foreground"
                        >Upper Body Power</span
                    >
                </div>
            </div>
            <!-- Past Day 2 -->
            <div class="relative">
                <div
                    class="absolute -left-10.25 bg-muted rounded-full w-5 h-5 border-4 border-background"
                ></div>
                <div class="flex flex-col">
                    <span class="text-sm text-muted-foreground font-medium"
                        >Tue</span
                    >
                    <span class="text-foreground font-medium">Rest Day</span>
                </div>
            </div>
            <!-- Today -->
            <div class="relative">
                <div
                    class="absolute -left-10.75 top-1 bg-primary rounded-full w-6 h-6 border-4 border-background shadow-lg shadow-primary/30"
                ></div>
                <button
                    onclick={goToWorkout}
                    class="flex flex-col items-start bg-card border rounded-xl p-4 w-full shadow-sm active:scale-[0.98] transition-transform text-left hover:border-primary/50 group"
                >
                    <span
                        class="text-sm text-primary font-bold uppercase tracking-wider mb-1"
                        >Today</span
                    >
                    <span
                        class="text-lg font-bold group-hover:text-primary transition-colors"
                        >Push Day: Chest & Triceps</span
                    >
                    <span class="text-sm text-muted-foreground mt-1"
                        >45 mins • 6 Exercises</span
                    >
                </button>
            </div>
            <!-- Future -->
            <div class="relative opacity-50">
                <div
                    class="absolute -left-10.25 bg-muted rounded-full w-5 h-5 border-4 border-background"
                ></div>
                <div class="flex flex-col">
                    <span class="text-sm text-muted-foreground font-medium"
                        >Thu</span
                    >
                    <span class="text-foreground font-medium">Leg Day</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Fixed Bottom Actions -->
    <div
        class="fixed bottom-0 left-0 right-0 p-6 flex justify-center bg-linear-to-t from-background to-transparent pt-12"
    >
        <Popover>
            <PopoverTrigger
                class={buttonVariants({
                    variant: "ghost",
                    size: "icon",
                    className:
                        "rounded-full h-12 w-12 bg-muted/50 backdrop-blur-sm border",
                })}
            >
                <Menu class="h-6 w-6" />
                <span class="sr-only">Menu</span>
            </PopoverTrigger>
            <PopoverContent
                class="w-56 mb-2 data-[state=open]:slide-in-from-bottom-50 data-[state=closed]:slide-out-to-bottom-50 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 duration-400"
            >
                <div class="grid gap-1">
                    <Button
                        variant="ghost"
                        class="justify-start px-2 font-normal"
                        href="/settings"
                    >
                        <Settings class="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                    <Button
                        variant="ghost"
                        class="justify-start px-2 font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
                        onclick={() => signOut()}
                    >
                        <LogOut class="mr-2 h-4 w-4" />
                        Log out
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    </div>
</div>

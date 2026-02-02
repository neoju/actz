<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { cn } from "$lib/utils";

    interface Props {
        /**
         * Callback when the action completes (after 1 second hold)
         */
        onAction: () => void;
        /**
         * Optional: Show progress bar during hold
         * @default true
         */
        showProgress?: boolean;
        /**
         * Optional: Hold duration in milliseconds
         * @default 1000
         */
        holdDuration?: number;
        /**
         * Additional classes for the button
         */
        class?: string;
        /**
         * Button variant
         */
        variant?:
            | "default"
            | "destructive"
            | "outline"
            | "secondary"
            | "ghost"
            | "link";
        /**
         * Button size
         */
        size?: "default" | "sm" | "lg" | "icon";
        /**
         * Disabled state
         */
        disabled?: boolean;
        /**
         * Button children/content
         */
        children?: any;
    }

    let {
        onAction,
        showProgress = true,
        holdDuration = 1000,
        class: className,
        variant,
        size,
        disabled,
        children,
        ...restProps
    }: Props & Record<string, any> = $props();

    let isPressed = $state(false);
    let pressTimer: ReturnType<typeof setTimeout> | null = null;

    function handlePressStart(e: Event) {
        e.preventDefault();
        isPressed = true;
        pressTimer = setTimeout(() => {
            onAction();
            isPressed = false;
        }, holdDuration);
    }

    function handlePressEnd() {
        if (isPressed && pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
            isPressed = false;
        }
    }
</script>

<Button
    onmousedown={handlePressStart}
    onmouseup={handlePressEnd}
    onmouseleave={handlePressEnd}
    ontouchstart={handlePressStart}
    ontouchend={handlePressEnd}
    {variant}
    {size}
    {disabled}
    class={cn(
        "relative overflow-hidden transition-transform select-none touch-none",
        className,
    )}
    {...restProps}
>
    <div
        class={cn(
            "absolute left-0 top-0 z-11 -translate-x-full w-full h-full",
            "transition-transform duration-1000 bg-white/50",
            isPressed && "translate-x-0",
        )}
    ></div>
    <span class="relative z-10">
        {@render children?.()}
    </span>
</Button>

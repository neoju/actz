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
    }: Props = $props();

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
        isPressed && "scale-95",
        className,
    )}
    style={isPressed
        ? `transition-duration: ${holdDuration}ms; transition-timing-function: linear;`
        : ""}
    {...restProps}
>
    {#if showProgress && isPressed}
        <div
            class="absolute left-0 top-0 bottom-0 bg-white/20 h-full transition-all ease-linear"
            style={isPressed
                ? `width: 100%; transition-duration: ${holdDuration}ms;`
                : "width: 0; transition-duration: 0ms;"}
        ></div>
    {/if}
    <span class="relative z-10">
        {@render children?.()}
    </span>
</Button>

# View Transitions Guide

This guide explains how view transitions are implemented in the ACTZ fitness application using SvelteKit and the View Transition API.

## Overview

View transitions provide smooth, animated page transitions that enhance the user experience. Our implementation uses the native View Transition API with a fade animation effect, similar to modern web applications.

## Features

✅ **Smooth fade animations** - Pages fade out and fade in during navigation
✅ **Native API** - Uses browser's View Transition API for optimal performance
✅ **Automatic** - Works automatically on all navigation
✅ **Fallback support** - Gracefully degrades in unsupported browsers
✅ **Accessibility** - Respects `prefers-reduced-motion` settings
✅ **Multiple styles** - Supports fade, slide, and scale animations
✅ **TypeScript support** - Fully typed with proper declarations

## Browser Support

The View Transition API is supported in:
- ✅ Chrome 111+
- ✅ Edge 111+
- ✅ Opera 97+
- ⚠️ Safari - Limited support (experimental)
- ⚠️ Firefox - Not yet supported

For unsupported browsers, navigation works normally without the animation.

## How It Works

### Implementation

The view transition is implemented in `src/routes/(app)/+layout.svelte`:

```typescript
import { onNavigate } from "$app/navigation";

onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
        document.startViewTransition(async () => {
            resolve();
            await navigation.complete;
        });
    });
});
```

### Animation Flow

1. **User navigates** - Clicks a link or calls `goto()`
2. **Check support** - Verifies browser supports View Transition API
3. **Capture old state** - Browser captures current page snapshot
4. **Start transition** - `startViewTransition` begins animation
5. **Navigate** - SvelteKit performs navigation
6. **Capture new state** - Browser captures new page snapshot
7. **Animate** - CSS animations fade old out, fade new in
8. **Complete** - Transition finishes, new page is interactive

## Animation Styles

### Default Fade (Current)

Smooth fade-in/fade-out effect:
- Duration: 300ms
- Easing: ease-in-out
- Old page fades out while new page fades in

### Available Styles

The CSS file includes multiple animation presets:

#### 1. Fade (Default)
```css
/* Implemented by default */
animation: fade-out 0.3s, fade-in 0.3s;
```

#### 2. Slide
```css
/* Add to container: class="transition-slide" */
animation: slide-out-left, slide-in-right;
```

#### 3. Scale
```css
/* Add to container: class="transition-scale" */
animation: scale-out, scale-in;
```

#### 4. Duration Variants
```css
/* Fast: 200ms */
class="transition-fast"

/* Slow: 600ms */
class="transition-slow"

/* Smooth easing */
class="transition-smooth"
```

## Customization

### Change Animation Duration

Edit `src/lib/styles/view-transitions.css`:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s; /* Change to desired duration */
}
```

### Change Animation Style

To use a different animation style, update the layout:

```svelte
<main class="transition-slide">
  {@render children()}
</main>
```

### Disable for Specific Routes

You can conditionally disable transitions:

```typescript
onNavigate((navigation) => {
    // Skip transitions for specific routes
    if (navigation.to?.url.pathname === '/no-transition') {
        return;
    }
    
    if (!document.startViewTransition) return;
    
    return new Promise((resolve) => {
        document.startViewTransition(async () => {
            resolve();
            await navigation.complete;
        });
    });
});
```

## Files Structure

```
actz/
├── src/
│   ├── app.d.ts                              # View Transition API types
│   ├── lib/
│   │   ├── styles/
│   │   │   └── view-transitions.css          # Animation styles
│   │   └── utils/
│   │       └── view-transitions.ts           # Utility functions
│   └── routes/
│       └── (app)/
│           └── +layout.svelte                # Implementation
└── docs/
    └── VIEW_TRANSITIONS.md                   # This file
```

## API Reference

### TypeScript Types

```typescript
interface ViewTransition {
  finished: Promise<void>;
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
}

interface Document {
  startViewTransition(callback: () => Promise<void> | void): ViewTransition;
}
```

### Utility Functions

Located in `src/lib/utils/view-transitions.ts`:

```typescript
// Check browser support
supportsViewTransitions(): boolean

// Apply transition with config
applyViewTransition(
  callback: () => Promise<void> | void,
  config?: TransitionConfig
): Promise<void> | void

// Get transition class name
getTransitionClassName(type: TransitionType): string

// Preset configurations
TRANSITION_PRESETS: {
  fade: { duration: 300, type: 'fade' }
  slide: { duration: 400, type: 'slide' }
  scale: { duration: 350, type: 'scale' }
  fast: { duration: 200, type: 'fade' }
  slow: { duration: 600, type: 'fade' }
}
```

## CSS Classes

### Base Classes
- `.page-transition` - Applied to main content area

### Animation Types
- `.transition-fade` - Fade animation (default)
- `.transition-slide` - Slide animation
- `.transition-scale` - Scale animation

### Duration Modifiers
- `.transition-fast` - 200ms duration
- `.transition-slow` - 600ms duration
- `.transition-smooth` - Smooth cubic-bezier easing

## Accessibility

### Reduced Motion

The implementation respects user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.01ms !important;
  }
}
```

Users who prefer reduced motion will experience instant transitions.

### Keyboard Navigation

View transitions work seamlessly with keyboard navigation and don't interfere with focus management.

## Performance

### Optimization Tips

1. **Keep animations short** - 200-400ms is ideal
2. **Use GPU-accelerated properties** - opacity, transform
3. **Avoid layout shifts** - Maintain consistent layouts between pages
4. **Test on mobile** - Ensure smooth performance on lower-end devices

### Monitoring

The browser DevTools Performance panel can show view transition timing:
1. Open DevTools → Performance
2. Start recording
3. Navigate between pages
4. Look for "View Transition" markers

## Debugging

### Enable Logging

Add to `+layout.svelte`:

```typescript
onNavigate((navigation) => {
    console.log('Navigation:', navigation.from?.url, '→', navigation.to?.url);
    
    if (!document.startViewTransition) {
        console.warn('View Transitions not supported');
        return;
    }
    
    return new Promise((resolve) => {
        const transition = document.startViewTransition(async () => {
            resolve();
            await navigation.complete;
        });
        
        transition.ready.then(() => console.log('Transition ready'));
        transition.finished.then(() => console.log('Transition finished'));
    });
});
```

### Common Issues

**Issue**: Transitions not working
- **Solution**: Check browser support, ensure View Transition API is available

**Issue**: Janky animations
- **Solution**: Reduce animation duration or disable on slow devices

**Issue**: Flash of content
- **Solution**: Ensure consistent layout between pages

## Examples

### Basic Usage

Already implemented and working in the app!

### Custom Transition Per Route

```typescript
onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    
    const path = navigation.to?.url.pathname;
    let className = 'transition-fade';
    
    if (path === '/dashboard') {
        className = 'transition-slide';
    } else if (path === '/settings') {
        className = 'transition-scale';
    }
    
    document.body.className = className;
    
    return new Promise((resolve) => {
        document.startViewTransition(async () => {
            resolve();
            await navigation.complete;
        });
    });
});
```

### Skip Transition on Back Navigation

```typescript
onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    
    // Skip transition when going back
    if (navigation.type === 'popstate') {
        return;
    }
    
    return new Promise((resolve) => {
        document.startViewTransition(async () => {
            resolve();
            await navigation.complete;
        });
    });
});
```

## Testing

### Manual Testing

1. Navigate between pages
2. Observe smooth fade effect
3. Test with keyboard (Tab, Enter)
4. Test browser back/forward buttons
5. Check on different browsers

### Visual Regression

Consider using tools like:
- Percy
- Chromatic
- BackstopJS

## Resources

- [MDN - View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [Svelte Blog - View Transitions](https://svelte.dev/blog/view-transitions)
- [Chrome Developers - View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions/)

## Future Enhancements

Potential improvements:
- [ ] Route-specific animations
- [ ] Shared element transitions
- [ ] Gesture-based transitions
- [ ] Loading state integration
- [ ] Animation choreography
- [ ] Custom transition curves

## Support

For questions or issues:
1. Check browser compatibility
2. Review console for errors
3. Test in supported browser
4. Check DevTools Performance panel

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
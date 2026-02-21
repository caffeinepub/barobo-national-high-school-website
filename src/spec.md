# Specification

## Summary
**Goal:** Allow page title text to optionally blink via a reusable, reduced-motion-safe CSS animation, without changing existing pages by default.

**Planned changes:**
- Add a reusable global CSS blink animation exposed via a simple class name that can be applied to headings/elements.
- Ensure the blink animation is disabled when the user has `prefers-reduced-motion` enabled.
- Update the `PageHeader` component to accept an optional prop (e.g., `blinkTitle?: boolean`, default `false`) that applies the blink class to the `<h1>` title only when enabled.

**User-visible outcome:** Page titles can be configured to blink on specific pages/components that opt in, while users with reduced-motion preference will see no blinking.

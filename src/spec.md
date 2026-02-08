# Specification

## Summary
**Goal:** Ensure the Home page Facebook presence block reliably renders the embedded Facebook Page timeline/posts on desktop/tablet while keeping current mobile behavior and the existing two-column, height-matching layout.

**Planned changes:**
- Update the Home page Facebook embed implementation to render reliably on desktop/tablet viewports (>= 768px) while continuing to work on mobile (< 768px).
- Make embed load vs. failure detection deterministic so the fallback link only appears when the embed genuinely fails (e.g., blocked network/privacy/embed error), without false triggers on desktop.
- Preserve the current md+ two-column layout and keep the Facebook block height constrained to match the rendered height of the Weather Forecast section; keep small-screen stacking without artificial height constraints.

**User-visible outcome:** On desktop/tablet, visitors can see the school’s embedded Facebook Page timeline/posts (instead of an empty area), with the fallback link only appearing when the embed truly cannot load, and the Home page layout/section heights remain as intended.

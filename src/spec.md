# Specification

## Summary
**Goal:** Replace the Home page principal photo with the user’s newly uploaded principal image.

**Planned changes:**
- Process the newly uploaded principal image into a clean, sharp 1:1 square crop (600×600), centered on the face with slight natural headroom, framed head-and-shoulders and cropped slightly above the elbows.
- Save/update the processed asset at `frontend/public/assets/generated/principal-photo.dim_600x600.png` and keep the Home page referencing `/assets/generated/principal-photo.dim_600x600.png` without other layout/style changes.

**User-visible outcome:** The Home page shows the updated principal portrait in the Welcome/Principal section with the same sizing and layout as before.

# Specification

## Summary
**Goal:** Prevent Super Admin access from being lost after canister upgrades and provide a safe recovery/initialization path, while making the Admin Dashboard reliably show the user’s Principal ID and correct role after login.

**Planned changes:**
- Persist the Super Admin Principal and initialization state in the backend so upgrades do not reset Super Admin access.
- Add an authenticated Super Admin recovery/initialization backend API that:
  - Sets the caller as Super Admin only when the canister is uninitialized and the caller is non-anonymous
  - Refuses to change Super Admin when already initialized (unless the caller is already Super Admin)
- Update the Admin Dashboard to always display the currently logged-in Principal ID with a copy-to-clipboard control and clear “Copied” feedback.
- Add a “Super Admin Recovery” section in the Admin Dashboard for logged-in users who are not Super Admin, allowing them to trigger recovery and showing clear English success/error messages.
- Ensure a role-initializing shared call runs after successful Internet Identity login so the dashboard consistently resolves and displays the correct role (not stuck as “Unknown”/“Guest”).

**User-visible outcome:** After logging in, users can always see and copy their Principal ID, the dashboard reliably shows the correct role, and eligible users can regain Super Admin access via a built-in recovery flow; Super Admin access persists across canister upgrades.

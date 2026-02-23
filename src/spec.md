# Specification

## Summary
**Goal:** Restore Super Admin access for the principal ID 'fiawz-svdcq-fsplo-srina-bia3r-kdxu5-c4tcj-e7bkm-w3gex-cvpvm-2qe'.

**Planned changes:**
- Hardcode the principal ID 'fiawz-svdcq-fsplo-srina-bia3r-kdxu5-c4tcj-e7bkm-w3gex-cvpvm-2qe' as the Super Admin in the backend initialization logic
- Add a recovery mechanism in the AdminDashboardPage to restore Super Admin role if lost
- Ensure Super Admin access persists across canister upgrades

**User-visible outcome:** The user can authenticate with their principal ID and automatically regain full Super Admin access to all admin features including User Management, Analytics Dashboard, and Storage Monitor.

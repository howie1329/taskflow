# Onboarding

Route: `/app/onboarding`

## Purpose

Guide new users through initial setup so workspace behavior is configured before normal use.

## Current Behavior

- Wizard-driven onboarding flow
- Collects profile and preference essentials
- Includes AI-related defaults/visibility settings
- Persists completion state for downstream gating

## Data

- Convex-backed through user preference/profile mutations
- Entry component: `components/onboarding/onboarding-wizard.tsx`

## Notes

- Keep onboarding focused on first-run essentials.
- Advanced controls should stay in `/app/settings`.

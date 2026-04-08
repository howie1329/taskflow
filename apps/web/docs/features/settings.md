# Settings

Route: `/app/settings`

## Purpose

User-level controls for profile, workspace preferences, and AI defaults.

## Current Behavior

- Profile management
- Preference controls (task and chat behavior)
- AI settings panel for default model and related controls

## Data

- Convex-backed user state:
  - `userProfiles`
  - `userPreferences`
- Settings layout composed in `components/settings/settings-layout`

## Notes

- Preferences directly influence UI behavior in other features (for example AI chat detail visibility).

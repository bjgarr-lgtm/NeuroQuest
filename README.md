# NeuroQuest — Expo React Native Starter (Neon Storybook)

**Flow**: Splash → Character Select → Companion Select → Start Day → Activities (timer) → End Day → Trends & Tips.  
**Style**: Neon / pixel-inspired panels & chips. All colors/tokens in `src/theme/`.

## Game Plan
- [GAME_SPEC.md](docs/GAME_SPEC.md)
- [Wireflow](docs/WIREFLOW.md)
- [Balance](docs/balance.yaml)

## Quick start
```bash
npm i -g expo-cli   # if needed
npm install
npx expo start
```
- Open in iOS Simulator, Android Emulator, or Expo Go on device.
- Art slots in `assets/` (e.g., `hero-bambi.png`, `comp-bird.png`). Replace with canon images (same filenames).

## Structure
- `App.js` — loads pixel font + mounts navigation.
- `src/navigation/` — Stack navigator (no headers).
- `src/screens/` — 6 screens matching your flow.
- `src/components/` — NeonCard, Button, Chip, ProgressBar, TaskRow.
- `src/state/` — tiny store with AsyncStorage; Habitica-like quests & XP, LAMP-like logs/trends.
- `src/theme/` — color tokens & basic styles.

## Next
- Achievements & collectibles
- Companion animations (Lottie) + sound SFX
- CSV export of logs
- Auth + remote sync (Supabase or similar)
- Push notifications for streaks

© 2025 NeuroQuest — MIT License

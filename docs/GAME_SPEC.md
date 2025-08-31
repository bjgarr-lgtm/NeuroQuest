# NeuroQuest — Finch-like Productivity Game (MVP)

**Vision:** A cozy self‑care game where real-life micro‑actions level up your hero, grow a companion, and unlock cosmetics. Neon‑storybook vibe, chunky UI, juicy feedback.

## Core Loop
Morning **Start Day** → pick Main + Side quests → Day: **Quests & Focus Timers** (rewards: XP, Coins, Pet Affection) → Evening **End Day** → Summary, streak, reward → Meta: **Shop/Stickies/Skins**.

## Pillars
1) Tiny action → instant delight (sparkles + sfx + numbers go up)  
2) Reduce executive load (3 obvious choices, smart defaults)  
3) Forgiving & cozy (fail‑forward timers, no scolding)  
4) Persistent growth (level, pet affection/evolution, streaks)

## Systems
- **Hero:** level, xp, coins, hearts(energy), mood(0–100)
- **Pet:** affection, mood, level, skins; reacts to actions within 200ms
- **Quests:** main | side | bonus | small, each with reward {xp, coins, mood}
- **Timers:** 5/10/20 min; completion = quest; early stop = half reward
- **Streaks:** soft decay; weekly boss (optional large quest)
- **Economy:** cosmetic-only shop (stickers/skins)

## MVP Screens
Splash → Character → Companion → Start Day → Home/Dashboard → Daily Quests → Focus Timer → Pet Room → Shop → End Day → Trends

## “Feels like a game” Acceptance
- Completing quest/timer triggers 3 feedbacks: visual + audio + visible state change
- Pet emote bubble appears on actions (❤️😺✨), affection increases
- Progress/coin/affection meters visibly animate

## Tech
- Expo + React Navigation (single NavigationContainer)
- Game store (context/reducer): startDay, completeQuest, addFocus, setParty, petInteract
- AsyncStorage; deterministic daily quest roll

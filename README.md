# Bambi’s ADHD Quest — Vertical Slice (Web Demo)

Cozy, storybook prototype of the daily loop:
Title → Companion → Quest Board → Timer → Loot

## Live on Cloudflare Pages
- Build command: none
- Output dir: `public`
- Optional endpoint: `/health` (Pages Function)

## Local dev
```bash
# from repo root
python3 -m http.server -d public 5173
# open http://localhost:5173
```

## Notes
- Saves to localStorage (`adhdQuestV2`).
- Works offline via a tiny service worker.
- Art is placeholder-friendly: drop canon art into `public/assets/img/` keeping filenames to re-skin instantly.

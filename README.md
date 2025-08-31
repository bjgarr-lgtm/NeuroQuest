# NeuroQuest — Mockup Skin (Playable Web Demo)

**Look & feel:** neon‑pixel UI to match your mockups.  
**Flow:** Character → Companion → Start Day → Activities (timer) → End Day → Trends & Tips.  
**Deploy:** Cloudflare Pages (no build step). Output directory: `public`.

## Files
- `public/index.html` — SPA with the full flow.
- `public/themes/neuroquest.css` — neon pixel style (colors match mockups).
- `public/app.js` — state, quests, budget, timer, end‑day summary, 14/30‑day trends.
- `public/assets/img/*` — characters/companions (replace with canon art using same filenames).
- `public/sw.js`, `public/manifest.webmanifest` — offline support.
- `functions/health.js` — Pages Function for `/health`.

## Data model (localStorage key `neuroquest_v2`)
```ts
{
  date: "YYYY-MM-DD",
  xp: number, coins: number, level: number,
  character: string|null, companion: string|null,
  quests: { main: Task[], side: Task[], bonus: Task[] },
  cleaning: { small: string[], weekly: string[], monthly: string[] },
  coop: string[],
  budget: { pouch: number, tx: { name: string, amt: number, time: epoch }[] },
  logs: { [date: string]: { done: {txt:string, where:string, t:number}[], minutes:number, stuck:number, tx:any[] } },
  trends: { streak:number, last:string|null }
}
```

## Extend
- Replace fonts with your own pixel face or embed locally.
- Hook up real analytics export (CSV/JSON) — all logs live in localStorage.
- Add collectibles and achievements with thresholds (e.g., “Kept Child Alive”).


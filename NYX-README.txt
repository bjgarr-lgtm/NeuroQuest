
NYX — NeuroQuest Assistant & Economy Keeper (v1.0)
==================================================

What you get
------------
- Floating chat widget (✦ chat) with supportive tips and commands:
  /stats  /tips  /quests  /help
- Auto-claim tracking for quests, journal entries, hydration, breathe ring.
- Unified tracker API: window.NQ.track(event, payload)
  Events: 'quest:complete', 'journal:entry', 'hydrate:log', 'breathe:ring', 'streak:day'
- Rewards economy: grants XP & Gold per action; triggers built-in level up (storage.js).
- Voice: uses the browser SpeechSynthesis API if available.
- Gentle confetti hook: dispatches 'nq:reward' custom event which your fx can listen to.

Drop‑in install
---------------
1) Copy js/bot/nyx.js and js/bot/nyx.css into your project, and ensure this line exists before </body> in index.html:
   <script type="module" src="js/bot/nyx.js"></script>

2) (Optional) Emit these custom events in your app and NYX will auto‑reward:
   document.dispatchEvent(new CustomEvent('nq:quest-complete',{detail:{id:'id',title:'Title',tier:'main'}}));
   document.dispatchEvent(new CustomEvent('nq:journal-saved'));
   document.dispatchEvent(new CustomEvent('nq:hydrate'));
   document.dispatchEvent(new CustomEvent('nq:breathe'));

3) (Optional) Tag buttons with attributes and NYX will auto‑claim on click:
   <button data-quest-complete="Do the dishes">Done</button>
   <button data-journal-save>Save</button>
   <button data-hydrate>Drank water</button>

Notes
-----
- Uses your existing storage.js with xp/gold/level; no schema changes.
- You can programmatically award things via window.NQ.track('quest:complete',{tier:'side',title:'Stretch'}).
- Name/voice: change the constants in js/bot/nyx.js if you prefer.


LLM hookup:
- Deploy the included Cloudflare Worker in /nyx_worker (wrangler publish)
- In your app, set window.NYX_LLM_ENDPOINT = 'https://<your-worker>.workers.dev'; or run `localStorage.setItem('nyx_llm_endpoint','https://...')`

---
NYX Command Control (actions)
- New files: js/bot/nyx-actions.js, js/bot/nyx-planner.js
- NYX can now create/complete quests, add journal entries, log hydration, start breathe ring, add shopping items, and add budget items.
- Natural language is mapped to actions with LLM (if endpoint set) or simple regex fallback.
- Undo: `/undo` reverts the last change. List actions: `/actions`. Manual run: `/run {"steps":[{"action":"quest.create","params":{"title":"laundry"}}]}`

Events emitted (modules can listen and update their UIs):
- nq:quest-create  (detail: quest)
- nq:quest-complete(detail: {id,title,tier})
- nq:journal-saved
- nq:hydrate
- nq:breathe
- nq:shopping-add  (detail: {item,qty,unit})
- nq:budget-add    (detail: {item,amount,category})
- nq:action        (detail: audit entry)
- nq:state:reloaded (after state save/undo)

Voice commands:
- /voice list — show available voices
- /voice set <exact voice name> — pick voice (saved in localStorage)

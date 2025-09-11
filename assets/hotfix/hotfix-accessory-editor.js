// assets/hotfix/hotfix-accessory-editor.js
// SootheBirb – Accessory Editor (drag / resize / rotate / persist)
// Works on the Character screen without touching your core renderer.
// It wraps ANY accessory <img> found inside the hero preview and
// makes it editable. State is saved in localStorage.

(function () {
  const LS_KEY = 'sb_v26_acc_overrides';

  // --- tiny state helper ----------------------------------------------------
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } },
    set(v) { NQ.commit(s);(LS_KEY, JSON.stringify(v)); }
  };

  // Inject minimal styles so you don't have to edit styles.css
  const css = `
    .acc-edit-wrap{position:absolute; inset:0; pointer-events:none;}
    .acc-edit-box{position:absolute; border:1px dashed rgba(0,255,255,.6); border-radius:10px;
                  box-shadow:0 0 0 2px rgba(0,255,255,.15) inset; pointer-events:auto; touch-action:none}
    .acc-edit-handle{position:absolute; width:14px; height:14px; border-radius:50%;
                     border:2px solid #00ffff99; background:#001a24; cursor:nwse-resize}
    .acc-edit-handle.br{right:-8px; bottom:-8px}
    .acc-edit-handle.tr{right:-8px; top:-8px}
    .acc-edit-rot{position:absolute; left:50%; transform:translate(-50%,-26px);
                  width:18px; height:18px; border-radius:50%; border:2px solid #00ffff99;
                  background:#001a24; cursor:grab}
    .acc-toolbar{position:absolute; right:8px; bottom:8px; display:flex; gap:6px; z-index:4}
    .acc-toolbar button{font:inherit; padding:6px 10px; border-radius:10px; border:1px solid #6cf; background:#071018; color:#dff; opacity:.9}
    .acc-toolbar button:hover{opacity:1}
    .acc-tip{position:absolute; left:8px; bottom:8px; color:#9ff; opacity:.8; font-size:.8rem}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Utility: find the hero preview box we can overlay
  function findHeroStage() {
    // Try a few likely containers in priority order
    const candidates = [
      '#characterStage',
      '.hero-stage',
      '[data-hero-stage]',
      // fallback: the first image inside "Your Hero" card
      ...Array.from(document.querySelectorAll('section, .cardish, .panel'))
        .filter(s => /your\s+hero/i.test(s.textContent || ''))
        .map(s => s.querySelector('img'))
    ].filter(Boolean);

    // Return a DOMRect provider and the container node that holds the accessory <img>
    let stageImg = null;
    for (const c of candidates) {
      const el = typeof c === 'string' ? document.querySelector(c) : c;
      if (el && el.getBoundingClientRect) { stageImg = el; break; }
    }
    if (!stageImg) stageImg = document.querySelector('.hero img, .hero-card img, .char-card img');
    if (!stageImg) return null;

    // Where are accessories being appended? Try immediate parent first.
    const host = stageImg.closest('.hero, .hero-card, .hero-stage, section, .cardish') || stageImg.parentElement;
    return { img: stageImg, host };
  }

  // Get a stable key for storing this hero’s overrides
  function currentHeroKey() {
    // try to read from the top HUD (party/you) or character card captions.
    const you = document.querySelector('#partyMini [data-you], .party-banner [data-you]');
    const name = (you && (you.dataset.name || you.textContent || '').trim()) ||
                 (document.querySelector('#heroName')?.value || '').trim() ||
                 'defaultHero';
    return name || 'defaultHero';
  }

  // Scan accessories in the hero stage and wrap them with editable boxes
  function mountEditor() {
    const stage = findHeroStage();
    if (!stage) return;

    // Create overlay layer once
    let wrap = stage.host.querySelector('.acc-edit-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'acc-edit-wrap';
      wrap.style.position = 'absolute';
      // Anchor over the hero image box
      const posParent = stage.img.parentElement;
      posParent.style.position = 'relative';
      posParent.appendChild(wrap);

      // Helper UI (toolbar + tip)
      const bar = document.createElement('div');
      bar.className = 'acc-toolbar';
      bar.innerHTML = `
        <button type="button" data-acc="nudgeUp">↑</button>
        <button type="button" data-acc="nudgeDown">↓</button>
        <button type="button" data-acc="nudgeLeft">←</button>
        <button type="button" data-acc="nudgeRight">→</button>
        <button type="button" data-acc="smaller">−</button>
        <button type="button" data-acc="bigger">＋</button>
        <button type="button" data-acc="rotateLeft">⟲</button>
        <button type="button" data-acc="rotateRight">⟳</button>
        <button type="button" data-acc="save">Save</button>
        <button type="button" data-acc="reset">Reset</button>`;
      wrap.appendChild(bar);

      const tip = document.createElement('div');
      tip.className = 'acc-tip';
      tip.textContent = 'Tip: Drag box to move • corner to resize • wheel to rotate • Shift-wheel = fine';
      wrap.appendChild(tip);
    } else {
      wrap.innerHTML = wrap.innerHTML; // keep toolbar
    }

    // Identify accessory sprites inside the stage host
    const accImgs = stage.host.querySelectorAll('img, canvas, .acc-sprite');
    const heroRect = stage.img.getBoundingClientRect();

    // Only keep elements that sit on top of the hero and aren’t the hero image itself
    const sprites = Array.from(accImgs).filter(el => el !== stage.img && intersects(el.getBoundingClientRect(), heroRect));

    // Load existing overrides
    const overrides = store.get();
    const key = currentHeroKey();
    overrides[key] = overrides[key] || {};

    // For each sprite, create a draggable box linked to its transform
    sprites.forEach((sprite, idx) => {
      const tag = sprite.getAttribute('data-acc-id') || `acc${idx}`;

      const box = document.createElement('div');
      box.className = 'acc-edit-box';
      wrap.appendChild(box);

      // Initial position/size from overrides or from element rect
      const sr = sprite.getBoundingClientRect();
      const o = overrides[key][tag] || {
        x: sr.left - heroRect.left,
        y: sr.top  - heroRect.top,
        w: sr.width,
        h: sr.height,
        r: 0,
        s: 1
      };

      applyBox(box, o);
      bindSprite(sprite, box, o);

      // Handles
      addHandle(box, 'br'); // resize
      addHandle(box, 'tr'); // alternative handle top-right
      addRotator(box);

      // Save buttons
      wrap.querySelectorAll('[data-acc]').forEach(btn => {
        btn.onclick = () => {
          const step = (btn.dataset.acc.includes('nudge') ? 2 : 1);
          switch (btn.dataset.acc) {
            case 'nudgeUp':    o.y -= 2; break;
            case 'nudgeDown':  o.y += 2; break;
            case 'nudgeLeft':  o.x -= 2; break;
            case 'nudgeRight': o.x += 2; break;
            case 'smaller':    o.s *= 0.95; break;
            case 'bigger':     o.s *= 1.05; break;
            case 'rotateLeft': o.r -= 2; break;
            case 'rotateRight':o.r += 2; break;
            case 'reset':      overrides[key][tag] = undefined; store.set(overrides); location.reload(); return;
            case 'save':       overrides[key][tag] = o; store.set(overrides); flash(stage.host); return;
          }
          applyBox(box, o); syncToSprite(sprite, box, o, heroRect);
        };
      });

      // mouse wheel = rotate (shift = fine)
      box.addEventListener('wheel', e => {
        e.preventDefault();
        o.r += (e.shiftKey ? 1 : 5) * (e.deltaY > 0 ? 1 : -1);
        applyBox(box, o); syncToSprite(sprite, box, o, heroRect);
      }, { passive: false });
    });

    function addHandle(box, pos) {
      const h = document.createElement('div');
      h.className = `acc-edit-handle ${pos}`;
      box.appendChild(h);
      drag(h, (dx, dy) => {
        const rect = box.getBoundingClientRect();
        const nw = Math.max(10, rect.width + dx);
        const nh = Math.max(10, rect.height + dy);
        const o = box._acc; o.w = nw; o.h = nh;
        applyBox(box, o); syncToSprite(box._sprite, box, o, heroRect);
      });
    }

    function addRotator(box) {
      const r = document.createElement('div');
      r.className = 'acc-edit-rot';
      box.appendChild(r);
      let startA = 0;
      drag(r, (dx, dy, start, now, e) => {
        if (start) startA = box._acc.r || 0;
        const da = dx * 0.6;
        box._acc.r = startA + da;
        applyBox(box, box._acc); syncToSprite(box._sprite, box, box._acc, heroRect);
      });
    }

    function drag(el, ondrag) {
      let sx=0, sy=0, active=false, start=true;
      const move = e => {
        if (!active) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        ondrag(x - sx, y - sy, start, false, e);
        start = false; sx = x; sy = y;
      };
      const up = () => { active=false; document.removeEventListener('mousemove', move); document.removeEventListener('touchmove', move); };
      const down = e => {
        active=true; start=true;
        sx = e.touches ? e.touches[0].clientX : e.clientX;
        sy = e.touches ? e.touches[0].clientY : e.clientY;
        document.addEventListener('mousemove', move); document.addEventListener('touchmove', move, {passive:false});
      };
      el.addEventListener('mousedown', down); el.addEventListener('touchstart', down, {passive:true});
    }

    function bindSprite(sprite, box, o) {
      box._sprite = sprite; box._acc = o;

      // Drag the whole box
      drag(box, (dx, dy) => {
        o.x += dx; o.y += dy;
        applyBox(box, o); syncToSprite(sprite, box, o, heroRect);
      });

      // Initial sync
      syncToSprite(sprite, box, o, heroRect);
    }

    function applyBox(box, o) {
      box.style.left = `${o.x}px`;
      box.style.top  = `${o.y}px`;
      box.style.width  = `${o.w}px`;
      box.style.height = `${o.h}px`;
      box.style.transform = `rotate(${o.r}deg)`;
    }

    function syncToSprite(sprite, box, o, heroRect) {
      // translate box-space to sprite CSS transform relative to its current top-left anchor
      const s = `translate(${o.x}px, ${o.y}px) rotate(${o.r}deg) scale(${o.s})`;
      // if the sprite was absolutely positioned we keep that; else, force absolute within its host
      sprite.style.position = 'absolute';
      sprite.style.left = '0px';
      sprite.style.top  = '0px';
      sprite.style.transformOrigin = 'top left';
      sprite.style.transform = s;
      sprite.style.width  = `${o.w}px`;
      sprite.style.height = `${o.h}px`;
      sprite.style.pointerEvents = 'auto';
    }

    function intersects(a, b) {
      return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
    }

    function flash(host) {
      host.style.boxShadow = '0 0 0 2px #0ff, inset 0 0 30px rgba(0,255,255,.25)';
      setTimeout(()=> host.style.boxShadow='', 350);
    }
  }

  // Re-mount when the Character route shows up
  function onRoute() {
    const hash = (location.hash || '#').toLowerCase();
    if (hash.includes('character') || hash.includes('characters')) {
      // Let the app render first
      setTimeout(mountEditor, 80);
    }
  }
  window.addEventListener('hashchange', onRoute);
  document.addEventListener('DOMContentLoaded', onRoute);

  // Also expose a manual hook if you re-render via SPA without hash
  window.__sbAccessoryEditorMount = mountEditor;
})();

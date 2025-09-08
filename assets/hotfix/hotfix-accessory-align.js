/* assets/hotfix/hotfix-accessory-align.js
   Accessory Drag/Resize/Rotate hotfix for SootheBirb v2.6
   - Works against whatever your Character view renders.
   - Persists per-accessory transform in localStorage (sb_v26_acc_xforms).
   - Applies transforms automatically on page render & on DOM mutations.
*/
(() => {
  const LS_KEY = 'sb_v26_acc_xforms';

  const getState = () => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch { return {}; }
  };
  const setState = (obj) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(obj)); }
    catch (e) {
      console.warn('Accessory xform save failed, trimming…', e);
      // very defensive: drop oldest half if we ever hit quota here
      const entries = Object.entries(obj).slice(-200);
      localStorage.setItem(LS_KEY, JSON.stringify(Object.fromEntries(entries)));
    }
  };

  // A “key” that stays the same every time we see the same accessory img.
  function keyForImg(img) {
    // Prefer an explicit data key if your app provides one.
    return (
      img.getAttribute('data-acc-key') ||
      img.getAttribute('data-key') ||
      // fall back to src (works for data: and file names)
      (img.src || '').slice(0, 256)
    );
  }

  // Return the portrait container for the current Character page.
  function findPortraitRoot() {
    // try several common containers used in your builds
    const sel = [
      '.hero-portrait', '.char-hero', '.character-hero',
      '.avatar-wrap', '.avatar', '.portrait', '#heroPreview',
      '.cardish .avatar', '.cardish .portrait'
    ];
    for (const s of sel) {
      const el = document.querySelector(s);
      if (el) return el;
    }
    // last resort: the first cardish that contains a single <img>
    const fallback = Array.from(document.querySelectorAll('.cardish'))
      .find(c => c.querySelector('img'));
    return fallback || null;
  }

  // Return all accessory <img> nodes rendered over the portrait.
  function findAccessoryImgs(root) {
    if (!root) return [];
    // typical classes in prior builds: .acc, [data-acc], .accessory img
    let imgs = root.querySelectorAll('img.acc, img[data-acc], .accessory img');
    imgs = imgs.length ? imgs : root.querySelectorAll('img');
    // Heuristic: exclude the base portrait (largest area) and keep the small overlays.
    const arr = Array.from(imgs);
    if (arr.length <= 1) return [];
    // compute areas
    const areas = arr.map(i => (i.naturalWidth || i.width) * (i.naturalHeight || i.height));
    const maxArea = Math.max(...areas);
    return arr.filter(i => {
      const a = (i.naturalWidth || i.width) * (i.naturalHeight || i.height);
      return a < maxArea * 0.8; // anything significantly smaller than the big portrait
    });
  }

  // Apply saved transforms to an accessory <img>
  function applyXform(img) {
    const st = getState();
    const key = keyForImg(img);
    const xf = st[key];
    if (!xf) return;
    img.style.position = 'absolute';
    img.style.left = (xf.x || 0) + 'px';
    img.style.top = (xf.y || 0) + 'px';
    img.style.transformOrigin = 'center center';
    img.style.transform =
      `translate(0,0) scale(${xf.s || 1}) rotate(${xf.r || 0}deg)` +
      (xf.flip ? ' scaleX(-1)' : '');
    img.style.zIndex = xf.z != null ? String(xf.z) : '5';
    img.dataset.xfApplied = '1';
  }

  // Scan and apply transforms to all accessories currently in DOM.
  function reapplyAll() {
    const root = findPortraitRoot();
    if (!root) return;
    root.style.position = root.style.position || 'relative';
    findAccessoryImgs(root).forEach(applyXform);
  }

  // Lightweight editor UI
  function ensureEditor() {
    // only on Character route
    const hash = (location.hash || '').toLowerCase();
    if (!/character/.test(hash)) return;

    const root = findPortraitRoot();
    if (!root || document.getElementById('accEditorToolbar')) return;

    root.style.position = root.style.position || 'relative';

    // Toolbar
    const bar = document.createElement('div');
    bar.id = 'accEditorToolbar';
    bar.className = 'acc-toolbar';
    bar.innerHTML = `
      <button class="acc-btn" data-acc-edit>✥ Edit accessories</button>
      <span class="acc-help">Drag to move • Shift + Drag corner to rotate •
      Scroll to scale • D to delete • F to flip • [ / ] to z-order</span>
    `;
    root.appendChild(bar);

    let editMode = false;
    let active = null;

    function toggleEdit() {
      editMode = !editMode;
      bar.querySelector('[data-acc-edit]').classList.toggle('on', editMode);
      const overlays = findAccessoryImgs(root);
      overlays.forEach(img => {
        img.style.pointerEvents = editMode ? 'auto' : '';
        img.classList.toggle('acc-editable', editMode);
        // guarantee absolute so we can position
        img.style.position = 'absolute';
        img.style.zIndex = img.style.zIndex || '5';
        // if first time, center it gently
        if (!img.dataset.xfApplied && !img.style.left) {
          const r = root.getBoundingClientRect();
          const ir = img.getBoundingClientRect();
          img.style.left = Math.max(0, (r.width - ir.width) / 2) + 'px';
          img.style.top = Math.max(0, (r.height - ir.height) / 2) + 'px';
        }
      });
    }

    bar.querySelector('[data-acc-edit]').addEventListener('click', () => {
      toggleEdit();
    });

    // dragging/rotating/scaling
    let drag = { on: false, dx: 0, dy: 0, startX: 0, startY: 0, baseLeft: 0, baseTop: 0 };
    function onDown(e) {
      if (!editMode) return;
      const t = e.target;
      if (!(t instanceof HTMLElement) || t.tagName !== 'IMG') return;
      if (!findAccessoryImgs(root).includes(t)) return;
      active = t;
      const rect = active.getBoundingClientRect();
      drag.on = true;
      drag.startX = e.clientX;
      drag.startY = e.clientY;
      drag.baseLeft = parseFloat(active.style.left || '0');
      drag.baseTop = parseFloat(active.style.top || '0');
      e.preventDefault();
    }
    function onMove(e) {
      if (!drag.on || !active) return;
      const shift = e.shiftKey;
      if (!shift) {
        // move
        const nx = drag.baseLeft + (e.clientX - drag.startX);
        const ny = drag.baseTop + (e.clientY - drag.startY);
        active.style.left = nx + 'px';
        active.style.top = ny + 'px';
      } else {
        // rotate if Shift is held: angle by horizontal delta
        const dx = (e.clientX - drag.startX);
        const cur = parseFloat(active.dataset.rot || '0');
        const ang = cur + dx * 0.2;
        active.dataset.rot = String(ang);
        const s = parseFloat(active.dataset.scale || '1');
        const flip = active.dataset.flip === '1';
        active.style.transform =
          `translate(0,0) scale(${s}) rotate(${ang}deg)` + (flip ? ' scaleX(-1)' : '');
      }
    }
    function onUp() {
      if (!active) return;
      // save xform
      const st = getState();
      const k = keyForImg(active);
      const s = parseFloat(active.dataset.scale || '1');
      const r = parseFloat(active.dataset.rot || '0');
      const z = parseInt(active.style.zIndex || '5', 10);
      const flip = active.dataset.flip === '1';
      st[k] = {
        x: Math.round(parseFloat(active.style.left || '0')),
        y: Math.round(parseFloat(active.style.top || '0')),
        s: Math.round(s * 1000) / 1000,
        r: Math.round(r * 10) / 10,
        z,
        flip
      };
      setState(st);
      drag.on = false;
    }

    // scale with wheel
    function onWheel(e) {
      if (!editMode || !active) return;
      e.preventDefault();
      const cur = parseFloat(active.dataset.scale || '1');
      const next = Math.min(5, Math.max(0.15, cur + (e.deltaY < 0 ? 0.05 : -0.05)));
      active.dataset.scale = String(next);
      const r = parseFloat(active.dataset.rot || '0');
      const flip = active.dataset.flip === '1';
      active.style.transform =
        `translate(0,0) scale(${next}) rotate(${r}deg)` + (flip ? ' scaleX(-1)' : '');
    }

    // hotkeys for delete/flip/z-index
    function onKey(e) {
      if (!editMode || !active) return;
      if (e.key === 'f' || e.key === 'F') {
        const flip = active.dataset.flip !== '1';
        active.dataset.flip = flip ? '1' : '0';
        const s = parseFloat(active.dataset.scale || '1');
        const r = parseFloat(active.dataset.rot || '0');
        active.style.transform =
          `translate(0,0) scale(${s}) rotate(${r}deg)` + (flip ? ' scaleX(-1)' : '');
      }
      if (e.key === 'd' || e.key === 'D' || e.key === 'Backspace') {
        const st = getState();
        delete st[keyForImg(active)];
        setState(st);
        active.remove();
        active = null;
      }
      if (e.key === '[' || e.key === ']') {
        const z = parseInt(active.style.zIndex || '5', 10) + (e.key === ']' ? 1 : -1);
        active.style.zIndex = String(Math.max(1, Math.min(99, z)));
      }
    }

    // pointer events on the portrait area only
    root.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    root.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
  }

  // Reapply transforms whenever the Character view is shown or changes.
  function onRouteOrMutate() {
    reapplyAll();
    ensureEditor();
  }

  // Observe portrait subtree (your app re-renders on selection)
  const obs = new MutationObserver(() => onRouteOrMutate());
  const boot = () => {
    onRouteOrMutate();
    const root = findPortraitRoot();
    if (root) obs.observe(root, { childList: true, subtree: true, attributes: true });
  };

  // Route changes + boot
  window.addEventListener('hashchange', boot);
  document.addEventListener('DOMContentLoaded', boot);
})();

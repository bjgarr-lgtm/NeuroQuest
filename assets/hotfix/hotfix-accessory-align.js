/* SootheBirb – Accessory Editor Hotfix
 * Drop-in for v2.6 builds. Positions editor under the upload row, doubles
 * the portrait preview, and adds drag / wheel resize / shift+wheel rotate.
 * No binary is stored in localStorage – only transforms & z-order.
 */

(function () {
  const KEY = 'sb_acc_hotfix_v1';
  const S = {
    load() {
      try { return JSON.parse(localStorage.getItem(KEY)) || { items: [] }; }
      catch { return { items: [] }; }
    },
    save(state) { try { NQ.commit(s);(KEY, JSON.stringify(state)); } catch {} }
  };

  // Utility ---------------------------------------------------------------
  function q(sel, root = document) { return root.querySelector(sel); }
  function qa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
  function make(tag, cls) { const el = document.createElement(tag); if (cls) el.className = cls; return el; }

  // Find the characters page by looking for the heading text we render today
  function onCharactersPage() {
    const hash = (location.hash || '').toLowerCase();
    if (hash.includes('character')) return true;
    // older builds used #characters
    if (hash.includes('characters')) return true;
    return false;
  }

  // Hide the legacy floating nudge buttons inside the hero panel (the tiny ↑ ↓ ← → + – … row)
  function hideLegacyNudgers(root) {
    const heroPanel = root.querySelector('[class*="hero"], [data-hero], .hero'); // best-effort
    if (!heroPanel) return;
    qa('button, .btn, .tiny, .nudge', heroPanel).forEach(b => {
      const txt = (b.textContent || '').trim();
      if (/^[↑↓←→+–-]$/.test(txt) || ['↶','↷'].includes(txt)) b.style.display = 'none';
    });
  }

  // Build our editor UI just below the “Upload Accessory / Change Hero Portrait” row
  function injectEditor() {
    const view = q('#view');
    if (!view) return;

    // If we already injected, just ensure it’s visible and return
    if (q('.accfix-wrap', view)) { q('.accfix-wrap', view).style.display = ''; return; }

    // Try to locate an existing hero portrait panel; if not found, we’ll make our own light wrapper
    let heroSlot = q('.hero-slot, #heroSlot, [data-hero-slot]', view);
    if (!heroSlot) {
      heroSlot = make('div', 'hero-slot accfix-hero-slot');
      heroSlot.innerHTML = `
        <h3 class="dash">Your Hero</h3>
        <div class="accfix-stage">
          <img id="accfixHero" class="accfix-hero" alt="Hero portrait" />
          <div id="accfixLayer" class="accfix-layer" aria-live="polite"></div>
        </div>
        <div class="accfix-row">
          <label class="accfix-file"><span>Change Hero Portrait</span>
            <input id="accfixHeroFile" type="file" accept="image/*">
          </label>
          <label class="accfix-file"><span>Upload Accessory PNG</span>
            <input id="accfixAccFile" type="file" accept="image/png,image/*">
          </label>
          <button id="accfixAdd" class="btn small">Add Accessory</button>
        </div>
      `;
      // Put our slot at the top of the page so it’s obvious
      view.prepend(heroSlot);
    }

    // Accessory Editor controls (below uploads)
    const wrap = make('section', 'accfix-wrap cardish');
    wrap.innerHTML = `
      <h4 class="dash">Accessory Editor</h4>
      <div class="accfix-tip">Tip: drag accessory to move • mouse wheel = resize • Shift+wheel = rotate</div>
      <div class="accfix-toolbar">
        <button data-act="front"  class="btn tiny">Bring Front</button>
        <button data-act="back"   class="btn tiny">Send Back</button>
        <button data-act="save"   class="btn tiny primary">Save</button>
        <button data-act="remove" class="btn tiny danger">Remove</button>
      </div>
      <div class="accfix-status" id="accfixStatus">No accessory selected.</div>
    `;
    heroSlot.appendChild(wrap);

    // Wire up file inputs
    const heroImg = q('#accfixHero', heroSlot);
    const layer   = q('#accfixLayer', heroSlot);
    const heroIn  = q('#accfixHeroFile', heroSlot);
    const accIn   = q('#accfixAccFile', heroSlot);
    const addBtn  = q('#accfixAdd', heroSlot);
    const status  = q('#accfixStatus', heroSlot);

    // Double the preview (CSS also scales the slot)
    heroImg.style.width = 'auto';

    // Allow setting hero portrait without storing binary
    heroIn.addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      heroImg.src = url;
      heroImg.onload = () => {
        // fit into stage height
        const st = q('.accfix-stage', heroSlot);
        if (st) {
          const maxH = st.clientHeight - 8;
          heroImg.style.maxHeight = maxH + 'px';
        }
      };
    });

    // Local state (not persisted) for currently selected accessory node
    let selected = null;
    function select(node) {
      qa('.accfix-acc', layer).forEach(n => n.classList.remove('is-selected'));
      selected = node || null;
      if (selected) selected.classList.add('is-selected');
      status.textContent = selected ? 'Accessory selected.' : 'No accessory selected.';
    }

    // Drag / wheel handlers
    function makeDraggable(node) {
      let startX = 0, startY = 0, startL = 0, startT = 0;
      node.addEventListener('pointerdown', (ev) => {
        select(node);
        node.setPointerCapture(ev.pointerId);
        startX = ev.clientX; startY = ev.clientY;
        const r = node.getBoundingClientRect();
        const parent = node.parentElement.getBoundingClientRect();
        startL = r.left - parent.left;
        startT = r.top  - parent.top;
        node.dataset.dragging = '1';
      });
      node.addEventListener('pointermove', (ev) => {
        if (node.dataset.dragging !== '1') return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        node.style.left = Math.round(startL + dx) + 'px';
        node.style.top  = Math.round(startT + dy) + 'px';
      });
      node.addEventListener('pointerup',   () => node.dataset.dragging = '');
      node.addEventListener('pointercancel', () => node.dataset.dragging = '');

      node.addEventListener('wheel', (ev) => {
        ev.preventDefault();
        let scale = parseFloat(node.dataset.scale || '1');
        let rot   = parseFloat(node.dataset.rot   || '0');
        if (ev.shiftKey) {
          // rotate
          rot += (ev.deltaY > 0 ?  -4 : 4);
        } else {
          // scale
          scale += (ev.deltaY > 0 ? -0.06 : 0.06);
          scale = Math.max(0.2, Math.min(3, scale));
        }
        node.dataset.scale = String(scale);
        node.dataset.rot   = String(rot);
        node.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`;
      }, { passive: false });
    }

    function addAccessoryFromFile(file) {
      if (!file) return;
      const url = URL.createObjectURL(file);
      const img = make('img', 'accfix-acc');
      img.src = url;
      img.alt = file.name;
      img.draggable = false;

      // default position = center
      const st = q('.accfix-stage', heroSlot);
      const rect = st.getBoundingClientRect();
      img.style.left = rect.width / 2 + 'px';
      img.style.top  = rect.height / 2 + 'px';
      img.dataset.scale = '1';
      img.dataset.rot   = '0';
      img.style.transform = 'translate(-50%, -50%) scale(1)';

      img.addEventListener('pointerdown', () => select(img));
      makeDraggable(img);
      layer.appendChild(img);
      select(img);
    }

    addBtn.addEventListener('click', () => {
      const f = accIn.files && accIn.files[0];
      if (!f) { status.textContent = 'Choose a PNG first.'; return; }
      addAccessoryFromFile(f);
      accIn.value = '';
    });

    // Toolbar actions
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      if (!selected && b.dataset.act !== 'save') { status.textContent = 'Select an accessory first.'; return; }

      if (b.dataset.act === 'front') {
        layer.appendChild(selected);
      } else if (b.dataset.act === 'back') {
        layer.insertBefore(selected, layer.firstChild);
      } else if (b.dataset.act === 'remove') {
        selected.remove(); select(null);
      } else if (b.dataset.act === 'save') {
        // Save only transforms/ordering; no binary data
        const items = qa('.accfix-acc', layer).map(n => ({
          left: parseFloat(n.style.left),
          top:  parseFloat(n.style.top),
          scale: parseFloat(n.dataset.scale || '1'),
          rot: parseFloat(n.dataset.rot || '0'),
          // fileName kept for debugging; not used for reload
          name: n.alt || ''
        }));
        const state = S.load();
        state.items = items;
        S.save(state);
        status.textContent = 'Saved accessory layout (session only).';
      }
    });

    // Try to hide the old nudge row if it exists
    hideLegacyNudgers(view);
  }

  // Enlarge the preview slot with CSS class on the parent
  function enlargePreviewSlot() {
    const view = q('#view'); if (!view) return;
    view.classList.add('accfix-big');
  }

  // Router hook
  function maybeInit() {
    if (!onCharactersPage()) return;
    enlargePreviewSlot();
    injectEditor();
  }

  window.addEventListener('hashchange', () => setTimeout(maybeInit, 30));
  document.addEventListener('DOMContentLoaded', () => setTimeout(maybeInit, 30));
})();

/* SootheBirb – Accessory Align Hotfix (v2)
 * - Hides legacy micro-buttons in the hero panel
 * - Reorders 'Change Hero Portrait' ABOVE 'Upload Accessory PNG'
 * - Leaves the rest of the editor intact
 */
(function(){
  function q(sel, root=document){ return root.querySelector(sel); }
  function qa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  function hideLegacyButtons(){
    const heroPanel = q('[class*="hero"], [data-hero], .hero');
    if (!heroPanel) return;
    qa('button, .btn, .tiny, .nudge', heroPanel).forEach(b => {
      const txt = (b.textContent || '').trim();
      if (/^[↑↓←→+–-]$/.test(txt) || ['↶','↷'].includes(txt)) b.style.display = 'none';
    });
    // Hide any floating tip text
    qa('.accfix-tip, .acc-tip').forEach(el => el.style.display = 'none');
  }

  function reorderFileRows(){
    const view = q('#view') || document.body;
    // Find rows by their label text
    const rows = qa('.file-row, .accfix-file, .field', view);
    let heroRow=null, accRow=null;
    rows.forEach(r => {
      const t = (r.textContent || '').toLowerCase();
      if (!heroRow && (t.includes('change hero portrait') || t.includes('hero portrait'))) heroRow=r;
      if (!accRow && (t.includes('upload accessory') || t.includes('add accessory'))) accRow=r;
    });
    if (heroRow && accRow) {
      const parent = accRow.parentElement;
      if (parent && parent.contains(heroRow)) {
        // place heroRow before accRow
        parent.insertBefore(heroRow, accRow);
      }
    }
  }

  function onRoute(){
    const hash=(location.hash||'#').toLowerCase();
    if (hash.includes('character') || hash.includes('characters')) {
      setTimeout(()=>{ hideLegacyButtons(); reorderFileRows(); }, 120);
    }
  }
  window.addEventListener('hashchange', onRoute);
  document.addEventListener('DOMContentLoaded', onRoute);

  // Run once just in case
  setTimeout(()=>{ hideLegacyButtons(); reorderFileRows(); }, 200);
})();
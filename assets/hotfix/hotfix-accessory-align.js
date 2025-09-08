/* --- SootheBirb UI Polish v3 ---
 * Reorder hero > accessory upload rows, hide old tips,
 * and restore a simple "Companions" uploader/preview.
 */
(function(){
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  function moveHeroRowAboveAccessory(){
    const view = $('#view')||document;
    // Collect candidate rows
    const rows = $$('.row, .file-row, .accfix-row, .accfix-file, .field', view);
    let heroRow=null, accRow=null;
    rows.forEach(r=>{
      const t=(r.textContent||'').toLowerCase();
      if(!heroRow && (t.includes('change hero portrait') || t.includes('hero portrait'))) heroRow=r;
      if(!accRow && (t.includes('upload accessory') || t.includes('add accessory'))) accRow=r;
    });
    if(heroRow && accRow && heroRow.compareDocumentPosition && (accRow.compareDocumentPosition(heroRow) & Node.DOCUMENT_POSITION_FOLLOWING)){
      // Insert heroRow right before accRow
      accRow.parentElement.insertBefore(heroRow, accRow);
    }
  }

  function hideLegacyMicroButtons(){
    const heroPanel = $('[class*="hero"], [data-hero], .hero');
    if(!heroPanel) return;
    $$('.tiny, .nudge, button', heroPanel).forEach(b=>{
      const txt=(b.textContent||'').trim();
      if(/^[↑↓←→+–-]$/.test(txt) || ['↶','↷'].includes(txt)) b.style.display='none';
    });
    $$('.accfix-tip, .acc-tip').forEach(el=>el.style.display='none');
  }

  // --- Companions uploader --------------------------------------------------
  function ensureCompanionPanel(){
    // Find right column by heading text "Companions"
    let compTitle = Array.from(document.querySelectorAll('h2,h3')).find(h=>/companions/i.test(h.textContent||''));
    if(!compTitle) return;
    let panel = compTitle.parentElement;
    // Create uploader UI if missing
    if(!$('.companion-panel', panel)){
      const wrap = document.createElement('div');
      wrap.className='companion-panel';
      wrap.innerHTML = `
        <div class="companion-uploader">
          <strong>Add Companion PNG</strong>
          <input type="file" accept="image/png,image/*" id="cmpUpload">
          <button id="cmpAdd" class="btn">Add</button>
        </div>
        <div class="companion-list" id="cmpList" aria-live="polite"></div>
      `;
      panel.appendChild(wrap);

      const input = $('#cmpUpload', wrap);
      const btn = $('#cmpAdd', wrap);
      const list = $('#cmpList', wrap);

      function addCompanion(file){
        if(!file) return;
        const url = URL.createObjectURL(file);
        const item = document.createElement('div');
        item.className='companion-item';
        item.innerHTML = `<img alt="Companion" src="${url}"><button class="btn btn-small">Remove</button>`;
        item.querySelector('button').addEventListener('click', ()=>{
          URL.revokeObjectURL(url);
          item.remove();
          persist();
        });
        list.appendChild(item);
        persist();
      }

      function persist(){
        try{
          const imgs = Array.from(list.querySelectorAll('img')).map(img=>img.src);
          localStorage.setItem('sb_companions_v1', JSON.stringify(imgs));
        }catch{}
      }

      function restore(){
        try{
          const imgs = JSON.parse(localStorage.getItem('sb_companions_v1')||'[]');
          imgs.forEach(src=>{
            const item = document.createElement('div');
            item.className='companion-item';
            item.innerHTML = `<img alt="Companion" src="${src}"><button class="btn btn-small">Remove</button>`;
            item.querySelector('button').addEventListener('click', ()=>{
              item.remove(); persist();
            });
            list.appendChild(item);
          });
        }catch{}
      }

      btn.addEventListener('click', ()=>addCompanion(input.files && input.files[0]));
      input.addEventListener('change', ()=>{/* optional auto-add on select */});

      restore();
    }
  }

  function run(){
    moveHeroRowAboveAccessory();
    hideLegacyMicroButtons();
    ensureCompanionPanel();
  }

  function onRoute(){
    const h=(location.hash||'#').toLowerCase();
    if(h.includes('character')) setTimeout(run, 120);
  }
  window.addEventListener('hashchange', onRoute);
  document.addEventListener('DOMContentLoaded', onRoute);
  setTimeout(run, 200);
})();
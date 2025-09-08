/**
 * Character & Companions — clean accessory editor
 * Drop-in replacement. No other files required.
 * - Drag accessory with mouse
 * - Wheel to scale; Shift+Wheel to rotate
 * - Bring front / Send back / Save / Remove
 * - Persists to localStorage key 'sb_v26_state'
 */

const KEY = 'sb_v26_state';
function loadState() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function saveState(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {/* ignore quota here; images are external */}
}

function ensureWardrobe(s){
  if(!s.wardrobe) s.wardrobe = {};
  if(!s.wardrobe.hero) s.wardrobe.hero = { portrait: '', acc: [] };
  if(!Array.isArray(s.wardrobe.hero.acc)) s.wardrobe.hero.acc = [];
  return s;
}

function h(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }

function clamp(v,min,max){ return Math.max(min, Math.min(max,v)); }

export default function renderCharacter(viewEl){
  const state = ensureWardrobe(loadState());
  const hero = state.wardrobe.hero;

  // ---------- layout ----------
  viewEl.innerHTML = '';
  const wrap = h(`
    <section class="character-grid">
      <div class="panel hero-side">
        <h3>Your Hero</h3>
        <div class="portrait-wrap" id="portraitWrap">
          <img id="heroBase" class="hero-base" alt="Hero portrait"/>
          <div id="accLayer" class="acc-layer"></div>
        </div>

        <div class="file-row">
          <label class="secondary" style="padding:6px 10px;border-radius:10px;display:inline-flex;gap:8px;align-items:center;">
            <span>Upload Accessory PNG</span>
            <input id="accFile" type="file" accept="image/png" style="display:none"/>
          </label>
          <button id="addAcc" class="primary">Add Accessory</button>

          <label class="secondary" style="padding:6px 10px;border-radius:10px;display:inline-flex;gap:8px;align-items:center;margin-left:auto;">
            <span>Change Hero Portrait</span>
            <input id="heroFile" type="file" accept="image/*" style="display:none"/>
          </label>
        </div>

        <div class="acc-editor">
          <div class="hint">Tip: <b>drag</b> to move • <b>wheel</b> to resize • <b>Shift + wheel</b> to rotate • Arrows to nudge</div>
          <div class="toolbar">
            <button id="bringFront" class="secondary">Bring Front</button>
            <button id="sendBack"  class="secondary">Send Back</button>
            <button id="saveAcc"   class="primary">Save</button>
            <button id="removeAcc" class="danger">Remove</button>
          </div>
          <small id="accMeta">No accessory selected.</small>
        </div>
      </div>

      <div class="panel companions-side">
        <h3>Companions</h3>
        <p><small>Unchanged here — this panel just keeps your current companions flow.</small></p>
      </div>
    </section>
  `);
  viewEl.appendChild(wrap);

  // ---------- elements ----------
  const heroBase = wrap.querySelector('#heroBase');
  const accLayer = wrap.querySelector('#accLayer');
  const accFile  = wrap.querySelector('#accFile');
  const addBtn   = wrap.querySelector('#addAcc');
  const heroFile = wrap.querySelector('#heroFile');

  const bringFront = wrap.querySelector('#bringFront');
  const sendBack   = wrap.querySelector('#sendBack');
  const saveBtn    = wrap.querySelector('#saveAcc');
  const removeBtn  = wrap.querySelector('#removeAcc');
  const meta       = wrap.querySelector('#accMeta');

  // ---------- load hero portrait ----------
  function setHeroSrc(src){
    if(src) heroBase.src = src;
    else heroBase.src = hero.portrait || 'assets/hero-default.png';
  }
  setHeroSrc();

  heroFile.addEventListener('change', e=>{
    const f = e.target.files?.[0]; if(!f) return;
    const r = new FileReader();
    r.onload = () => {
      hero.portrait = r.result;
      setHeroSrc(hero.portrait);
      saveState(state);
    };
    r.readAsDataURL(f);
  });

  // ---------- render accessories from state ----------
  let current = null;

  function renderAcc(){
    accLayer.innerHTML = '';
    hero.acc.forEach((a, idx)=>{
      const img = new Image();
      img.className = 'acc-img';
      img.draggable = false;
      img.src = a.src;
      applyTransform(img, a);
      img.dataset.index = String(idx);
      img.addEventListener('mousedown', selectAccFromImg);
      img.addEventListener('click', selectAccFromImg);
      accLayer.appendChild(img);
    });
    current = null;
    updateUI();
  }

  function applyTransform(img, a){
    const x = a.x ?? 0, y = a.y ?? 0, s = a.scale ?? 1, r = a.rot ?? 0;
    img.style.transform = `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`;
  }

  function selectAccFromImg(e){
    const idx = Number(e.currentTarget.dataset.index);
    current = { idx, node: e.currentTarget, data: hero.acc[idx] };
    accLayer.querySelectorAll('.acc-img').forEach(n=>n.classList.remove('active'));
    current.node.classList.add('active');
    updateUI();
  }

  function updateUI(){
    if(!current){ meta.textContent = 'No accessory selected.'; return; }
    const d = current.data;
    meta.textContent = `x:${d.x|0} y:${d.y|0} scale:${(d.scale??1).toFixed(2)} rot:${d.rot|0}`;
  }

  // ---------- drag / wheel / rotate ----------
  let dragging = false, last = {x:0,y:0};

  accLayer.addEventListener('mousedown', (e)=>{
    if(!(e.target instanceof HTMLImageElement)) return;
    e.preventDefault();
    if(!current || current.node!==e.target) selectAccFromImg(e);
    dragging = true;
    last.x = e.clientX; last.y = e.clientY;
    current.node.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', ()=>{
    dragging = false;
    if(current) current.node.style.cursor = 'grab';
  });
  window.addEventListener('mousemove', (e)=>{
    if(!dragging || !current) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    last.x = e.clientX; last.y = e.clientY;
    current.data.x = (current.data.x||0) + dx;
    current.data.y = (current.data.y||0) + dy;
    applyTransform(current.node, current.data);
    updateUI();
  });

  accLayer.addEventListener('wheel', (e)=>{
    if(!current) return;
    e.preventDefault();
    if(e.shiftKey){
      // rotate
      current.data.rot = (current.data.rot||0) + (e.deltaY>0 ? 3 : -3);
    }else{
      // scale
      const k = e.deltaY>0 ? 0.94 : 1.06;
      const next = clamp((current.data.scale||1)*k, 0.2, 3.0);
      current.data.scale = Number(next.toFixed(3));
    }
    applyTransform(current.node, current.data);
    updateUI();
  }, {passive:false});

  // Arrow keys to nudge
  wrap.addEventListener('keydown', (e)=>{
    if(!current) return;
    const step = e.shiftKey ? 5 : 1;
    if(e.key==='ArrowLeft'){ current.data.x=(current.data.x||0)-step; e.preventDefault(); }
    if(e.key==='ArrowRight'){ current.data.x=(current.data.x||0)+step; e.preventDefault(); }
    if(e.key==='ArrowUp'){ current.data.y=(current.data.y||0)-step; e.preventDefault(); }
    if(e.key==='ArrowDown'){ current.data.y=(current.data.y||0)+step; e.preventDefault(); }
    applyTransform(current.node, current.data);
    updateUI();
  });

  // ---------- toolbar ----------
  bringFront.addEventListener('click', ()=>{
    if(!current) return;
    const a = hero.acc.splice(current.idx,1)[0];
    hero.acc.push(a);
    renderAcc();
  });
  sendBack.addEventListener('click', ()=>{
    if(!current) return;
    const a = hero.acc.splice(current.idx,1)[0];
    hero.acc.unshift(a);
    renderAcc();
  });
  saveBtn.addEventListener('click', ()=>{
    saveState(state);
    meta.textContent += '  • saved';
  });
  removeBtn.addEventListener('click', ()=>{
    if(!current) return;
    hero.acc.splice(current.idx,1);
    renderAcc();
    saveState(state);
  });

  // ---------- add accessory from file ----------
  let stagedDataUrl = null;
  accFile.addEventListener('change', (e)=>{
    const f = e.target.files?.[0]; if(!f) return;
    const r = new FileReader();
    r.onload = () => stagedDataUrl = r.result;
    r.readAsDataURL(f);
  });
  addBtn.addEventListener('click', ()=>{
    if(!stagedDataUrl){ meta.textContent='Choose a PNG first.'; return; }
    const a = { src: stagedDataUrl, x:0, y:0, scale:1, rot:0 };
    hero.acc.push(a);
    renderAcc();
    // auto-select the new one (last)
    const node = accLayer.lastElementChild;
    if(node){
      node.dispatchEvent(new MouseEvent('click'));
      node.scrollIntoView({block:'nearest', inline:'nearest', behavior:'smooth'});
    }
    stagedDataUrl = null;
    accFile.value = '';
    saveState(state);
  });

  // initial render
  renderAcc();

  // focus so arrow keys work without clicking elsewhere
  wrap.tabIndex = 0;
  setTimeout(()=>wrap.focus(), 0);
}

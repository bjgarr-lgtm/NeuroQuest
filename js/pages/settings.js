import {load, save} from '../util/storage.js';

export default function renderSettings(root){
  const s=load();
  s.settings ??= { theme: 'default', font: 'Press Start 2P', toddler:false };
  s.user ??= { name: 'You' };

  const THEMES = {
    default: { '--bg':'#0b0b12', '--panel':'#141429', '--ink':'#cfe6ff', '--accent':'#7bdcff', '--accent2':'#ae84ff' },
    midnight:{ '--bg':'#0a0b13', '--panel':'#121426', '--ink':'#d7e0ff', '--accent':'#6aa9ff', '--accent2':'#9b6bff' },
    forest:  { '--bg':'#0c110c', '--panel':'#152016', '--ink':'#e1ffe8', '--accent':'#59d39b', '--accent2':'#5fcfbf' },
    sunset:  { '--bg':'#140b0b', '--panel':'#221214', '--ink':'#ffe8e1', '--accent':'#ff8a66', '--accent2':'#f4b35e' },
  };

  const FONTS = [
    'Press Start 2P',
    'Atkinson Hyperlegible',
    'Inter',
    'Nunito',
    'Comic Neue',
    'System UI'
  ];

  // ---------- helpers ----------
  function applyTheme(name){
    const p = THEMES[name] || THEMES.default;
    Object.entries(p).forEach(([k,v])=> document.documentElement.style.setProperty(k, v));
  }
  function ensureFontLink(family){
    const map = {
      'Press Start 2P': 'family=Press+Start+2P:wght@400',
      'Atkinson Hyperlegible': 'family=Atkinson+Hyperlegible:wght@400;700',
      'Inter': 'family=Inter:wght@400;600;700',
      'Nunito': 'family=Nunito:wght@400;700',
      'Comic Neue': 'family=Comic+Neue:wght@400;700'
    };
    if(!map[family]) return;
    const id='nq-font-link';
    const href=`https://fonts.googleapis.com/css2?${map[family]}&display=swap`;
    let link=document.getElementById(id);
    if(!link){
      link=document.createElement('link'); link.id=id; link.rel='stylesheet'; link.href=href;
      document.head.appendChild(link);
    }else if(link.href!==href){ link.href=href; }
  }
  function applyFont(name){
    ensureFontLink(name);
    const fam = name==='System UI' ? 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif'
                                   : `'${name}', system-ui, sans-serif`;
    document.documentElement.style.setProperty('--pix', fam);
    if(document.body) document.body.style.fontFamily = fam;
  }
  function ensureNameBadge(){
    const header = document.querySelector('header');
    if(!header) return null;
    let badge = document.getElementById('hudUser');
    if(!badge){
      badge = document.createElement('span');
      badge.id='hudUser';
      badge.style.cssText='margin-left:8px;font-size:.7em;opacity:.8';
      const titleEl = document.getElementById('title') || header.querySelector('h1');
      if(titleEl && titleEl.parentElement){
        titleEl.parentElement.insertBefore(badge, titleEl.nextSibling);
      }else{
        header.appendChild(badge);
      }
    }
    return badge;
  }
  function updateDisplayName(){
    const nm = (s.user?.name || 'You');
    try{ document.title = 'NeuroQuest — ' + nm; }catch(_){}
    const badge = ensureNameBadge();
    if(badge) badge.textContent = '— ' + nm;
  }
  function toast(msg){
    let t=document.getElementById('nq-toast');
    if(!t){ t=document.createElement('div'); t.id='nq-toast'; t.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#111a;border:1px solid #fff3;padding:8px 12px;border-radius:12px;backdrop-filter: blur(6px);z-index:9999;font-size:14px'; document.body.appendChild(t); }
    t.textContent=msg; t.style.opacity='1'; setTimeout(()=>t.style.opacity='0', 1600);
  }

  // music helpers
  function safeList(){
    try{
      const raw = JSON.parse(localStorage.getItem('nq_music_list')||'[]');
      return Array.isArray(raw) ? raw : [];
    }catch(_){ return []; }
  }
  function saveList(arr){
    localStorage.setItem('nq_music_list', JSON.stringify(Array.isArray(arr)?arr.slice(0,5):[]));
  }
  function setCurrentTrack(url, name){
    try{
      localStorage.setItem('nq_music', url||'');
      const audio = document.getElementById('music');
      const btn = document.getElementById('musicBtn');
      if(audio && url){
        audio.src = url; audio.loop = true; audio.volume = 0.6;
        // If header button exists, make sure its state is consistent
        if(btn && !btn.classList.contains('on')) btn.classList.add('on');
      }
      // broadcast to app in case it listens
      try{ document.dispatchEvent(new CustomEvent('nq:music', {detail:{url,name}})); }catch(_){}
      const np=document.getElementById('nowPlaying'); if(np){ np.textContent = name ? ('Now Playing: '+name) : ''; }
    }catch(_){}
  }
  function toggleHeaderMusicPlay(){
    const audio = document.getElementById('music');
    const btn = document.getElementById('musicBtn');
    if(!audio) return;
    const src = audio.getAttribute('src') || audio.src;
    if(!src){
      // no source yet — try pick from library or localStorage
      const list = safeList();
      const first = list[0];
      const stored = localStorage.getItem('nq_music');
      const url = stored || (first && first.url) || '';
      if(url){ setCurrentTrack(url, first?.name || 'Track'); }
    }
    const playing = !audio.paused;
    if(playing){ audio.pause(); btn && btn.classList.remove('on'); }
    else{
      const play = audio.play?.(); 
      if(play && play.catch) play.catch(()=>{});
      btn && btn.classList.add('on');
    }
  }

  // initial apply
  applyTheme(s.settings.theme||'default');
  applyFont(s.settings.font||'Press Start 2P');
  updateDisplayName();

  // ensure hidden file input exists
  if(!document.getElementById('musicFile')){
    const fi=document.createElement('input');
    fi.type='file'; fi.id='musicFile'; fi.accept='audio/*'; fi.style.display='none';
    document.body.appendChild(fi);
  }

  // ---------- UI ----------
  root.innerHTML = `
    <h2>Settings</h2>
    <section class="grid two">
      <div class="panel">
        <h3>Theme</h3>
        <select id="themeSel">
          ${Object.keys(THEMES).map(k=>`<option value="${k}" ${k===(s.settings.theme||'default')?'selected':''}>${k[0].toUpperCase()+k.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div class="panel">
        <h3>Font</h3>
        <select id="fontSel">
          ${FONTS.map(f=>`<option value="${f}" ${f===(s.settings.font||'Press Start 2P')?'selected':''}>${f}</option>`).join('')}
        </select>
      </div>
      <div class="panel">
        <h3>Display Name</h3>
        <input id="nameSel" placeholder="Your name" value="${s.user?.name||'You'}"/>
        <div class="hint">Shown next to title (smaller) & in window title.</div>
      </div>
      <div class="panel">
        <h3>Music Library</h3>
        <div id="nowPlaying" class="hint"></div>
        <div class="row" style="gap:8px">
          <button id="uploadSong" class="secondary">Upload Song</button>
          <button id="headerToggle" class="secondary">Play/Pause (Header)</button>
          <button id="clearSongs" class="danger" title="Clear all songs">Clear</button>
        </div>
        <div id="songList" class="list"></div>
      </div>
    </section>

    <section class="panel">
      <div class="row">
        <button id="saveBtn" class="primary">Save Settings</button>
        <button id="resetBtn" class="secondary">Reset Defaults</button>
      </div>
      <div class="hint">Changes apply immediately. Reset restores Default theme + Press Start 2P.</div>
    </section>
  `;

  // ---------- handlers ----------
  document.getElementById('themeSel').onchange=(e)=>{
    s.settings.theme = e.target.value; save(s); applyTheme(s.settings.theme); toast('Theme updated');
  };
  document.getElementById('fontSel').onchange=(e)=>{
    s.settings.font = e.target.value; save(s); applyFont(s.settings.font); toast('Font updated');
  };
  document.getElementById('nameSel').oninput=(e)=>{
    s.user = s.user || {}; s.user.name = e.target.value; save(s); updateDisplayName();
  };

  // ----- music library -----
  function renderSongs(){
    const el=document.getElementById('songList'); el.innerHTML='';
    const list = safeList();
    if(list.length===0){
      el.innerHTML = '<div class="hint">No songs yet. Upload up to 5 tracks (MP3/OGG/M4A).</div>';
      return;
    }
    list.forEach((it, i)=>{
      const row=document.createElement('div'); row.className='row';
      row.style.justifyContent='space-between';
      const left=document.createElement('div'); left.style.display='flex'; left.style.gap='10px'; left.style.alignItems='center';
      const name=document.createElement('span'); name.textContent=it.name||('Track '+(i+1));
      left.appendChild(name);
      const right=document.createElement('div'); right.style.display='flex'; right.style.gap='6px';
      const play=document.createElement('button'); play.className='secondary'; play.textContent='Play';
      play.onclick=()=>{ setCurrentTrack(it.url, it.name); };
      const top=document.createElement('button'); top.className='secondary'; top.textContent='Top';
      top.onclick=()=>{ const arr=safeList(); const cur=arr.splice(i,1)[0]; arr.unshift(cur); saveList(arr); renderSongs(); };
      const del=document.createElement('button'); del.className='danger'; del.textContent='Delete';
      del.onclick=()=>{ const arr=safeList(); arr.splice(i,1); saveList(arr); renderSongs(); };
      right.append(play, top, del);
      row.append(left, right); el.appendChild(row);
    });
  }
  renderSongs();

  document.getElementById('uploadSong').onclick=()=>{
    const input=document.getElementById('musicFile');
    if(!input){ alert('Music input not found'); return; }
    input.onchange=(e)=>{
      const f=e.target.files?.[0]; if(!f) return;
      const r=new FileReader();
      r.onload=()=>{
        const arr = safeList();
        arr.unshift({name:f.name, url:r.result});
        saveList(arr);
        renderSongs();
        setCurrentTrack(r.result, f.name);
        toast('Added to library');
        document.getElementById('songList').scrollIntoView({behavior:'smooth', block:'center'});
      };
      r.readAsDataURL(f);
    };
    input.click();
  };
  document.getElementById('clearSongs').onclick=()=>{ localStorage.removeItem('nq_music_list'); renderSongs(); toast('Library cleared'); };
  document.getElementById('headerToggle').onclick=()=>{ toggleHeaderMusicPlay(); };

  // Save / Reset
  document.getElementById('saveBtn').onclick=()=>{ save(s); toast('Settings saved'); };
  document.getElementById('resetBtn').onclick=()=>{
    s.settings = { theme:'default', font:'Press Start 2P', toddler:false };
    save(s);
    applyTheme(s.settings.theme); applyFont(s.settings.font); updateDisplayName();
    document.getElementById('themeSel').value=s.settings.theme;
    document.getElementById('fontSel').value=s.settings.font;
    document.getElementById('nameSel').value=s.user?.name || 'You';
    toast('Settings reset');
  };
}

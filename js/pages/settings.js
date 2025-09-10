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

  function applyTheme(name){
    const p = THEMES[name] || THEMES.default;
    Object.entries(p).forEach(([k,v])=> document.documentElement.style.setProperty(k, v));
  }
  function applyFont(name){
    const fam = name==='System UI' ? 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif'
                                   : `'${name}', system-ui, sans-serif`;
    document.documentElement.style.setProperty('--pix', fam);
  }
  function updateHudName(){
    try{ document.title = 'NeuroQuest — ' + (s.user?.name || 'You'); }catch(_){}
  }
  function toast(msg){
    let t=document.getElementById('nq-toast');
    if(!t){ t=document.createElement('div'); t.id='nq-toast'; t.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#111a;border:1px solid #fff3;padding:8px 12px;border-radius:12px;backdrop-filter: blur(6px);z-index:9999;font-size:14px'; document.body.appendChild(t); }
    t.textContent=msg; t.style.opacity='1'; setTimeout(()=>t.style.opacity='0', 1600);
  }

  applyTheme(s.settings.theme||'default');
  applyFont(s.settings.font||'Press Start 2P');
  updateHudName();

  const musicList = JSON.parse(localStorage.getItem('nq_music_list') || '[]');

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
      </div>
      <div class="panel">
        <h3>Music Library</h3>
        <div class="row">
          <button id="uploadSong" class="secondary">Upload Song</button>
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
      <div class="hint">Changes apply immediately, but you can also Save or Reset here.</div>
    </section>
  `;

  document.getElementById('themeSel').onchange=(e)=>{
    s.settings.theme = e.target.value; save(s); applyTheme(s.settings.theme); toast('Theme updated');
  };
  document.getElementById('fontSel').onchange=(e)=>{
    s.settings.font = e.target.value; save(s); applyFont(s.settings.font); toast('Font updated');
  };
  document.getElementById('nameSel').oninput=(e)=>{
    s.user = s.user || {}; s.user.name = e.target.value; save(s); updateHudName();
  };

  function renderSongs(){
    const el=document.getElementById('songList'); el.innerHTML='';
    const list = JSON.parse(localStorage.getItem('nq_music_list')||'[]');
    if(list.length===0){ el.innerHTML = '<div class="hint">No songs yet. Upload up to 5 tracks (MP3/OGG/M4A).</div>'; return; }
    list.forEach((it, i)=>{
      const row=document.createElement('div'); row.className='row';
      const name=document.createElement('span'); name.textContent=it.name||('Track '+(i+1));
      const choose=document.createElement('button'); choose.className='secondary'; choose.textContent='Play';
      choose.onclick=()=>{
        try{
          const cur = list.splice(i,1)[0];
          list.unshift(cur);
          localStorage.setItem('nq_music_list', JSON.stringify(list.slice(0,5)));
          const btn=document.getElementById('musicBtn'); if(btn){ btn.click(); btn.click(); }
          toast('Now playing: '+(cur.name||'Track'));
        }catch(_){}
      };
      const del=document.createElement('button'); del.className='danger'; del.textContent='Delete';
      del.onclick=()=>{
        list.splice(i,1);
        localStorage.setItem('nq_music_list', JSON.stringify(list));
        renderSongs();
      };
      row.append(name, choose, del); el.appendChild(row);
    });
  }
  renderSongs();

  document.getElementById('uploadSong').onclick=()=>{
    const input=document.getElementById('musicFile');
    if(!input){ alert('Music input not found'); return; }
    input.onchange=(e)=>{
      const f=e.target.files[0]; if(!f) return;
      const r=new FileReader();
      r.onload=()=>{
        const arr = JSON.parse(localStorage.getItem('nq_music_list')||'[]');
        arr.unshift({name:f.name, url:r.result});
        localStorage.setItem('nq_music_list', JSON.stringify(arr.slice(0,5)));
        renderSongs(); toast('Added to library');
      };
      r.readAsDataURL(f);
    };
    input.click();
  };
  document.getElementById('clearSongs').onclick=()=>{
    localStorage.removeItem('nq_music_list'); renderSongs(); toast('Library cleared');
  };

  document.getElementById('saveBtn').onclick=()=>{ save(s); toast('Settings saved'); };
  document.getElementById('resetBtn').onclick=()=>{
    s.settings = { theme:'default', font:'Press Start 2P', toddler:false };
    applyTheme(s.settings.theme); applyFont(s.settings.font);
    save(s); toast('Settings reset');
    document.getElementById('themeSel').value=s.settings.theme;
    document.getElementById('fontSel').value=s.settings.font;
  };
}

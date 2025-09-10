import {load, save, reset} from './util/storage.js';
import {initDrawer} from './ui/drawer.js';
import {cursorTrail} from './ui/fx.js';

import renderHome from './pages/home.js';
import renderQuests from './pages/quests.js';
import renderLife from './pages/life.js';
import renderCharacter from './pages/character.js';
import renderJournal from './pages/journal.js';
import renderToddler from './pages/toddler.js';
import renderRewards from './pages/rewards.js';
import renderSettings from './pages/settings.js';
import renderShop from './pages/shop.js';

const routes=[
  {id:'home', label:'Dashboard', view:renderHome},
  {id:'quests', label:'Quests', view:renderQuests},
  {id:'life', label:'Life Hub', view:renderLife},
  {id:'character', label:'Party', view:renderCharacter},
  {id:'journal', label:'Adventure Journal', view:renderJournal},
  {id:'settings', label:'Settings', view:renderSettings},
];

initDrawer(routes);
cursorTrail();

function render(){
  const hash = (location.hash||'#home').slice(1);
  const r = routes.find(x=>x.id===hash) || routes[0];
  const root=document.getElementById('view'); r.view(root);
  updateHud();
}
window.addEventListener('hashchange', render);
render();

function updateHud(){
  const s=load();
  document.getElementById('hudGold').textContent='🪙 '+(s.gold||0);
  document.getElementById('hudXp').style.width=((s.xp||0)%100)+'%';
  document.getElementById('hudLevel').textContent='Lv '+(s.level||1);
  // party mini
  const mini=document.getElementById('partyMini'); mini.innerHTML='';
  const tok=document.getElementById('hudTokens'); if(tok){ tok.innerHTML=''; (s.tokens||[]).slice(-8).forEach(t=>{ const span=document.createElement('span'); span.className='token'; span.textContent=t; tok.appendChild(span); }); }
  if(s.party?.hero) { const i=document.createElement('img'); i.src=s.party.hero.src; mini.appendChild(i); }
  (s.party?.companions||[]).forEach(c=>{ const i=document.createElement('img'); i.src=c.src; mini.appendChild(i); });
}

// export/import state
document.getElementById('exportBtn').onclick=()=>{
  const blob=new Blob([JSON.stringify(load(),null,2)], {type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='soothebirb.json'; a.click();
};
document.getElementById('importBtn').onclick=()=> document.getElementById('importFile').click();
document.getElementById('importFile').onchange=(e)=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader(); r.onload=()=>{ try{ const s=JSON.parse(r.result); localStorage.setItem('sb_v26_state', JSON.stringify(s)); location.reload(); }catch(_){ alert('Invalid file'); } };
  r.readAsText(f);
};

console.log('NeuroQuest v2.6 loaded');


// --- Audio: simple SFX + music playlist (uploads persist in localStorage as object URLs) ---
let nqAudioCtx; function sfx(freq=880, ms=90){ try{ nqAudioCtx ||= new (window.AudioContext||window.webkitAudioContext)(); const o=nqAudioCtx.createOscillator(); const g=nqAudioCtx.createGain(); o.frequency.value=freq; o.connect(g); g.connect(nqAudioCtx.destination); o.start(); g.gain.setValueAtTime(.12, nqAudioCtx.currentTime); g.gain.exponentialRampToValueAtTime(.0001, nqAudioCtx.currentTime+ms/1000); o.stop(nqAudioCtx.currentTime+ms/1000);}catch(_){} }
const music = { audio:new Audio(), list: JSON.parse(localStorage.getItem('nq_music_list')||'[]'), idx:0 };
function saveMusicList(){ localStorage.setItem('nq_music_list', JSON.stringify(music.list)); }
function playMusic(){ if(!music.audio.src){ if(music.list[0]) music.audio.src=music.list[0].url; else return; } music.audio.loop=true; music.audio.play(); }
function toggleMusic(){ if(music.audio.paused) playMusic(); else music.audio.pause(); }
document.getElementById('musicBtn').onclick=()=>{ toggleMusic(); sfx(520,120); };
document.getElementById('musicFile').onchange=(e)=>{ const f=e.target.files[0]; if(!f) return; const url=URL.createObjectURL(f); music.list.push({name:f.name,url}); saveMusicList(); music.audio.src=url; playMusic(); sfx(660,120); };
// click sfx for primary/secondary buttons
document.addEventListener('click', (e)=>{ const el=e.target.closest('button'); if(!el) return; if(el.classList.contains('primary')) sfx(880,80); else if(el.classList.contains('secondary')) sfx(660,80); }, {capture:true});
// Level-up confetti + bonus gold (listen to custom event from save())
document.addEventListener('nq:levelup', ()=>{ try{ import('./ui/fx.js').then(m=>{ m.confetti(); setTimeout(m.confetti,150); setTimeout(m.confetti,300); }); }catch(_){}});

window.NQ_track = tracker;


// NYX tracker shim (avoids ReferenceError if NYX loads later)
function tracker(ev, payload){
  try{ if(window.NQ && typeof window.NQ.track==='function'){ window.NQ.track(ev, payload||{}); } }
  catch(e){ console.warn('[NQ_track]', e); }
}
window.NQ_track = tracker;

// === Music Header Bridge ===
// Makes the header music button play/pause the currently selected library track.
// Selection is stored in localStorage("nq_music") and maintained by Settings.

(function(){
  // Wait until DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function getList(){
    try {
      const raw = JSON.parse(localStorage.getItem('nq_music_list') || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch(_) { return []; }
  }

  function pickInitial(){
    // prefer explicit selection; fallback to first in library
    const stored = localStorage.getItem('nq_music');
    if (stored) return stored;
    const list = getList();
    return list[0]?.url || '';
  }

  function ensureAudio(){
    // If your layout already has <audio id="music">, this uses it.
    // If not, it creates one silently.
    let audio = document.getElementById('music');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'music';
      audio.style.display = 'none';
      document.body.appendChild(audio);
    }
    return audio;
  }

  function init(){
    const btn = document.getElementById('musicBtn');
    const audio = ensureAudio();

    // Load initial selection (if none set yet)
    if (!audio.src) {
      const url = pickInitial();
      if (url) audio.src = url;
    }

    // Respond when Settings selects a new track
    document.addEventListener('nq:music', (e)=>{
      const url = e?.detail?.url;
      if (!url) return;
      localStorage.setItem('nq_music', url);
      audio.src = url;
      // keep button UI "on" but don't force-play; let user use header toggle
      btn && btn.classList.add('on');
    });

    // Header toggle: play/pause the currently selected source
    if (btn) {
      btn.addEventListener('click', async ()=>{
        // Ensure we have a source
        if (!audio.src) {
          const url = pickInitial();
          if (url) {
            audio.src = url;
            localStorage.setItem('nq_music', url);
          }
        }
        try {
          if (audio.paused) {
            audio.loop = true;
            audio.volume = 0.6;
            await audio.play();
            btn.classList.add('on');
          } else {
            audio.pause();
            btn.classList.remove('on');
          }
        } catch(_){}
      });
    }
  }
})();


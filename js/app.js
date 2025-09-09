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
  {id:'quests', label:'Quests + Cleaning', view:renderQuests},
  {id:'life', label:'Life Hub', view:renderLife},
  {id:'settings', label:'Settings', view:renderSettings},
  {id:'shop', label:'Wardrobe + Shop', view:renderShop},
  {id:'character', label:'Character + Companions', view:renderCharacter},
  {id:'journal', label:'Journal + Check-In', view:renderJournal},
  {id:'toddler', label:'Toddler Hub', view:renderToddler}
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

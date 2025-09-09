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

const routes=[
  {id:'settings', label:'Settings', view:renderSettings},
  {id:'home', label:'Dashboard', view:renderHome},
  {id:'quests', label:'Quests + Cleaning', view:renderQuests},
  {id:'life', label:'Life Hub', view:renderLife},
  {id:'character', label:'Character + Companions', view:renderCharacter},
  {id:'journal', label:'Journal + Check-In', view:renderJournal},
  {id:'toddler', label:'Toddler Hub', view:renderToddler},
  {id:'rewards', label:'Rewards', view:renderRewards},
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
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='neuroquest.json'; a.click();
};
document.getElementById('importBtn').onclick=()=> document.getElementById('importFile').click();
document.getElementById('importFile').onchange=(e)=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader(); r.onload=()=>{ try{ const s=JSON.parse(r.result); localStorage.setItem('sb_v26_state', JSON.stringify(s)); location.reload(); }catch(_){ alert('Invalid file'); } };
  r.readAsText(f);
};

console.log('NeuroQuest v2.6 modular loaded');

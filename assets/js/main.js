// main.js — modular router + global HUD
import { load, save } from './storage.js';

const defaults = {
  user:{name:'Hero'}, xp:0, gold:0, streak:0,
  settings:{ toddler:false, gcal:null },
  party:{ leader:'bambi', members:[] }
};
export let S = load(defaults);

const routes = {
  home: ()=>import('./pages/home.js').then(m=>m.init),
  tasks: ()=>import('./pages/tasks.js').then(m=>m.init),
  clean: ()=>import('./pages/clean.js').then(m=>m.init),
  coop: ()=>import('./pages/coop.js').then(m=>m.init),
  budget: ()=>import('./pages/budget.js').then(m=>m.init),
  meals: ()=>import('./pages/meals.js').then(m=>m.init),
  calendar: ()=>import('./pages/calendar.js').then(m=>m.init),
  shop: ()=>import('./pages/shop.js').then(m=>m.init),
  characters: ()=>import('./pages/character.js').then(m=>m.init),
  companion: ()=>import('./pages/companion.js').then(m=>m.init),
  pet: ()=>import('./pages/pet.js').then(m=>m.init),
  breathe: ()=>import('./pages/breathe.js').then(m=>m.init),
  minigames: ()=>import('./pages/minigames.js').then(m=>m.init),
  journal: ()=>import('./pages/journal.js').then(m=>m.init),
  checkin: ()=>import('./pages/checkin.js').then(m=>m.init),
  rewards: ()=>import('./pages/rewards.js').then(m=>m.init),
  settings: ()=>import('./pages/settings.js').then(m=>m.init),
};

const nav = [
  ['home','Dashboard'],['tasks','Quests'],['clean','Cleaning'],['coop','Co‑Op'],
  ['budget','Budget'],['meals','Meals'],['calendar','Calendar'],['shop','Shopping'],
  ['characters','Character'],['companion','Companion'],['pet','Toddler Pet'],
  ['breathe','Breathe'],['minigames','Minigames'],['journal','Journal'],
  ['checkin','Check‑In'],['rewards','Rewards'],['settings','Settings']
];

const $ = s=>document.querySelector(s);
const V = $('#view');
const menu = $('#menu'); const navList = $('#navList');
const hamb = $('#hamb');

function renderMenu(){
  navList.innerHTML = nav.map(([r,label])=>`<button data-route="${r}">${label}</button>`).join('');
  navList.onclick = (e)=>{ const b=e.target.closest('[data-route]'); if(!b) return;
    location.hash = '#'+b.dataset.route; menu.classList.remove('open'); };
}
hamb.onclick = ()=> menu.classList.toggle('open');
renderMenu();

function setHud(){
  $('#hudGold').textContent = '🪙 '+(S.gold||0);
  $('#hudXp').style.width = Math.min(100, (S.xp%100))+'%';
  $('#streak').textContent = 'Streak '+(S.streak||0);
}
setHud();

async function render(){
  const r = (location.hash||'#home').slice(1);
  const get = routes[r] || routes['home'];
  const init = await get();
  V.innerHTML = '';
  await init(V, S, onState);
  setHud();
  save(S);
}

function onState(mutator){
  // safe state update
  const next = typeof mutator==='function' ? mutator(S) : mutator;
  if(next) S = Object.assign({}, S, next);
  setHud(); save(S);
}

window.addEventListener('hashchange', render);
render();
console.log('SootheBirb v3 modular loaded');

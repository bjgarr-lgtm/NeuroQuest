import {load, save} from '../util/storage.js';
import {confetti} from '../ui/fx.js';

const SPECIES=[
  {id:'birb', name:'Birb', src:'assets/pet-birb.svg'},
  {id:'fox', name:'Fox', src:'assets/pet-fox.svg'},
  {id:'deer', name:'Deer', src:'assets/pet-deer.svg'},
];
const ACCESS=[
  {id:'bow', name:'Bow', price:0}, {id:'cap', name:'Cap', price:0}, {id:'scarf', name:'Scarf', price:0},
  {id:'glasses', name:'Glasses', price:2}, {id:'crown', name:'Crown', price:3}, {id:'cape', name:'Cape', price:2},
  {id:'star', name:'Star Pin', price:1}, {id:'flower', name:'Flower', price:1}, {id:'backpack', name:'Backpack', price:2},
  {id:'boots', name:'Boots', price:1}, {id:'wand', name:'Magic Wand', price:2}, {id:'balloon', name:'Balloon', price:1},
  {id:'ribbon', name:'Ribbon', price:1}, {id:'mask', name:'Mask', price:2}, {id:'beads', name:'Beads', price:1},
];

export default function renderToddler(root){
  const s=load();
  if(!s.toddler){ root.innerHTML='<div class="panel"><h3>Toddler Hub</h3><p>Enable <b>Toddler Mode</b> in Settings to show this page.</p></div>'; return; }
  s.toddlerCoins ||= 0;
  s.pet ||= { species:'birb', owned:['bow','cap','scarf'], acc:['bow'] };
  s.toddlerQs ||= [];
  save(s);

  root.innerHTML = \`
    <h2>Toddler Hub</h2>
    <section class="grid three">
      <div class="panel">
        <h3>Pet</h3>
        <div class="row"><span>🪙 Coins: <b id="coins">\${s.toddlerCoins}</b></span></div>
        <div class="row" style="gap:8px; align-items:center">
          <select id="species"></select>
          <img id="petImg" style="height:120px"/>
        </div>
        <div id="accList" class="row wrap"></div>
      </div>
      <div class="panel">
        <h3>Mini Quests</h3>
        <div id="miniQ"></div>
        <div class="row"><input id="newQ" placeholder="Add toddler quest"><button id="addQ" class="secondary">Add</button></div>
      </div>
      <div class="panel">
        <h3>Mini Games</h3>
        <div id="gameGrid" class="grid three" style="grid-template-columns:repeat(3,1fr)"></div>
        <div id="game" class="card" style="min-height:220px"></div>
      </div>
    </section>
  \`;

  // Species
  const sel=document.getElementById('species'); SPECIES.forEach(sp=>{ const o=document.createElement('option'); o.value=sp.id; o.textContent=sp.name; sel.appendChild(o); });
  sel.value=s.pet.species;
  const img=document.getElementById('petImg');
  const byId=(id)=>SPECIES.find(x=>x.id===id)||SPECIES[0];
  img.src=byId(s.pet.species).src;
  sel.onchange=()=>{ s.pet.species=sel.value; img.src=byId(sel.value).src; save(s); };

  // Accessories shop/inventory
  const accHost=document.getElementById('accList');
  function drawAcc(){
    accHost.innerHTML='';
    ACCESS.forEach(a=>{
      const has=s.pet.owned.includes(a.id);
      const active=s.pet.acc.includes(a.id);
      const b=document.createElement('button'); b.className='secondary'; b.textContent= (active?'✓ ':'')+a.name+(has?'':' — '+a.price+'🪙');
      b.onclick=()=>{
        if(!has){
          if((s.toddlerCoins||0)<a.price) return;
          s.toddlerCoins-=a.price; s.pet.owned.push(a.id);
        }
        const i=s.pet.acc.indexOf(a.id);
        if(i>=0) s.pet.acc.splice(i,1); else s.pet.acc.push(a.id);
        save(s); confetti(); try{ sfx && sfx(880,100);}catch(_){ } drawAcc(); document.getElementById('coins').textContent=s.toddlerCoins;
      };
      accHost.appendChild(b);
    });
  }
  drawAcc();

  // Mini quests
  function drawQs(){
    const host=document.getElementById('miniQ'); host.innerHTML='';
    s.toddlerQs.forEach((q,i)=>{
      const row=document.createElement('div'); row.className='row'; 
      const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=!!q.done;
      const label=document.createElement('span'); label.textContent=q.text;
      row.append(chk,label); host.appendChild(row);
      chk.onchange=()=>{ q.done=chk.checked; if(q.done){ s.toddlerCoins+=2; confetti(); try{ sfx && sfx(880,100);}catch(_){ } } save(s); drawQs(); document.getElementById('coins').textContent=s.toddlerCoins; };
    });
  }
  drawQs();
  document.getElementById('addQ').onclick=()=>{ const v=document.getElementById('newQ').value.trim(); if(!v) return; s.toddlerQs.push({text:v,done:false}); save(s); drawQs(); document.getElementById('newQ').value=''; };

  // Games grid
  const games=[
    {id:'pop', label:'Pop Bubbles'},
    {id:'stars', label:'Catch Stars'},
    {id:'match', label:'Match Colors'},
    {id:'maze', label:'Mini Maze'},
    {id:'paint', label:'Finger Paint'},
    {id:'puzzle', label:'Tiny Puzzle'},
    {id:'count', label:'Counting'},
    {id:'shapes', label:'Shapes'},
    {id:'abc', label:'ABC'}
  ];
  const grid=document.getElementById('gameGrid');
  games.forEach(g=>{
    const card=document.createElement('button'); card.className='secondary'; card.textContent=g.label; grid.appendChild(card);
    card.onclick=()=>startGame(g.id);
  });

  function rewardCoins(n=1){ s.toddlerCoins+=n; save(s); document.getElementById('coins').textContent=s.toddlerCoins; confetti(); try{ sfx && sfx(880,100);}catch(_){ } }

  function startGame(id){
    const host=document.getElementById('game'); host.innerHTML='';
    if(id==='pop'){
      const box=document.createElement('div'); box.style.position='relative'; box.style.height='220px'; host.appendChild(box);
      let score=0,time=15;
      const hud=document.createElement('div'); hud.textContent='Time 15  Score 0'; host.appendChild(hud);
      const timer=setInterval(()=>{ time--; hud.textContent='Time '+time+'  Score '+score; if(time<=0){ clearInterval(timer); clearInterval(spawn); rewardCoins( Math.max(1, Math.floor(score/10)) ); host.innerHTML='<h3>Score '+score+'</h3>'; } },1000);
      const spawn=setInterval(()=>{
        const b=document.createElement('div'); b.style.position='absolute'; b.style.width=b.style.height=(20+Math.random()*30)+'px'; b.style.borderRadius='50%'; b.style.background='radial-gradient(#9ff,#37a)';
        b.style.left=(Math.random()*(box.clientWidth-40))+'px'; b.style.top=(Math.random()*(box.clientHeight-40))+'px'; b.onclick=()=>{ score++; b.remove(); };
        box.appendChild(b); setTimeout(()=>b.remove(),1600);
      },420);
    }else{
      host.innerHTML='<p class="muted">Coming soon 😊</p>'; rewardCoins(1);
    }
  }
}

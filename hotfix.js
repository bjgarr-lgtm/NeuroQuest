/* SootheBirb hotfix: minigames hub, calendar sizing, toddler birb, 3 free wardrobe items */
const Q = s => document.querySelector(s);
const view = () => Q('#view');

// ---- CSS patch ----
const css = `
  .hud .avatars img{width:28px;height:28px;object-fit:contain;border-radius:6px}
  .party-members img{max-height:120px;object-fit:contain}
  .calendar .embed-wrap{position:relative;width:100%;max-width:1100px;min-height:70vh}
  .calendar .embed-wrap iframe{position:absolute;inset:0;width:100%;height:100%}
  .games-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:8px}
  .games-grid .card{padding:14px;border:1px solid #6cf;border-radius:14px;background:rgba(50,50,80,.35);cursor:pointer;text-align:center}
  .game-host{margin-top:16px}
  .game-box{position:relative;border:1px solid #999;border-radius:16px;background:rgba(20,20,30,.6);width:100%;max-width:680px;min-height:360px;margin:0 auto;padding:12px;overflow:hidden}
  .pop-bubble{position:absolute;width:48px;height:48px;border-radius:50%;background:radial-gradient(#9ff,#37a);box-shadow:0 0 10px #8ef;cursor:pointer}
  .balloon{position:absolute;width:42px;height:56px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:#f77;left:50%;transform:translateX(-50%);}
  .basket{position:absolute;bottom:8px;left:50%;width:90px;height:16px;background:#964B00;border-radius:8px;transform:translateX(-50%)}
  .simon{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:420px;margin:0 auto}
  .pad{height:120px;border-radius:12px;opacity:.8;cursor:pointer}
  .pad.red{background:#f44}.pad.blue{background:#46f}.pad.green{background:#2d6}.pad.yellow{background:#dd3}
  .pad.on{box-shadow:0 0 20px 6px rgba(255,255,255,.6);opacity:1}
  .pet-stage{min-height:180px;display:flex;align-items:flex-end;gap:12px}
  .birb{width:120px;image-rendering:auto;filter:none}
`;
const styleTag = document.createElement('style'); styleTag.textContent = css; document.head.appendChild(styleTag);

// ---- tiny state helpers ----
const LS = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch{return d}},
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)) }
};
const S = LS.get('sb_state', {gold:0,xp:0,toddlerCoins:0,toddler:false, wardrobe:{owned:[],equipped:[]}, pet:{acc:[]} });

// freebies for wardrobe (once)
(function freebies(){
  if(!S.wardrobe) S.wardrobe = {owned:[],equipped:[]};
  const freebies = ['copper-crown','torch','adventurer-cloak'];
  let changed=false;
  for(const id of freebies){ if(!S.wardrobe.owned.includes(id)){ S.wardrobe.owned.push(id); changed=true; } }
  if(changed){ LS.set('sb_state', S); toast('3 free items added to Wardrobe'); }
})();

// simple toast
function toast(msg){ const t=document.createElement('div'); t.textContent=msg; Object.assign(t.style,{position:'fixed',bottom:'18px',left:'50%',transform:'translateX(-50%)',background:'#000c',color:'#fff',padding:'8px 12px',borderRadius:'10px',zIndex:9999}); document.body.appendChild(t); setTimeout(()=>t.remove(),1600);}

// ---- Router taps (non-invasive) ----
function currentRoute(){ return (location.hash||'#home').slice(1); }
window.addEventListener('hashchange', onRoute);
document.addEventListener('click', (e)=>{
  const link = e.target.closest('[data-route]');
  if(link){ location.hash = '#'+link.dataset.route; }
});

function onRoute(){
  const r = currentRoute();
  if(r==='minigames'){ renderMinigames(); return; }
  if(r==='calendar'){ renderCalendar(); return; }
  if(r==='companion' || r==='pet'){
    if(S.toddler){ renderToddlerPet(); return; }
  }
}
document.addEventListener('DOMContentLoaded', onRoute);

// ---- Calendar (responsive iframe) ----
function renderCalendar(){
  const tpl = document.querySelector('#tpl-calendar'); if(!tpl) return;
  view().innerHTML = ''; view().appendChild(tpl.content.cloneNode(true));
  const src = LS.get('sb_gcal', 'https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com');
  const f = document.querySelector('#gcalFrame'); f.src = src;
}

// ---- Minigames hub (8 entries) ----
function renderMinigames(){
  const tpl = document.querySelector('#tpl-minigames'); if(!tpl) return;
  view().innerHTML=''; view().appendChild(tpl.content.cloneNode(true));
  const grid = document.querySelector('#gamesGrid');
  const games = [
    {id:'pop', label:'Pop Bubbles'}, {id:'colors', label:'Color Match'},
    {id:'float', label:'Balloon Float'}, {id:'simon', label:'Simon Pads'},
    {id:'memory', label:'Mini Memory'}, {id:'whack', label:'Whack-a-Slime'},
    {id:'catch', label:'Catch Stars'}, {id:'shapes', label:'Shape Tap'}
  ];
  games.forEach(g=>{
    const card = document.createElement('button'); card.className='card'; card.textContent=g.label;
    card.onclick=()=> startGame(g.id);
    grid.appendChild(card);
  });
  const host = document.querySelector('#gameHost'); host.innerHTML = '<p>Choose a game. Win rounds to earn toddler coins.</p>';
}

function awardCoins(n){ S.toddlerCoins = (S.toddlerCoins||0)+n; LS.set('sb_state',S); toast(`+${n} toddler coin${n>1?'s':''}!`); }

function startGame(id){
  const host = document.querySelector('#gameHost'); host.innerHTML='';
  const box = document.createElement('div'); box.className='game-box'; host.appendChild(box);
  if(id==='pop'){
    let score=0, time=20;
    const timer = setInterval(()=>{ time--; if(time<=0){ end(); } },1000);
    const spawn = setInterval(()=>{
      const b=document.createElement('div'); b.className='pop-bubble';
      b.style.left=Math.random()*(box.clientWidth-60)+'px';
      b.style.top=Math.random()*(box.clientHeight-60)+'px';
      b.onclick=()=>{ score++; b.remove(); };
      box.appendChild(b); setTimeout(()=>b.remove(), 1800);
    }, 450);
    function end(){ clearInterval(timer); clearInterval(spawn); awardCoins(1+Math.floor(score/6)); box.innerHTML=`<h3 style="text-align:center">Score ${score}</h3>`; }
  }
  else if(id==='colors'){
    const colors=['red','blue','green','yellow','purple','orange'];
    let rounds=8, score=0;
    const target=document.createElement('div'); target.style.textAlign='center'; target.style.margin='6px 0 12px'; box.appendChild(target);
    const row=document.createElement('div'); row.style.display='flex'; row.style.flexWrap='wrap'; row.style.gap='8px'; box.appendChild(row);
    function next(){
      if(rounds--<=0){ awardCoins(Math.max(1,score)); box.innerHTML=`<h3 style="text-align:center">Matches ${score}</h3>`; return; }
      row.innerHTML=''; const want=colors[Math.floor(Math.random()*colors.length)]; target.innerHTML=`Find: <b style="text-transform:capitalize">${want}</b>`;
      const answers=[...colors].sort(()=>Math.random()-.5).slice(0,5);
      for(const c of answers){
        const btn=document.createElement('button'); btn.textContent=c; btn.style.padding='10px 14px'; btn.style.borderRadius='10px'; btn.onclick=()=>{ if(c===want) score++; next(); };
        row.appendChild(btn);
      }
    }
    next();
  }
  else if(id==='float'){
    const balloon=document.createElement('div'); balloon.className='balloon'; balloon.style.top='50%'; box.appendChild(balloon);
    const basket=document.createElement('div'); basket.className='basket'; box.appendChild(basket);
    let y=box.clientHeight*0.5, vy=-0.03, thrust=0, score=0;
    const info=document.createElement('div'); info.style.position='absolute'; info.style.right='10px'; info.style.top='10px'; info.textContent='Hold mouse/touch to lift'; box.appendChild(info);
    function step(){
      thrust*=0.9;
      vy += 0.002 - thrust; // gravity minus thrust
      y += vy;
      if(y<20){ y=20; vy*= -0.6; } if(y>box.clientHeight-80){ y=box.clientHeight-80; vy*=-0.6; }
      balloon.style.top=y+'px';
      score++; if(score>1200){ finish(); return; }
      raf = requestAnimationFrame(step);
    }
    let raf=requestAnimationFrame(step);
    function finish(){ cancelAnimationFrame(raf); awardCoins(2); box.innerHTML='<h3 style="text-align:center">Nice floating!</h3>'; }
    const engage = ()=>{ thrust=0.02; }; const disengage=()=>{ thrust=0; };
    box.addEventListener('mousedown',engage); box.addEventListener('mouseup',disengage);
    box.addEventListener('touchstart',engage,{passive:true}); box.addEventListener('touchend',disengage);
  }
  else if(id==='simon'){
    const pads=['red','blue','green','yellow'].map(c=>{ const d=document.createElement('button'); d.className='pad '+c; return d; });
    const wrap=document.createElement('div'); wrap.className='simon'; pads.forEach(p=>wrap.appendChild(p)); box.appendChild(wrap);
    let seq=[],input=[],level=1,active=false;
    function flash(p){ p.classList.add('on'); setTimeout(()=>p.classList.remove('on'),300); }
    function show(){
      active=false; input=[]; seq.push(pads[Math.floor(Math.random()*pads.length)]);
      (async()=>{ for(const p of seq){ flash(p); await new Promise(r=>setTimeout(r,450)); } active=true; })();
    }
    pads.forEach(p=>p.onclick=()=>{ if(!active) return; flash(p); input.push(p); if(p!==seq[input.length-1]){ box.innerHTML='<h3 style="text-align:center">Try again!</h3>'; }
      else if(input.length===seq.length){ level++; if(level>5){ awardCoins(2); box.innerHTML='<h3 style="text-align:center">You win!</h3>'; } else { setTimeout(show,500); } } });
    show();
  }
  else if(id==='memory'){
    const nums=[1,1,2,2,3,3,4,4,5,5,6,6].sort(()=>Math.random()-.5);
    const grid=document.createElement('div'); grid.style.display='grid'; grid.style.gridTemplateColumns='repeat(4,1fr)'; grid.style.gap='8px'; box.appendChild(grid);
    let last=null,matched=0;
    nums.forEach(n=>{
      const c=document.createElement('button'); c.textContent='?'; c.style.padding='18px 0'; c.style.borderRadius='10px'; c.dataset.v=n;
      c.onclick=()=>{ if(c.disabled) return; c.textContent=n; c.disabled=true;
        if(!last){ last=c; } else { if(last.dataset.v===c.dataset.v){ matched+=2; if(matched===nums.length){ awardCoins(2); box.innerHTML='<h3 style="text-align:center">All matched!</h3>'; } last=null; }
          else { const a=last; setTimeout(()=>{ a.textContent='?'; a.disabled=false; c.textContent='?'; c.disabled=false; last=null; },650); } }
      };
      grid.appendChild(c);
    });
  }
  else if(id==='whack'){
    const grid=document.createElement('div'); grid.style.display='grid'; grid.style.gridTemplateColumns='repeat(4,1fr)'; grid.style.gap='10px'; box.appendChild(grid);
    let score=0,time=20; const cells=[];
    for(let i=0;i<12;i++){ const b=document.createElement('button'); b.style.height='60px'; b.style.borderRadius='10px'; b.textContent=''; b.onclick=()=>{ if(b.classList.contains('on')){ score++; b.classList.remove('on'); b.textContent=''; } }; grid.appendChild(b); cells.push(b); }
    const timer=setInterval(()=>{ time--; if(time<=0){ clearInterval(timer); clearInterval(spawn); awardCoins(1+Math.floor(score/5)); box.innerHTML=`<h3 style="text-align:center">Whacks ${score}</h3>`; } },1000);
    const spawn=setInterval(()=>{ cells.forEach(c=>{c.classList.remove('on'); c.textContent='';}); const b=cells[Math.floor(Math.random()*cells.length)]; b.classList.add('on'); b.textContent='🙂'; },700);
  }
  else if(id==='catch'){
    const area=document.createElement('div'); area.style.position='relative'; area.style.height='300px'; area.style.background='rgba(255,255,255,.04)'; area.style.borderRadius='12px'; box.appendChild(area);
    const basket=document.createElement('div'); basket.className='basket'; area.appendChild(basket);
    let x=area.clientWidth/2, speed=6, score=0, time=20;
    function setX(){ basket.style.left=x+'px'; }
    function spawn(){ const s=document.createElement('div'); s.style.position='absolute'; s.style.width='14px'; s.style.height='14px'; s.style.borderRadius='50%'; s.style.background='#ffd54f'; s.style.left=(Math.random()*(area.clientWidth-14))+'px'; s.style.top='-10px'; area.appendChild(s);
      const fall=setInterval(()=>{ s.style.top=(s.offsetTop+4)+'px'; const by=basket.getBoundingClientRect(), sy=s.getBoundingClientRect();
        if(sy.bottom>by.top && sy.left<by.right && sy.right>by.left){ score++; s.remove(); clearInterval(fall); }
        if(s.offsetTop>area.clientHeight) { s.remove(); clearInterval(fall); }
      },16);
    }
    const key=(e)=>{ if(e.key==='ArrowLeft') x-=speed; if(e.key==='ArrowRight') x+=speed; setX(); };
    document.addEventListener('keydown', key);
    const sp=setInterval(spawn,700); const t=setInterval(()=>{ time--; if(time<=0){ clearInterval(sp); clearInterval(t); document.removeEventListener('keydown',key); awardCoins(1+Math.floor(score/5)); box.innerHTML=`<h3 style="text-align:center">Stars ${score}</h3>`; } },1000);
    setX();
  }
  else if(id==='shapes'){
    const row=document.createElement('div'); row.style.display='flex'; row.style.gap='8px'; row.style.flexWrap='wrap'; box.appendChild(row);
    const shapes=['▲','●','■','◆']; let score=0, rounds=8;
    function next(){ if(rounds--<=0){ awardCoins(1+Math.floor(score/3)); box.innerHTML=`<h3 style="text-align:center">Nice taps: ${score}</h3>`; return; }
      row.innerHTML=''; const want=shapes[Math.floor(Math.random()*shapes.length)]; const target=document.createElement('div'); target.style.textAlign='center'; target.style.margin='6px 0 12px'; target.innerHTML='Tap all: <b>'+want+'</b>'; box.appendChild(target);
      const pool=[...shapes,...shapes,...shapes].sort(()=>Math.random()-.5).slice(0,10);
      pool.forEach(s=>{ const b=document.createElement('button'); b.textContent=s; b.style.padding='10px 14px'; b.style.borderRadius='10px'; b.onclick=()=>{ if(s===want){ score++; b.disabled=true; b.style.opacity=.5; } }; row.appendChild(b); });
      setTimeout(next,1800);
    } next();
  }
}

// ---- Toddler pet (simple birb with accessories) ----
function renderToddlerPet(){
  const tpl = document.querySelector('#tpl-pet'); if(!tpl) return;
  view().innerHTML=''; view().appendChild(tpl.content.cloneNode(true));
  const stage = document.querySelector('#petStage');
  const birb = new Image(); birb.src = 'assets/birb.png'; birb.alt='Birb'; birb.className='birb';
  birb.onerror = ()=>{ birb.src='assets/icon.svg'; };
  stage.appendChild(birb);
  const ACCS=[
    {id:'cap', name:'Cap'}, {id:'bow', name:'Bow'}, {id:'glasses', name:'Glasses'},
    {id:'scarf', name:'Scarf'}, {id:'boots', name:'Boots'}
  ];
  const list=document.querySelector('#accList'); list.innerHTML='';
  ACCS.forEach(a=>{ const cb=document.createElement('label'); cb.style.display='flex'; cb.style.gap='8px'; cb.innerHTML=`<input type="checkbox" data-id="${a.id}"> ${a.name}`; list.appendChild(cb); });
  list.addEventListener('change', e=>{
    const id=e.target.dataset.id; if(!id) return;
    const on=e.target.checked; const idx=(S.pet.acc||[]).indexOf(id);
    if(on && idx<0){ S.pet.acc.push(id); } else if(!on && idx>=0){ S.pet.acc.splice(idx,1); }
    LS.set('sb_state',S);
  });
}

// expose a helper to toggle toddler mode if needed
window.SootheBirbHotfix = { setToddler(v){ S.toddler=!!v; LS.set('sb_state',S); } };

import {load, save} from '../util/storage.js';

function sanitizeGcal(v){
  const def='https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FLos_Angeles';
  if(!v) return def;
  v=String(v).trim();
  const m=v.match(/src=["']([^"']+)["']/i); if(m) v=m[1];
  v=v.replace(/^"|^'|"$|'$/g,'');
  if(v.startsWith('//')) v='https:'+v;
  if(!/^https?:/i.test(v)) v='https://'+v.replace(/^\/+/,'');
  try{ const u=new URL(v); if(!u.hostname.includes('calendar.google.com')) return def; return u.href }catch(_){ return def }
}

export default function renderLife(root){
  const s=load();
  s.meals ??= {};
  s.shop ??= [];
  s.budget ??= {tx:[], goal:100, income:0, expense:0};

  root.innerHTML = `
    <h2>Life Hub</h2>
    <section class="panel">
      <h3>Meals</h3><div class="row"><label><input type="checkbox" id="dayMode"/> Day view</label><select id="dayPick"><option value="0">Sun</option><option value="1">Mon</option><option value="2">Tue</option><option value="3">Wed</option><option value="4">Thu</option><option value="5">Fri</option><option value="6">Sat</option></select></div>
      <div id="mealGrid" class="meal-grid"></div>
    </section>

    <section class="grid two">
      <div class="panel">
        <h3>Shopping</h3>
        <div id="shopList" class="list"></div>
        <div class="row"><input id="shopItem" placeholder="Add item…"><button id="addShop" class="primary">Add</button></div>
      </div>
      <div class="panel">
        <h3>Budget</h3>
        <div class="row"><div class="card">Gold Pouch: <b id="goldPouch">$0</b></div></div>
        <div class="row"><div class="card">This Week's Spend: <b id="spend">$0</b></div></div>
        <div class="row">
          <input id="incLabel" placeholder="Income label"><input id="incAmt" type="number" placeholder="Amount"><button id="addInc" class="primary">+ Income</button>
        </div>
        <div class="row">
          <input id="expLabel" placeholder="Expense label"><input id="expAmt" type="number" placeholder="Amount"><button id="addExp" class="danger">− Expense</button>
        </div>
        <div id="txnList" class="list"></div>
      </div>
    </section>

    <section class="panel">
      <h3>Calendar</h3>
      <div class="row"><input id="gcal" placeholder="Paste Google Calendar embed or src" value="${s.gcal||''}"><button id="saveCal" class="secondary">Set</button></div>
      <div class="panel" style="height:60vh"><iframe id="calFrame" src="${sanitizeGcal(s.gcal)}" style="border:0; width:100%; height:100%" scrolling="no"></iframe></div>
    </section>
  `;

  // meals
  const days=['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const slots=['breakfast','lunch','dinner'];
  const mg=document.getElementById('mealGrid');
  const dayMode=document.getElementById('dayMode');
  const dayPick=document.getElementById('dayPick');

  function cell(id, placeholder){
    const box=document.createElement('div');
    box.className='box';
    box.contentEditable=true;
    box.dataset.key=id;
    box.innerText = (s.meals[id]||'').trim() || placeholder;
    box.onfocus=()=>{ if(box.innerText===placeholder) box.innerText=''; };
    box.oninput=()=>{ s.meals[id]=box.innerText; save(s); try{ confetti(); }catch(_){ } const st=load(); st.gold=(st.gold||0)+1; save(st); try{ sfx && sfx(880,100);}catch(_){ } };
    return box;
  }

  function buildWeekly(){
    mg.innerHTML='';
    mg.style.gridTemplateColumns='repeat(7, minmax(120px,1fr))';
    days.forEach((d)=>{
      slots.forEach((sl)=>{
        mg.appendChild(cell(d+'-'+sl, sl));
      });
    });
  }

  function buildDaily(dayIndex){
    const di = Number(dayIndex)||0;
    mg.innerHTML='';
    mg.style.gridTemplateColumns='repeat(3, minmax(120px,1fr))';
    slots.forEach((sl)=>{
      mg.appendChild(cell(days[di]+'-'+sl, sl));
    });
  }

  function applyMealLayout(){
    if(dayMode && dayMode.checked){
      buildDaily(dayPick ? dayPick.value : 0);
    }else{
      buildWeekly();
    }
  }

  if(dayMode){ dayMode.onchange = applyMealLayout; }
  if(dayPick){ dayPick.onchange = applyMealLayout; }
  applyMealLayout();
// shopping
  function drawShop(){
    const list=document.getElementById('shopList'); list.innerHTML='';
    s.shop.forEach((it,i)=>{
      const row=document.createElement('div'); row.className='row';
      const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=!!it.done; chk.onchange=()=>{ it.done=chk.checked; save(s); drawShop(); };
      const txt=document.createElement('span'); txt.textContent=it.title;
      const rm=document.createElement('button'); rm.className='danger'; rm.textContent='✕'; rm.onclick=()=>{ s.shop.splice(i,1); save(s); drawShop(); };
      row.append(chk,txt,rm); list.appendChild(row);
    });
  }
  drawShop();
  document.getElementById('addShop').onclick=()=>{ const v=document.getElementById('shopItem').value.trim(); if(!v) return; s.shop.push({title:v,done:false}); save(s); drawShop(); };

  // budget
  function recalc(){
    let income=0, expense=0; for(const t of (s.budget.tx||[])){ if(t.type==='inc') income+=t.amt; else expense+=t.amt; }
    s.budget.income=income; s.budget.expense=expense; save(s);
    const pouch=income-expense; document.getElementById('goldPouch').textContent='$'+pouch.toFixed(2);
    document.getElementById('spend').textContent='$'+expense.toFixed(2);
    const list=document.getElementById('txnList'); list.innerHTML='';
    (s.budget.tx||[]).slice().reverse().forEach(t=>{
      const row=document.createElement('div'); row.className='row';
      row.innerHTML=`<span>${t.type==='inc'?'+':''}$${t.amt.toFixed(2)}</span> <span>${t.label}</span>`; list.appendChild(row);
    });
  }
  recalc();
  document.getElementById('addInc').onclick=()=>{ const amt=parseFloat(document.getElementById('incAmt').value||'0'); const label=document.getElementById('incLabel').value||'Income'; if(amt>0){ s.budget.tx.push({type:'inc',amt,label}); save(s); recalc(); } };
  document.getElementById('addExp').onclick=()=>{ const amt=parseFloat(document.getElementById('expAmt').value||'0'); const label=document.getElementById('expLabel').value||'Expense'; if(amt>0){ s.budget.tx.push({type:'exp',amt,label}); save(s); recalc(); } };

  // calendar
  
  function applyMealLayout(){
    if(dayMode.checked){
      mg.style.gridTemplateColumns='repeat(3, minmax(120px,1fr))';
      // hide all cells not in selected day
      Array.from(mg.children).forEach((cell, idx)=>{
        const day = Math.floor((idx)/3); // after headers already added earlier? This is approximate; keep simple by toggling vis by dataset day if present.
      });
      // Simple approach: hide columns via CSS width:0 for others
      const d=dayPick.value|0;
      // We'll just filter innerHTML each time for simplicity (non-destructive): rebuild 1x3
      mg.innerHTML=''; slots.forEach(sl=>{
        const id=days[d]+'-'+sl;
        const box=document.createElement('div'); box.className='meal-cell'; box.contentEditable=true; const ph=sl; box.innerText=s.meals[id]||ph;
        box.onfocus=()=>{ if(box.innerText===ph) box.innerText=''; };
        box.oninput=()=>{ s.meals[id]=box.innerText; save(s); try{ confetti(); }catch(_){ } const st=load(); st.gold=(st.gold||0)+1; save(st); try{ sfx && sfx(880,100);}catch(_){ } };
        mg.appendChild(box);
      });
    }else{
      // rebuild 7x3
      mg.innerHTML='';
      days.forEach(d=>{
        slots.forEach(sl=>{
          const id=d+'-'+sl;
          const box=document.createElement('div'); box.className='meal-cell'; box.contentEditable=true; const ph=sl; box.innerText=s.meals[id]||ph;
          box.onfocus=()=>{ if(box.innerText===ph) box.innerText=''; };
          box.oninput=()=>{ s.meals[id]=box.innerText; save(s); try{ confetti(); }catch(_){ } const st=load(); st.gold=(st.gold||0)+1; save(st); try{ sfx && sfx(880,100);}catch(_){ } };
          mg.appendChild(box);
        });
      });
      mg.style.gridTemplateColumns='repeat(7, minmax(120px,1fr))';
    }
  }
  dayMode.onchange=applyMealLayout; dayPick.onchange=()=>{ if(dayMode.checked) applyMealLayout(); };
  applyMealLayout();

document.getElementById('saveCal').onclick=()=>{ const v=document.getElementById('gcal').value; s.gcal=v; save(s); document.getElementById('calFrame').src=sanitizeGcal(v); };
}

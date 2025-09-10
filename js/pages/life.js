
import {load, save} from '../util/storage.js';
import {logAction} from '../util/game.js';
import {confetti, crownDrop} from '../ui/fx.js';

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
  s.budget ??= {tx:[], income:0, expense:0};

  root.innerHTML = `
    <h2>Life Hub</h2>

    <section class="panel">
      <h3>Meals</h3>
      <div id="mealGrid" class="meal-grid"></div>
    </section>

    <section class="panel">
      <h3>Quick Log</h3>
      <div class="row">
        <select id="quickAction">
          <option value="hydrate">Hydrate</option>
          <option value="walk">Walk</option>
          <option value="cook">Cook</option>
          <option value="kindness">Kindness</option>
          <option value="meditate">Meditate</option>
          <option value="sleep">8h Sleep</option>
          <option value="social">Social check-in</option>
          <option value="laundry">Laundry done</option>
          <option value="dishes">Dishes clear</option>
          <option value="inbox_zero">Inbox zero</option>
          <option value="garden">Tend plants</option>
          <option value="book">Finish a book</option>
          <option value="skill">Practice a skill</option>
          <option value="pet_care">Pet care</option>
          <option value="screen_down">1h screen-free</option>
          <option value="budget_setup">Budget setup</option>
        </select>
        <button id="logQuick" class="primary">Log</button>
      </div>
      <div class="hint">Use this dropdown to record progress toward rewards. Auto-claims when thresholds are met.</div>
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
          <input id="incLabel" placeholder="Income label">
          <input id="incAmount" placeholder="Amount" type="number" step="0.01">
          <button id="addInc" class="primary">+ Income</button>
        </div>
        <div class="row">
          <input id="expLabel" placeholder="Expense label">
          <input id="expAmount" placeholder="Amount" type="number" step="0.01">
          <button id="addExp" class="danger">− Expense</button>
        </div>
        <div id="txnList" class="list"></div>
      </div>
    </section>

    <section class="panel">
      <h3>Calendar</h3>
      <div class="row">
        <input id="gcal" placeholder="Paste Google Calendar embed URL">
        <button id="saveCal" class="secondary">Set</button>
      </div>
      <div class="panel" style="height:60vh">
        <iframe id="calFrame" style="border:0; width:100%; height:100%" scrolling="no"></iframe>
      </div>
    </section>
  `;

  // Meals (compact day view with optional weekly grid)
const days=['SUN','MON','TUE','WED','THU','FRI','SAT'];
const slots=['breakfast','lunch','dinner'];
const mg=document.getElementById('mealGrid');

// Controls
const ctrl=document.createElement('div'); ctrl.className='row';
ctrl.innerHTML = `<select id="mealDay">${days.map(d=>`<option value="${d}">${d}</option>`).join('')}</select>
<button id="mealMode" class="secondary">Weekly</button>`;
mg.appendChild(ctrl);

const holder=document.createElement('div'); holder.id='mealHolder'; mg.appendChild(holder);

function renderDay(d){
  holder.innerHTML='';
  const col=document.createElement('div'); col.className='meal-day';
  const head=document.createElement('div'); head.className='card'; head.textContent=d; col.appendChild(head);
  slots.forEach(slot=>{
    const key=`${d.toLowerCase()}_${slot}`;
    const row=document.createElement('div'); row.className='row';
    const label=document.createElement('span'); label.textContent=slot;
    const inp=document.createElement('input'); inp.placeholder=slot; inp.value=s.meals[key]||'';
    inp.onfocus=()=>{ if(!s.meals[key]) inp.value=''; inp.select(); };
    inp.onchange=()=>{ const before=s.meals[key]||''; s.meals[key]=inp.value.trim(); save(s); if(!before && s.meals[key]){ s.gold=(s.gold||0)+1; save(s); try{ crownDrop(); }catch{} confetti(); } };
    row.append(label, inp); col.appendChild(row);
  });
  holder.appendChild(col);
}

function renderWeek(){
  holder.innerHTML='';
  const wrap=document.createElement('div'); wrap.className='meal-grid-wrap';
  days.forEach(d=>{
    const col=document.createElement('div'); col.className='meal-col';
    const head=document.createElement('div'); head.className='card'; head.textContent=d; col.appendChild(head);
    slots.forEach(slot=>{
      const key=`${d.toLowerCase()}_${slot}`;
      const inp=document.createElement('input'); inp.placeholder=slot; inp.value=s.meals[key]||'';
      inp.onfocus=()=>{ if(!s.meals[key]) inp.value=''; inp.select(); };
      inp.onchange=()=>{ const before=s.meals[key]||''; s.meals[key]=inp.value.trim(); save(s); if(!before && s.meals[key]){ s.gold=(s.gold||0)+1; save(s); try{ crownDrop(); }catch{} confetti(); } };
      col.appendChild(inp);
    });
    wrap.appendChild(col);
  });
  holder.appendChild(wrap);
}

let mode='day';
renderDay('SUN');
document.getElementById('mealDay').onchange=(e)=>{ const d=e.target.value; mode==='day'?renderDay(d):null; };
document.getElementById('mealMode').onclick=()=>{
  if(mode==='day'){ mode='week'; document.getElementById('mealMode').textContent='Day'; renderWeek(); }
  else { mode='day'; document.getElementById('mealMode').textContent='Weekly'; renderDay(document.getElementById('mealDay').value); }
};


  // Quick Log
  const qa=document.getElementById('quickAction');
  const qbtn=document.getElementById('logQuick');
  if(qbtn) qbtn.onclick=()=>{ const k=qa.value; logAction(k); };

// Shopping
const shopList=document.getElementById('shopList');
function renderShop(){
  shopList.innerHTML='';
  (s.shop||[]).forEach((item,i)=>{
    const obj = (typeof item==='string') ? {text:item, done:false} : item;
    if(typeof item==='string'){ s.shop[i]=obj; }

    const row=document.createElement('div'); row.className='row';

    const left=document.createElement('div');
    left.style.display='flex';
    left.style.alignItems='center';
    left.style.gap='8px';
    left.style.flex='1';

    const chk=document.createElement('input');
    chk.type='checkbox'; chk.checked=!!obj.done;
    chk.onchange=()=>{
      const wasDone=!!obj.done;
      obj.done=chk.checked;
      s.shop[i]=obj;
      if(!wasDone && obj.done){
        s.gold=(s.gold||0)+1;
        try{ crownDrop(); }catch(e){}
        confetti();
      }
      save(s); renderShop();
    };

    const label=document.createElement('span');
    label.textContent=obj.text;
    if(obj.done){ label.style.textDecoration='line-through'; label.style.opacity='0.6'; }

    left.append(chk,label);

    const del=document.createElement('button');
    del.className='danger'; del.textContent='Delete';
    del.onclick=()=>{ s.shop.splice(i,1); save(s); renderShop(); };

    row.append(left,del);
    shopList.appendChild(row);
  });
}
document.getElementById('addShop').onclick=()=>{
  const v=document.getElementById('shopItem').value.trim();
  if(!v) return;
  (s.shop ||= []).push({text:v, done:false});
  save(s);
  document.getElementById('shopItem').value='';
  renderShop();
};
renderShop();

// Budget
function recalc(){
  const tx = (s.budget.tx||[]);
  const inc = tx.filter(t=>t.type==='inc').reduce((a,b)=>a+(+b.amt||0),0);
  const exp = tx.filter(t=>t.type==='exp').reduce((a,b)=>a+(+b.amt||0),0);
  const remaining = inc - exp;

  document.getElementById('goldPouch').textContent = '$'+remaining.toFixed(2);
  document.getElementById('spend').textContent = '$'+exp.toFixed(2);

  const list=document.getElementById('txnList');
  list.innerHTML='';
  tx.slice().reverse().forEach(t=>{
    const row=document.createElement('div'); row.className='row';
    const sign=t.type==='inc'?'+':'−';
    row.innerHTML=`<span>${sign}$${(+t.amt||0).toFixed(2)}</span> <span>${t.label}</span>`;
    list.appendChild(row);
  });
}
document.getElementById('addInc').onclick=()=>{
  const amt=parseFloat(document.getElementById('incAmount').value)||0;
  const label=document.getElementById('incLabel').value||'Income';
  if(amt>0){
    s.budget.tx.push({type:'inc', amt, label});
    s.gold=(s.gold||0)+1;
    save(s); recalc();
    try{ crownDrop(); }catch(e){} confetti();
  }
};
document.getElementById('addExp').onclick=()=>{
  const amt=parseFloat(document.getElementById('expAmount').value)||0;
  const label=document.getElementById('expLabel').value||'Expense';
  if(amt>0){
    s.budget.tx.push({type:'exp', amt, label});
    s.gold=(s.gold||0)+1;
    save(s); recalc();
    try{ crownDrop(); }catch(e){} confetti();
  }
};
recalc();

  // Calendar
  const savedCal = (s && s.gcal) ? s.gcal : '';
  document.getElementById('calFrame').src = sanitizeGcal(savedCal);
  document.getElementById('saveCal').onclick = ()=>{
    const v=document.getElementById('gcal').value.trim();
    s.gcal = v; save(s);
    document.getElementById('calFrame').src = sanitizeGcal(v);
  };
}

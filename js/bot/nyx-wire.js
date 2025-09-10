// nyx-wire.js — declarative wiring from existing page elements to Actions
import { Actions } from './nyx-actions.js';

function on(el, ev, fn){ if(el) el.addEventListener(ev, fn); }

export function wireAll(){
  // Quests page buttons
  on(document.getElementById('addMain'), ()=> Actions.run('quest.create',{ title: prompt('Main quest title?')||'Main Quest', tier:'main' }));
  on(document.getElementById('addSide'), ()=> Actions.run('quest.create',{ title: prompt('Side quest title?')||'Side Quest', tier:'side' }));
  on(document.getElementById('addBonus'),()=> Actions.run('quest.create',{ title: prompt('Bonus quest title?')||'Bonus', tier:'bonus' }));

  // Journal
  on(document.getElementById('saveJ'), ()=> {
    const t = (document.getElementById('jText')?.value||'').trim();
    if(t) Actions.run('journal.add',{ text: t });
  });

  // Hydration / breathe ring
  on(document.getElementById('breathRing'), ()=> Actions.run('breathe.start',{ minutes: 1 }));

  // Life/Budget/Shopping page
  on(document.getElementById('addShop'), ()=> {
    const item = (document.getElementById('shopItem')?.value || prompt('Add shopping item'));
    if(item) Actions.run('shopping.add', { item });
  });

  on(document.getElementById('addInc'), ()=> {
    const item = prompt('Income item?') || 'income';
    const amt = Number(prompt('Amount?')||0);
    Actions.run('budget.add', { item, amount: amt, category:'income' });
  });
  on(document.getElementById('addExp'), ()=> {
    const item = prompt('Expense item?') || 'expense';
    const amt = Number(prompt('Amount?')||0);
    Actions.run('budget.add', { item, amount: -Math.abs(amt), category:'expense' });
  });

  // Generic: any element with data-action + optional data-params='{"k":"v"}'
  document.body.addEventListener('click', (e)=>{
    const el = e.target.closest('[data-action]');
    if(!el) return;
    const name = el.getAttribute('data-action');
    const params = safeParse(el.getAttribute('data-params')) || {};
    if(name){ Actions.run(name, params); }
  });

  // Observe dynamic pages
  const mo = new MutationObserver(()=> wireAll()); mo.observe(document.body, {childList:true, subtree:true});
}

function safeParse(s){ try{ return s ? JSON.parse(s) : null; }catch(_){ return null; }}

if(typeof window !== 'undefined'){
  window.addEventListener('DOMContentLoaded', wireAll);
}

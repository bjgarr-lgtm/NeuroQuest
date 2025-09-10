// nyx-wire.js — SAFE wiring (single observer, idempotent bindings)
import { Actions } from './nyx-actions.js';

let _observer = null;
let _wiredOnce = false;

function bindOnce(el, ev, fn){
  if(!el) return;
  const key = '__nyxBound_'+ev;
  if(el[key]) return; // already bound
  el.addEventListener(ev, fn);
  el[key] = true;
}

function wireStatic(){
  // Quests page buttons
  bindOnce(document.getElementById('addMain'), 'click', ()=> Actions.run('quest.create',{ title: prompt('Main quest title?')||'Main Quest', tier:'main' }));
  bindOnce(document.getElementById('addSide'), 'click', ()=> Actions.run('quest.create',{ title: prompt('Side quest title?')||'Side Quest', tier:'side' }));
  bindOnce(document.getElementById('addBonus'),'click', ()=> Actions.run('quest.create',{ title: prompt('Bonus quest title?')||'Bonus', tier:'bonus' }));

  // Journal
  bindOnce(document.getElementById('saveJ'),'click', ()=> {
    const t = (document.getElementById('jText')?.value||'').trim();
    if(t) Actions.run('journal.add',{ text: t });
  });

  // Hydration / breathe ring
  bindOnce(document.getElementById('breathRing'),'click', ()=> Actions.run('breathe.start',{ minutes: 1 }));

  // Life/Budget/Shopping page
  bindOnce(document.getElementById('addShop'),'click', ()=> {
    const item = (document.getElementById('shopItem')?.value || prompt('Add shopping item'));
    if(item) Actions.run('shopping.add', { item });
  });

  bindOnce(document.getElementById('addInc'),'click', ()=> {
    const item = prompt('Income item?') || 'income';
    const amt = Number(prompt('Amount?')||0);
    Actions.run('budget.add', { item, amount: amt, category:'income' });
  });
  bindOnce(document.getElementById('addExp'),'click', ()=> {
    const item = prompt('Expense item?') || 'expense';
    const amt = Number(prompt('Amount?')||0);
    Actions.run('budget.add', { item, amount: -Math.abs(amt), category:'expense' });
  });
}

function wireDynamic(root=document){
  // Any element with data-action + optional data-params
  const nodes = root.querySelectorAll('[data-action]:not([data-nyx-bound])');
  nodes.forEach(el=>{
    el.addEventListener('click', (e)=>{
      const name = el.getAttribute('data-action');
      let params = {};
      try{ params = JSON.parse(el.getAttribute('data-params')||'{}'); }catch(_){}
      if(name) Actions.run(name, params);
    });
    el.setAttribute('data-nyx-bound','1');
  });
}

export function wireAll(){
  if(!_wiredOnce){
    wireStatic();
    wireDynamic(document);
    _wiredOnce = true;
  } else {
    // Re-run dynamic only
    wireDynamic(document);
  }
  if(!_observer){
    _observer = new MutationObserver((muts)=>{
      for(const m of muts){
        for(const node of Array.from(m.addedNodes||[])){
          if(node && node.querySelectorAll) wireDynamic(node);
        }
      }
    });
    _observer.observe(document.body, { childList:true, subtree:true });
  }
}

if(typeof window !== 'undefined'){
  window.addEventListener('DOMContentLoaded', wireAll);
}

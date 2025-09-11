// pages/life.patched.js — grocery, budget, meals hooks with 1g rewards on positive actions
import { load, save } from '../util/storage.js';

export function toggleGrocery(name, checked){
  NQ.toggleGrocery(name, !!checked);
  if (checked) NQ.addGold(1);
  const s = load();
  return save(s);
}

export function deleteGrocery(name){
  const s = load();
  s.life.grocery = (s.life.grocery||[]).filter(it => it.name !== name);
  return save(s); // no gold for delete
}

export function addBudget(label, amount){
  NQ.addBudget(label, +amount);
  NQ.addGold(1);
  const s = load();
  return save(s);
}

export function setMeal(dayKey, partKey, text){
  const s = load();
  s.life.meals = s.life.meals || { byDay:{} };
  s.life.meals.byDay = s.life.meals.byDay || {};
  s.life.meals.byDay[dayKey] = s.life.meals.byDay[dayKey] || {};
  s.life.meals.byDay[dayKey][partKey] = text;
  NQ.addGold(1);
  return save(s);
}

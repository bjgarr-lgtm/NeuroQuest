
import {S, save} from './state.js';
import * as Pages from '../pages/_index.js';
import {drawHUD} from './ui.js';

export function routeTo(r){ location.hash = '#'+r; }

export function startRouter(){
  function render(){
    const r = (location.hash || '#home').slice(1);
    const v = document.getElementById('view');
    const page = Pages[r] || Pages['home'];
    v.innerHTML = '';
    v.appendChild(page());
    drawHUD();
  }
  window.addEventListener('hashchange', render);
  document.addEventListener('DOMContentLoaded', render);
}

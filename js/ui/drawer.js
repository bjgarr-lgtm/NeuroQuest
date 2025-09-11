export function initDrawer(routes){
  const hamb = document.getElementById('hamb');
  const drawer = document.getElementById('drawer');
  const scrim = document.getElementById('scrim');
  const nav = document.getElementById('nav');

  function item(route,label){
    const b=document.createElement('button');
    b.textContent=label; b.dataset.route=route;
    b.onclick=()=>{ location.hash = '#'+route; close(); };
    return b;
  }

  nav.innerHTML='';
  routes.forEach(r=> nav.appendChild(item(r.id, r.label)));

  function open(){ drawer.classList.add('open'); scrim.classList.add('show'); }
  function close(){ drawer.classList.remove('open'); scrim.classList.remove('show'); }
  hamb.onclick=()=> drawer.classList.contains('open') ? close() : open();
  scrim.onclick=close;

  // set active on hashchange
  function setActive(){
    [...nav.children].forEach(btn=>btn.classList.toggle('active', '#'+btn.dataset.route===location.hash));
  }
  window.addEventListener('hashchange', setActive);
  setActive();
  
}
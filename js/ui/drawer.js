// ui/drawer.js
export function initDrawer() {
  const drawer = document.getElementById('drawer');
  const scrim  = document.getElementById('scrim');
  const btn    = document.getElementById('hamb');

  const open = () => { drawer.classList.add('open'); document.body.classList.add('drawer-open'); };
  const close = () => { drawer.classList.remove('open'); document.body.classList.remove('drawer-open'); };

  btn?.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    isOpen ? close() : open();
  });

  scrim?.addEventListener('click', close);

  // Close on route change for mobile
  window.addEventListener('hashchange', close);
}

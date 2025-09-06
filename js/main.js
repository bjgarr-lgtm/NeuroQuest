
import {startRouter} from './core/router.js';
import {initMenu, initGlobal, drawHUD} from './core/ui.js';
import {S, save} from './core/state.js';

// Boot freebies once
if(!S.__booted){ S.__booted=true; save(); }

initMenu();
initGlobal();
startRouter();
drawHUD();
console.log('SootheBirb modular loaded');

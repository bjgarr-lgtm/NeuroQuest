
import {S} from '../core/state.js';
export function rewards(){
  const el=document.createElement('section'); el.className='section';
  el.innerHTML='<h2>Collectibles & Achievements</h2><p>Badges unlock as you complete quests, bosses, raids, and minigames.</p>';
  return el;
}

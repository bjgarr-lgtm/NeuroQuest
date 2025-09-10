import {load} from '../util/storage.js';
export default function renderRewards(root){
  const s=load();
  root.innerHTML = `<h2>Rewards</h2><div class="panel">Finish quests to earn gold & XP. Unlocked accessories appear in your Wardrobe.</div>`;
}

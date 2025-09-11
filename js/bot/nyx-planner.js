// nyx-planner.js — prefer local parse; fall back to LLM
import { nyxAskLLM } from './nyx-llm.js';

const SCHEMA = { /* unchanged */ };

function localParse(userText){
  const t = String(userText||'').trim();
  const lc = t.toLowerCase();

  // create quest
  if (lc.startsWith('add quest ') || lc.startsWith('create quest ') ||
      lc.startsWith('add main quest ') || lc.startsWith('add side quest ') ||
      lc.startsWith('quest add ') || lc.startsWith('new quest ') ) {
    // strip common prefixes
    const title = t.replace(/^(add|create)\s+(main\s+|side\s+)?quest\s+/i,'')
                   .replace(/^quest\s+add\s+/i,'')
                   .replace(/^new\s+quest\s*:?/i,'')
                   .trim();
    const tier = /main\s+quest/i.test(t) ? 'main' : 'side';
    if (title) return { steps: [{ action:'quest.create', params:{ title, tier } }] };
  }

  // complete quest
  if (lc.startsWith('complete quest ') || lc.startsWith('finish quest ') || lc.startsWith('quest complete ')) {
    const title = t.replace(/^(complete|finish)\s+quest\s+/i,'')
                   .replace(/^quest\s+complete\s+/i,'')
                   .trim();
    if (title) return { steps: [{ action:'quest.complete', params:{ title } }], confirm:true };
  }

  // shopping add
  if (lc.startsWith('add to shopping ') || lc.startsWith('shopping add ')) {
    const item = t.replace(/^add to shopping\s+|^shopping add\s+/i,'').trim();
    if (item) return { steps: [{ action:'shopping.add', params:{ item } }] };
  }

  // budget add
  const m = /budget add\s+(.+?)\s+(\d+(?:\.\d+)?)/i.exec(t);
  if (m) {
    const [, item, amount] = m;
    return { steps: [{ action:'budget.add', params:{ item, amount: Number(amount||0) } }] };
  }

  return { steps: [] };
}

export async function planActionsFromText(userText, opts = {}){
  // 1) Always try local parse first
  const local = localParse(userText);
  if (local.steps.length) return local;

  // 2) If nothing local, then try LLM (only if endpoint is set)
  const endpoint = (localStorage.getItem('nyx_llm_endpoint') || window.NYX_LLM_ENDPOINT || '');
  if (!endpoint) return { steps: [] };

  const system = [
    'You are NYX, inside the NeuroQuest app.',
    'Turn the user request into a SHORT JSON plan following this JSON schema:',
    JSON.stringify(SCHEMA),
    'Only use these actions: quest.create, quest.complete, journal.add, hydrate.log, breathe.start, shopping.add, budget.add, reward.grant.',
    'Default to side-tier quests when unspecified. Ask for confirm:true if a step looks destructive.'
  ].join('\n');

  const resp = await nyxAskLLM('PLAN: '+userText, { system, model: 'gpt-4o-mini' }).catch(()=>'');

  let jsonText = String(resp||'').trim();
  const block = jsonText.match(/```json\s*([\s\S]*?)\s*```/i);
  if (block) jsonText = block[1];

  try {
    const obj = JSON.parse(jsonText);
    if (Array.isArray(obj.steps)) return obj;
  } catch(_) {}
  return { steps: [] };
}

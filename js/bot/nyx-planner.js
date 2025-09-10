// nyx-planner.js — turns user text into structured actions via LLM or regex fallback
import { nyxAskLLM } from './nyx-llm.js';

const SCHEMA = { type:'object', properties:{ steps:{ type:'array', items:{ type:'object', properties:{ action:{type:'string'}, params:{type:'object'} }, required:['action'] }}, confirm:{type:'boolean'} }, required:['steps'] };

export async function planActionsFromText(userText, opts={}){
  const endpoint = (localStorage.getItem('nyx_llm_endpoint') || window.NYX_LLM_ENDPOINT || '');
  if(!endpoint){
    const t = (userText||'').toLowerCase();
    if(t.startsWith('add quest ') || t.startsWith('create quest ')){
      const title = userText.replace(/^add quest\s+|^create quest\s+/i,'').trim();
      return { steps: [{ action:'quest.create', params:{ title, tier:'side' } }] };
    }
    if(t.startsWith('complete quest ')){
      const title = userText.replace(/^complete quest\s+/i,'').trim();
      return { steps: [{ action:'quest.complete', params:{ title } }], confirm:true };
    }
    if(t.startsWith('add to shopping ') || t.startsWith('shopping add ')){
      const item = userText.replace(/^add to shopping\s+|^shopping add\s+/i,'').trim();
      return { steps: [{ action:'shopping.add', params:{ item } }] };
    }
    if(t.startsWith('budget add ')){
      const m = /budget add\s+(.+?)\s+(\d+(?:\.\d+)?)/i.exec(userText);
      if(m){ const [, item, amount] = m; return { steps: [{ action:'budget.add', params:{ item, amount: Number(amount||0) } }] }; }
    }
    if(t.startsWith('journal ')){
      const text = userText.replace(/^journal\s+/i,'').trim();
      return { steps: [{ action:'journal.add', params:{ text } }] };
    }
    return { steps: [] };
  }

  const system = [
    'You are NYX inside the NeuroQuest app.',
    'Return ONLY JSON following this schema:',
    JSON.stringify(SCHEMA),
    'Allowed actions: quest.create, quest.complete, journal.add, hydrate.log, breathe.start, shopping.add, budget.add, reward.grant.',
    'Default to side-tier quests when unspecified. Use confirm:true for destructive actions.'
  ].join('\n');

  const resp = await nyxAskLLM('PLAN: '+userText, { system, model:'gpt-4o-mini' }).catch(()=>'');
  let text = String(resp||'').trim();
  let jsonText = text;
  const m = text.match(/```json\s*([\s\S]*?)\s*```/i); if(m) jsonText = m[1];

  try{ const obj = JSON.parse(jsonText); if(Array.isArray(obj.steps)) return obj; }catch(_){}
  return { steps: [] };
}

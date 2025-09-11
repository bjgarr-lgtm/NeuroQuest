// nyx-planner.js — turns user text into structured actions via LLM or regex fallback
import { nyxAskLLM } from './nyx-llm.js';

// Allowed actions (must match nyx-actions.js)
const ALLOWED = new Set([
  'quest.create','quest.complete',
  'journal.add','hydrate.log','breathe.start',
  'shopping.add','budget.add','reward.grant'
]);

const SCHEMA = {
  type: 'object',
  properties: {
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          params: { type: 'object' }
        },
        required: ['action']
      }
    },
    confirm: { type: 'boolean' }
  },
  required: ['steps']
};

// ---------- helpers ----------
function step(action, params={}){ return { action, params }; }
function safeNumber(x, d=0){ const n = Number(String(x).replace(/[^\d.-]/g,'')); return Number.isFinite(n) ? n : d; }
function cleanPlan(plan){
  const out = { steps: [], confirm: !!plan?.confirm };
  for(const s of (plan?.steps||[])){
    if(!s || typeof s.action !== 'string') continue;
    if(!ALLOWED.has(s.action)) continue;
    out.steps.push({ action: s.action, params: (s.params && typeof s.params==='object') ? s.params : {} });
  }
  return out;
}

// Regex fallback parser (no LLM)
function localParse(userText){
  const t = (userText||'').trim();
  const lc = t.toLowerCase();
  const plan = { steps: [] };

  // QUESTS
  // “add quest …”, “create quest …”, allow “main/side” hints
  if(/^((add|create)\s+quest)\b/i.test(lc)){
    const mTier = lc.match(/\b(main|side)\b/);
    const tier = (mTier && mTier[1]==='main') ? 'main' : 'side';
    const title = t.replace(/^((add|create)\s+quest)\s*/i,'').replace(/\s*\b(main|side)\b/i,'').trim();
    if(title) plan.steps.push(step('quest.create',{ title, tier }));
  }
  // “complete quest …”
  if(/^complete\s+quest\b/i.test(lc)){
    const title = t.replace(/^complete\s+quest\s*/i,'').trim();
    if(title) plan.steps.push(step('quest.complete',{ title }));
    plan.confirm = true; // potentially destructive
  }

  // JOURNAL
  // “journal …” or “add journal …” or “save entry …”
  if(/^(journal|add\s+journal|save\s+entry)\b/i.test(lc)){
    const text = t.replace(/^(journal|add\s+journal|save\s+entry)\s*/i,'').trim();
    if(text) plan.steps.push(step('journal.add',{ text }));
  }

  // HYDRATE & BREATHE
  if(/\b(drink|hydrate|water)\b/.test(lc)) plan.steps.push(step('hydrate.log',{ amount:1 }));
  if(/\b(breathe|breathing|start\s+breathe|start\s+breathing)\b/.test(lc)) plan.steps.push(step('breathe.start',{ minutes:1 }));

  // SHOPPING
  // “add to shopping …”, “shopping add …”, “add … to list”
  if(/^(add\s+to\s+shopping|shopping\s+add)\b/i.test(lc)){
    const item = t.replace(/^(add\s+to\s+shopping|shopping\s+add)\s*/i,'').trim();
    if(item) plan.steps.push(step('shopping.add',{ item }));
  } else if(/^add\b.*\b(to|into)\b.*\b(list|shopping)\b/i.test(lc)){
    const item = t.replace(/^add\s*/i,'').replace(/\s*\b(to|into)\b.*$/i,'').trim();
    if(item) plan.steps.push(step('shopping.add',{ item }));
  }

  // BUDGET
  // Accept “budget add <item> <amount>”, or “add $12 lunch”, or “$8 coffee”
  if(/^budget\s+add\b/i.test(lc)){
    const m = /budget\s+add\s+(.+?)\s+(-?\$?\d+(?:\.\d+)?)/i.exec(t);
    if(m){ plan.steps.push(step('budget.add',{ item:m[1].trim(), amount: safeNumber(m[2]) })); }
  } else if(/^\$?-?\d/.test(lc) && /\b(lunch|coffee|grocer|rent|bill|gas|uber|food|meal|shop|misc)\b/i.test(lc)){
    const m = /(-?\$?\d+(?:\.\d+)?)/.exec(t);
    const amount = m ? safeNumber(m[1]) : 0;
    const item = t.replace(/-?\$?\d+(?:\.\d+)?/,'').trim();
    if(item && amount) plan.steps.push(step('budget.add',{ item, amount }));
  }

  // REWARD (manual)
  // “grant 10 xp and 3 gold”, “+5xp +1g”
  if(/grant\b.*\b(xp|gold)\b/i.test(lc) || /(\+?\d+\s*xp)|(\+?\d+\s*g(?![a-z]))/i.test(lc)){
    const xpM = /(\+?\d+)\s*xp/i.exec(t);
    const gM  = /(\+?\d+)\s*g(?![a-z])/i.exec(t);
    const xp = xpM ? safeNumber(xpM[1],0) : 0;
    const gold = gM ? safeNumber(gM[1],0) : 0;
    if(xp || gold) plan.steps.push(step('reward.grant',{ xp, gold, reason:'manual grant' }));
  }

  return cleanPlan(plan);
}

// ---------- main ----------
export async function planActionsFromText(userText, opts={}){
  const endpoint = (localStorage.getItem('nyx_llm_endpoint') || window.NYX_LLM_ENDPOINT || '');

  // No endpoint → regex plan
  if(!endpoint) return localParse(userText);

  // With endpoint → ask LLM for SHORT JSON per schema
  const system = [
    'You are NYX inside NeuroQuest.',
    'Return ONLY a JSON object that matches this schema:',
    JSON.stringify(SCHEMA),
    'Allowed actions: '+Array.from(ALLOWED).join(', ')+'.',
    'Prefer side-tier for quests when not specified.',
    'Ask for confirm:true only if something is destructive or irreversible.',
    'Do not include any prose or code fences unless asked.'
  ].join('\n');

  const resp = await nyxAskLLM('PLAN: '+String(userText||''), { system, model:'gpt-4o-mini' }).catch(()=>'');

  // try raw JSON, then ```json blocks, then fallback regex
  let txt = String(resp||'').trim();
  let jsonText = txt;

  const block = txt.match(/```json\s*([\s\S]*?)\s*```/i);
  if(block) jsonText = block[1];

  try{
    const parsed = JSON.parse(jsonText);
    return cleanPlan(parsed);
  }catch(_){
    return localParse(userText);
  }
}

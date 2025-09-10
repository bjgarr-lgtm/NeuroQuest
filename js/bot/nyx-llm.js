export async function nyxAskLLM(userText, opts={}){
  const endpoint = localStorage.getItem('nyx_llm_endpoint') || (window.NYX_LLM_ENDPOINT||"");
  if(!endpoint){ throw new Error("NYX LLM endpoint not set"); }
  const history = (window.__nyx_history ||= []);
  history.push({role:'user', content:userText});
  const body = {
    system: opts.system || undefined,
    model: opts.model || undefined,
    messages: history.slice(-8)
  };
  const ac = new AbortController(); const t = setTimeout(()=>ac.abort(), opts.timeoutMs||15000);
  const res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body), signal: ac.signal });
  clearTimeout(t);
  if(!res.ok){ throw new Error("LLM error: "+await res.text()); }
  const data = await res.json();
  const text = (data && data.text) || "(no reply)";
  history.push({role:'assistant', content:text});
  return text;
}

// nyx-llm.js — robust client for the NYX LLM proxy
// - Proper timeout + AbortController
// - Small, bounded chat history
// - Clear error messages and graceful fallbacks

export async function nyxAskLLM(userText, opts = {}) {
  const endpoint =
    opts.endpoint ||
    localStorage.getItem('nyx_llm_endpoint') ||
    (window.NYX_LLM_ENDPOINT || '');

  if (!endpoint) {
    throw new Error('NYX LLM endpoint not set');
  }

  // Keep a tiny rolling history so the Worker stays cheap.
  // (Your Worker accepts { system, model, messages } and returns { text }.) :contentReference[oaicite:1]{index=1}
  const history = (window.__nyx_history ||= []);
  history.push({ role: 'user', content: String(userText || '') });

  // Trim to last 8 turns (user/assistant pairs). Keep it tiny.
  // If you want even cheaper calls, change 8 -> 6 or 4.
  const compactHistory = history.slice(-8);

  const payload = {
    system: opts.system || undefined,
    model: opts.model || undefined,
    messages: compactHistory
  };

  const controller = new AbortController();
  const timeoutMs = Math.max(3_000, Number(opts.timeoutMs || 15_000));
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // your Worker adds Authorization upstream
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    // Turn server errors into readable messages
    if (!res.ok) {
      let detail = '';
      try {
        const errJson = await res.json();
        detail = typeof errJson === 'string' ? errJson : JSON.stringify(errJson);
      } catch {
        detail = await res.text().catch(() => '');
      }
      throw new Error(`LLM error ${res.status}: ${detail || 'unknown error'}`);
    }

    const data = await res.json();
    const text = (data && data.text) || '(no reply)'; // Worker returns { text } on success. :contentReference[oaicite:2]{index=2}

    history.push({ role: 'assistant', content: text });
    return text;
  } catch (err) {
    // Distinguish timeout/abort from other failures
    if (err?.name === 'AbortError') {
      throw new Error('LLM timed out—try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

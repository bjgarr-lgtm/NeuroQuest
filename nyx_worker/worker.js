// nyx.worker — Cloudflare Worker for NYX chat proxy
// - GET /health                         → { ok, model }
// - POST / (JSON) { messages, system?, model?, temperature?, max_tokens?, stream? }
//   - stream:false (default)            → { text, usage? }
//   - stream:true                       → SSE passthrough (text/event-stream)
// Env:
//   OPENAI_API_KEY      (required)
//   OPENAI_API_BASE     (optional; default https://api.openai.com/v1)
//   NYX_MODEL_DEFAULT   (optional; default gpt-4o-mini)
//   CORS_ALLOW_ORIGIN   (optional; default *)

export default {
  async fetch(request, env) {
    const { method, headers } = request;
    const url = new URL(request.url);

    // --- CORS preflight ---
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) });
    }

    // --- Healthcheck ---
    if (method === 'GET' && url.pathname === '/health') {
      const model = env?.NYX_MODEL_DEFAULT || 'gpt-4o-mini';
      return json({ ok: true, model }, 200, env);
    }

    if (method !== 'POST') {
      return new Response('Use POST', { status: 405, headers: corsHeaders(env) });
    }

    // --- Guard: API key present ---
    if (!env?.OPENAI_API_KEY) {
      return json({ error: 'Server misconfigured: missing OPENAI_API_KEY' }, 500, env);
    }

    // --- Parse body safely ---
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400, env);
    }

    // Shape / defaults
    const {
      messages,
      system,
      model,
      temperature,
      max_tokens,
      stream,
      metadata // passthrough if caller wants it
    } = body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'Missing messages[]' }, 400, env);
    }

    const sysPrompt = typeof system === 'string' && system.trim().length
      ? system.trim()
      : defaultSystem();

    const payload = {
      model: model || env?.NYX_MODEL_DEFAULT || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: sysPrompt },
        ...messages
      ],
      temperature: typeof temperature === 'number' ? temperature : 0.6,
      max_tokens: typeof max_tokens === 'number' ? max_tokens : 700,
      stream: !!stream,
      // Optional passthrough; ignored by OpenAI but kept here in case you swap vendors
      metadata
    };

    const apiBase = (env?.OPENAI_API_BASE || 'https://api.openai.com/v1').replace(/\/+$/,'');
    const endpoint = `${apiBase}/chat/completions`;

    // --- Streaming branch (SSE passthrough) ---
    if (payload.stream) {
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Bubble up upstream errors as JSON (not SSE) so caller sees why
      if (!upstream.ok) {
        let errJson;
        try { errJson = await upstream.json(); } catch { errJson = { status: upstream.status, text: await upstream.text() }; }
        return json({ error: errJson }, upstream.status, env);
      }

      // Stream the upstream SSE directly
      const streamHeaders = {
        ...corsHeaders(env),
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      };
      return new Response(upstream.body, { status: 200, headers: streamHeaders });
    }

    // --- Non-streaming branch ---
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let data;
    try { data = await resp.json(); }
    catch {
      return json({ error: 'Upstream returned non-JSON' }, 502, env);
    }

    if (!resp.ok) {
      return json({ error: data }, resp.status, env);
    }

    const choice = data.choices?.[0]?.message?.content ?? '';
    const usage = data.usage || undefined;

    return json({ text: choice, usage }, 200, env);
  }
};

// ---------- helpers ----------
function corsHeaders(env) {
  const allow = env?.CORS_ALLOW_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };
}

function json(obj, status = 200, env) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) }
  });
}

function defaultSystem() {
  return [
    'You are NYX, a supportive ADHD-friendly game guide inside the NeuroQuest app.',
    'Tone: warm, brief, non-judgmental, practical.',
    'Always propose one tiny actionable step (<=2 minutes) when asked for help.',
    'Use the user state if provided in system context (level, xp, gold) to personalize encouragement.',
    'Never make medical claims. If user is in crisis, suggest reaching out to a trusted person or local resources.'
  ].join(' ');
}

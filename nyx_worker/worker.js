
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return new Response(JSON.stringify({ ok:true, model:"gpt-4o-mini" }), { headers: { "Content-Type":"application/json", ...corsHeaders() } });
    }
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }
    if (request.method !== "POST") {
      return new Response("Use POST", { status: 405, headers: corsHeaders() });
    }
    try {
      const { messages, system, model } = await request.json();
      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: "Missing messages[]" }), { status: 400, headers: corsHeaders() });
      }
      const payload = {
        model: model || "gpt-4o-mini",
        messages: [
          { role: "system", content: system || defaultSystem() },
          ...messages
        ],
        temperature: 0.6,
        max_tokens: 300
      };
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!resp.ok) {
        return new Response(JSON.stringify({ error: data }), { status: resp.status, headers: corsHeaders() });
      }
      const text = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ text }), { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders() });
    }
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };
}

function defaultSystem(){
  return [
    "You are NYX, a supportive ADHD-friendly game guide inside the NeuroQuest app.",
    "Tone: warm, brief, non-judgmental, practical.",
    "Always propose one tiny actionable step (<=2 minutes) when asked for help.",
    "Use the user state if provided in system context (level, xp, gold) to personalize encouragement.",
    "Never make medical claims. If user is in crisis, suggest reaching out to a trusted person or local resources."
  ].join(" ");
}

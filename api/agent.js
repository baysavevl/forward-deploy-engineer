const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const FALLBACK_MODEL = "gemini-2.0-flash";

const responseSchema = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description: "A concise FDE-style answer that continues the conversation.",
    },
    phase: {
      type: "string",
      description: "Current deployment phase, such as Discovery, Integration, Eval, Rollout, or Debug.",
    },
    toolRoute: {
      type: "string",
      description: "Likely enterprise tool or API route needed for the workflow.",
    },
    guardrail: {
      type: "string",
      description: "The most important safety, compliance, or business rule.",
    },
    metric: {
      type: "string",
      description: "A measurable launch, quality, or business outcome.",
    },
    nextStep: {
      type: "string",
      description: "The next practical action an FDE should take.",
    },
    risks: {
      type: "array",
      items: { type: "string" },
      description: "Top practical deployment risks.",
    },
  },
  required: ["reply", "phase", "toolRoute", "guardrail", "metric", "nextStep"],
  additionalProperties: false,
};

const scenarios = {
  billing: {
    label: "Telco billing dispute",
    route: "CRM lookup -> billing ledger -> policy retrieval -> ticket note",
    guardrail: "No refund or credit promise without policy match and role permission.",
    metric: "60% containment target with billing-CSAT and refund-error tracking.",
    nextStep: "Confirm source-of-truth fields for plan change, proration, and charge disputes.",
  },
  booking: {
    label: "Healthcare appointment reschedule",
    route: "Identity check -> appointment service -> provider calendar -> audit note",
    guardrail: "No appointment mutation until identity, clinic, and selected slot are confirmed.",
    metric: "95% successful reschedules without duplicate bookings or missing audit trails.",
    nextStep: "Map booking states, cancellation windows, and escalation ownership with clinic ops.",
  },
  card: {
    label: "Bank lost-card lock",
    route: "Identity proofing -> 2FA -> card controls API -> compliance log -> human escalation",
    guardrail: "Zero unauthorized state-changing actions; escalate if identity confidence is incomplete.",
    metric: "Lock-card containment under 2 minutes with 0 unsafe mutations.",
    nextStep: "Validate authentication step-up, recording policy, and rollback/escalation path.",
  },
};

const baseSystemPrompt = `
You are the live FDE demo agent on Vinh Luu's profile site for Wonderful-style enterprise AI deployment roles.
Answer like a real forward deployed engineer, not like a generic support bot.

Your job:
- Continue the conversation using the provided history.
- Translate ambiguous customer messages into deployment work: discovery, system mapping, integration route, guardrails, evals, rollout, observability, and business impact.
- Use first-person FDE framing when helpful: "I would..." or "As the deployment owner..."
- Be specific about enterprise systems, auth, audit, fallback, logging, latency, and human escalation.
- Keep replies concise enough for a live demo, around 80-130 words.
- Do not claim to call real customer systems. This is a demo; describe the intended tool route and safe action.
- If the user writes Vietnamese, answer naturally in English with small Vietnamese context when useful.
- Ask one practical clarifying question only when it would change the deployment plan.

Return only valid JSON matching the requested schema.
`.trim();

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  if (req.body) {
    if (typeof req.body === "string") return JSON.parse(req.body);
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sanitizeText(value, maxLength = 1600) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeScenario(value) {
  return Object.prototype.hasOwnProperty.call(scenarios, value) ? value : "billing";
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .map((turn) => ({
      role: turn && turn.role === "agent" ? "agent" : "user",
      text: sanitizeText(turn && turn.text, 1400),
    }))
    .filter((turn) => turn.text)
    .slice(-12);
}

function toGeminiContents(history, message) {
  const turns = sanitizeHistory(history);
  const cleanMessage = sanitizeText(message);
  const lastTurn = turns[turns.length - 1];

  if (cleanMessage && (!lastTurn || lastTurn.role !== "user" || lastTurn.text !== cleanMessage)) {
    turns.push({ role: "user", text: cleanMessage });
  }

  return turns.map((turn) => ({
    role: turn.role === "agent" ? "model" : "user",
    parts: [{ text: turn.text }],
  }));
}

function extractCandidateText(data) {
  return (
    data &&
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    Array.isArray(data.candidates[0].content.parts)
      ? data.candidates[0].content.parts.map((part) => part.text || "").join("")
      : ""
  ).trim();
}

function parseJsonText(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (_nestedError) {
      return null;
    }
  }
}

function makeFallback({ scenarioKey, message, history, source = "local-fallback", configured = false }) {
  const scenario = scenarios[scenarioKey] || scenarios.billing;
  const cleanMessage = sanitizeText(message);
  const previousAgentTurn = sanitizeHistory(history)
    .filter((turn) => turn.role === "agent")
    .pop();
  const lower = cleanMessage.toLowerCase();

  let phase = "Discovery to MVP";
  let focus = "I would first pin down the exact customer workflow, the system of record, and the action that is safe to automate.";
  let nextStep = scenario.nextStep;

  if (lower.includes("debug") || lower.includes("fail") || lower.includes("error") || lower.includes("tool")) {
    phase = "Production debug";
    focus = "I would treat this as a production integration issue: separate user intent, model output, tool request, upstream response, and policy decision before changing the prompt.";
    nextStep = "Pull the failed trace, replay it against the mocked tool contract, and add an eval before patching.";
  } else if (lower.includes("eval") || lower.includes("test") || lower.includes("quality")) {
    phase = "Eval design";
    focus = "I would convert real support logs into eval cases that cover happy paths, missing data, unsafe requests, language variation, and escalation.";
    nextStep = "Create a small gold dataset, define pass/fail rubrics, and block launch on regressions.";
  } else if (lower.includes("launch") || lower.includes("rollout") || lower.includes("pilot")) {
    phase = "Controlled rollout";
    focus = "I would launch narrow: one workflow, known customer segment, human fallback, live dashboard, and a rollback path.";
    nextStep = "Agree on canary volume, alert thresholds, and business owner sign-off before expanding.";
  } else if (previousAgentTurn) {
    phase = "Continuation";
    focus = "Continuing from the previous turn, I would preserve the same workflow map and only add the new constraint instead of restarting the design.";
  }

  return {
    reply: `${focus} For this ${scenario.label.toLowerCase()} workflow, the FDE value is connecting customer language to reliable enterprise action: ${scenario.route}. I would keep the first version narrow, instrument every turn, and measure whether containment improves without creating unsafe state changes.`,
    phase,
    toolRoute: scenario.route,
    guardrail: scenario.guardrail,
    metric: scenario.metric,
    nextStep,
    risks: ["Missing upstream fields", "Ambiguous policy ownership", "No production trace for failed turns"],
    source,
    configured,
  };
}

function normalizeGeminiPayload(payload, fallback) {
  if (!payload || typeof payload !== "object") return fallback;

  return {
    reply: sanitizeText(payload.reply, 2200) || fallback.reply,
    phase: sanitizeText(payload.phase, 120) || fallback.phase,
    toolRoute: sanitizeText(payload.toolRoute, 220) || fallback.toolRoute,
    guardrail: sanitizeText(payload.guardrail, 220) || fallback.guardrail,
    metric: sanitizeText(payload.metric, 180) || fallback.metric,
    nextStep: sanitizeText(payload.nextStep, 220) || fallback.nextStep,
    risks: Array.isArray(payload.risks)
      ? payload.risks.map((risk) => sanitizeText(risk, 160)).filter(Boolean).slice(0, 3)
      : fallback.risks,
  };
}

function getGeminiApiKey() {
  const directKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (directKey) return directKey;

  const encodedKey = process.env.GEMINI_API_KEY_B64 || process.env.GOOGLE_API_KEY_B64;
  if (!encodedKey) return "";

  try {
    return Buffer.from(encodedKey, "base64").toString("utf8").trim();
  } catch (error) {
    console.error("Gemini API key base64 decode failed", { message: error.message });
    return "";
  }
}

async function callGemini({ apiKey, model, contents, scenarioKey }) {
  const scenario = scenarios[scenarioKey] || scenarios.billing;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: `${baseSystemPrompt}\n\nCurrent workflow: ${scenario.label}\nDefault tool route: ${scenario.route}\nDefault guardrail: ${scenario.guardrail}\nDefault metric: ${scenario.metric}`,
          },
        ],
      },
      contents,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 900,
        responseMimeType: "application/json",
        responseJsonSchema: responseSchema,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini ${model} returned ${response.status}: ${errorText.slice(0, 500)}`);
  }

  return response.json();
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    console.error("Agent request body parse failed", { message: error.message });
    return sendJson(res, 400, { error: "Invalid JSON body" });
  }

  const scenarioKey = normalizeScenario(body.scenario);
  const message = sanitizeText(body.message);
  const history = sanitizeHistory(body.history);
  const fallback = makeFallback({ scenarioKey, message, history });

  if (!message) {
    return sendJson(res, 400, { error: "Message is required" });
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return sendJson(res, 200, fallback);
  }

  const contents = toGeminiContents(history, message);
  const models = [DEFAULT_MODEL, FALLBACK_MODEL].filter((model, index, values) => model && values.indexOf(model) === index);

  for (const model of models) {
    try {
      const data = await callGemini({ apiKey, model, contents, scenarioKey });
      const parsed = parseJsonText(extractCandidateText(data));
      const normalized = normalizeGeminiPayload(parsed, fallback);
      return sendJson(res, 200, {
        ...normalized,
        source: "gemini",
        configured: true,
        model,
      });
    } catch (error) {
      console.error("Gemini agent call failed", { model, message: error.message });
    }
  }

  return sendJson(res, 200, {
    ...makeFallback({ scenarioKey, message, history, source: "gemini-error", configured: true }),
  });
};

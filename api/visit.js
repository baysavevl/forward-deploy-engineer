const TELEGRAM_API = "https://api.telegram.org";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  if (req.body) {
    if (typeof req.body === "string") return JSON.parse(req.body || "{}");
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function header(req, name) {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value || "";
}

function sanitizeText(value, maxLength = 500) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return sanitizeText(value, 1200)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeHeaderValue(value) {
  const clean = sanitizeText(value, 160);
  if (!clean) return "";

  try {
    return decodeURIComponent(clean.replace(/\+/g, " "));
  } catch (_error) {
    return clean;
  }
}

function getClientIp(req) {
  const forwarded = header(req, "x-forwarded-for");
  if (forwarded) return sanitizeText(forwarded.split(",")[0], 80);
  return sanitizeText(header(req, "x-real-ip"), 80);
}

function getVisitorLocation(req, body) {
  const city = decodeHeaderValue(header(req, "x-vercel-ip-city"));
  const region = decodeHeaderValue(header(req, "x-vercel-ip-country-region"));
  const country = decodeHeaderValue(header(req, "x-vercel-ip-country"));
  const timezone = decodeHeaderValue(header(req, "x-vercel-ip-timezone")) || sanitizeText(body.timezone, 120);
  const location = [city, region, country].filter(Boolean).join(", ");

  return {
    location: location || "Unknown location",
    timezone: timezone || "Unknown timezone",
  };
}

function getDeviceSummary(req, body) {
  const userAgent = sanitizeText(body.userAgent || header(req, "user-agent"), 500);
  const platform = sanitizeText(body.platform, 120);
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const browser = userAgent.includes("Chrome")
    ? "Chrome"
    : userAgent.includes("Safari")
      ? "Safari"
      : userAgent.includes("Firefox")
        ? "Firefox"
        : "Browser";
  const device = isMobile ? "Mobile" : "Desktop";

  return [device, platform, browser].filter(Boolean).join(" • ");
}

function formatVisitMessage(req, body) {
  const now = new Date();
  const sessionId = sanitizeText(body.sessionId, 80) || "unknown-session";
  const firstVisit = body.firstVisit === true || body.firstVisit === "true";
  const ip = getClientIp(req) || "Unknown IP";
  const { location, timezone } = getVisitorLocation(req, body);
  const device = getDeviceSummary(req, body);
  const referrer = sanitizeText(body.referrer, 500) || "direct";
  const landing = sanitizeText(body.landing, 200) || "/";
  const screen = sanitizeText(body.screen, 80);
  const viewport = sanitizeText(body.viewport, 80);
  const language = sanitizeText(body.language, 80);

  return [
    "<b>Forward Deploy Engineer Bot</b>",
    `🟢 <b>New visit started</b>`,
    `${firstVisit ? "✨ First-time visitor" : "🔁 Returning visitor"}`,
    `🕘 ${escapeHtml(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }))}`,
    `🌏 ${escapeHtml(location)}`,
    `📡 <code>${escapeHtml(ip)}</code>`,
    `🕘 ${escapeHtml(timezone)}`,
    `🖥️ ${escapeHtml(device)}`,
    `📐 ${escapeHtml([viewport, screen, language].filter(Boolean).join(" • "))}`,
    `🔗 <b>Referrer:</b> ${escapeHtml(referrer)}`,
    `📄 <b>Landing:</b> ${escapeHtml(landing)}`,
    `🆔 <code>${escapeHtml(sessionId)}</code>`,
  ].join("\n");
}

function buildInlineKeyboard(sessionId) {
  const safeId = sanitizeText(sessionId, 48) || "unknown";

  return {
    inline_keyboard: [
      [
        { text: "🎯 Mark lead", callback_data: `lead:${safeId}` },
        { text: "👁 Info", callback_data: `info:${safeId}` },
        { text: "🚫 Block", callback_data: `block:${safeId}` },
      ],
    ],
  };
}

async function sendTelegramVisit(req, body) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_VISIT_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return { configured: false, delivered: false };
  }

  const sessionId = sanitizeText(body.sessionId, 80) || "unknown-session";
  const response = await fetch(`${TELEGRAM_API}/bot${encodeURIComponent(token)}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatVisitMessage(req, body),
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: buildInlineKeyboard(sessionId),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram sendMessage returned ${response.status}: ${errorText.slice(0, 300)}`);
  }

  return { configured: true, delivered: true };
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
    console.error("Visit request body parse failed", { message: error.message });
    return sendJson(res, 400, { error: "Invalid JSON body" });
  }

  try {
    const result = await sendTelegramVisit(req, body);
    return sendJson(res, 200, { ok: true, ...result });
  } catch (error) {
    console.error("Telegram visit notification failed", { message: error.message });
    return sendJson(res, 200, { ok: false, configured: true, delivered: false });
  }
};

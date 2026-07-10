import { list, put } from "@vercel/blob";
import { json } from "./_lib/auth.mjs";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4.1-mini";
const DEFAULT_MAX_PROMPT_CHARS = 20000;
const DEFAULT_WEEKLY_LIMIT = 20;
const DEFAULT_ACTIVATION_CODE = "FUXCNEWBEE";
const QUOTA_PATHNAME = "todo-capsule/summary-usage.json";
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;

export async function GET(request) {
  const auth = authenticateProxyRequest(request);
  if (auth) {
    return auth;
  }

  const userId = proxyUserId(request);
  if (hasUnlimitedAccess(request)) {
    return json({ ok: true, route: "/api/summary", activated: true, quota: null });
  }
  const store = await readQuotaStore();
  const quota = quotaForUser(store, userId);
  return json({ ok: true, route: "/api/summary", quota });
}

export async function POST(request) {
  const auth = authenticateProxyRequest(request);
  if (auth) {
    return auth;
  }

  const apiKey = process.env.AI_PROXY_API_KEY;
  if (!apiKey) {
    return json({ error: "Proxy is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const prompt = String(body?.prompt || "").trim();
  const maxPromptChars = Number(
    process.env.AI_PROXY_MAX_PROMPT_CHARS || DEFAULT_MAX_PROMPT_CHARS
  );

  if (!prompt) {
    return json({ error: "Missing prompt." }, { status: 400 });
  }
  if (prompt.length > maxPromptChars) {
    return json({ error: "Prompt is too long." }, { status: 413 });
  }

  const userId = proxyUserId(request);
  const activated = hasUnlimitedAccess(request);
  let store;
  if (!activated) {
    store = await readQuotaStore();
    const quota = quotaForUser(store, userId);
    if (quota.remaining <= 0) {
      return json({ error: "Weekly summary limit reached.", quota }, { status: 429 });
    }
  }

  const chatURL = chatCompletionsURL(process.env.AI_PROXY_BASE_URL || DEFAULT_BASE_URL);
  const model = process.env.AI_PROXY_MODEL || DEFAULT_MODEL;

  try {
    const upstream = await fetch(chatURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "你是一个简洁、诚实、善于归纳行动项的待办总结助手。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!upstream.ok) {
      return json({ error: "Model request failed." }, { status: upstream.status });
    }

    const data = await upstream.json();
    const text = String(data?.choices?.[0]?.message?.content || "").trim();
    if (!text) {
      return json({ error: "Empty model response." }, { status: 502 });
    }

    const nextQuota = activated ? null : await incrementQuota(store, userId);
    return json(
      { text, quota: nextQuota, activated },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return json({ error: "Proxy request failed." }, { status: 502 });
  }
}

function hasUnlimitedAccess(request) {
  const expectedCode = process.env.AI_PROXY_ACTIVATION_CODE || DEFAULT_ACTIVATION_CODE;
  const activationCode = request.headers.get("x-todo-capsule-activation") || "";
  return activationCode === expectedCode;
}

function chatCompletionsURL(baseURL) {
  const trimmed = String(baseURL || DEFAULT_BASE_URL).replace(/\/$/, "");
  if (trimmed.endsWith("/chat/completions")) {
    return trimmed;
  }
  if (trimmed.endsWith("/v1")) {
    return `${trimmed}/chat/completions`;
  }
  return `${trimmed}/v1/chat/completions`;
}

function authenticateProxyRequest(request) {
  const expectedAppToken = process.env.AI_PROXY_APP_TOKEN;
  if (!expectedAppToken) {
    return null;
  }

  const appToken = request.headers.get("x-todo-capsule-token") || "";
  return appToken === expectedAppToken
    ? null
    : json({ error: "Unauthorized." }, { status: 401 });
}

function proxyUserId(request) {
  const value = String(request.headers.get("x-todo-capsule-user") || "").trim();
  return /^[a-zA-Z0-9._:-]{8,128}$/.test(value) ? value : "anonymous";
}

function weeklyLimit() {
  const value = Number(process.env.AI_PROXY_WEEKLY_LIMIT || DEFAULT_WEEKLY_LIMIT);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : DEFAULT_WEEKLY_LIMIT;
}

function currentWindow(now = Date.now()) {
  const dayMs = 24 * 60 * 60 * 1000;
  const shanghaiNow = new Date(now + SHANGHAI_OFFSET_MS);
  const day = shanghaiNow.getUTCDay();
  const daysSinceSaturday = (day + 1) % 7;
  const localMidnightUtcMs =
    Date.UTC(
      shanghaiNow.getUTCFullYear(),
      shanghaiNow.getUTCMonth(),
      shanghaiNow.getUTCDate(),
      0,
      0,
      0,
      0
    ) - SHANGHAI_OFFSET_MS;
  const windowStartMs = localMidnightUtcMs - daysSinceSaturday * dayMs;
  const windowStart = new Date(windowStartMs).toISOString();
  const resetAt = new Date(windowStartMs + 7 * dayMs).toISOString();
  return { windowStart, resetAt };
}

function normalizeQuotaEntry(entry) {
  const current = currentWindow();
  if (!entry || entry.windowStart !== current.windowStart) {
    return {
      windowStart: current.windowStart,
      resetAt: current.resetAt,
      used: 0,
    };
  }
  return {
    windowStart: current.windowStart,
    resetAt: current.resetAt,
    used: Math.max(0, Number(entry.used || 0)),
  };
}

function quotaFromEntry(entry) {
  const limit = weeklyLimit();
  const used = Math.min(limit, entry.used);
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetAt: entry.resetAt,
  };
}

function quotaForUser(store, userId) {
  const entry = normalizeQuotaEntry(store.users?.[userId]);
  return quotaFromEntry(entry);
}

async function incrementQuota(store, userId) {
  const entry = normalizeQuotaEntry(store.users?.[userId]);
  entry.used += 1;
  store.users = {
    ...(store.users || {}),
    [userId]: entry,
  };
  await writeQuotaStore(store);
  return quotaFromEntry(entry);
}

async function readQuotaStore() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { users: {} };
  }

  try {
    const result = await list({
      limit: 1,
      prefix: QUOTA_PATHNAME,
    });
    const blob = result.blobs.find((item) => item.pathname === QUOTA_PATHNAME);
    if (!blob?.url) {
      return { users: {} };
    }
    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) {
      return { users: {} };
    }
    const data = await response.json();
    return data && typeof data === "object" ? { users: data.users || {} } : { users: {} };
  } catch {
    return { users: {} };
  }
}

async function writeQuotaStore(store) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return;
  }

  await put(QUOTA_PATHNAME, JSON.stringify(store, null, 2), {
    access: "public",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 0,
  });
}

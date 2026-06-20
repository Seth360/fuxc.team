const DATA_KEY = "uxhub-data";

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, PUT, OPTIONS",
      "access-control-allow-headers": "content-type, x-uxhub-token",
      ...(init.headers || {}),
    },
  });
}

function emptyData() {
  return {
    cards: {},
    reports: [],
    updatedAt: null,
  };
}

function isWriteAllowed(request, env) {
  if (!env.WRITE_TOKEN) return true;
  return request.headers.get("x-uxhub-token") === env.WRITE_TOKEN;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (url.pathname !== "/data") {
      return jsonResponse({ error: "Not found" }, { status: 404 });
    }

    if (request.method === "GET") {
      const stored = await env.UXHUB_KV.get(DATA_KEY, "json");
      return jsonResponse(stored || emptyData());
    }

    if (request.method === "PUT") {
      if (!isWriteAllowed(request, env)) {
        return jsonResponse({ error: "Unauthorized" }, { status: 401 });
      }

      const payload = await request.json();
      const nextData = {
        cards: payload.cards && typeof payload.cards === "object" ? payload.cards : {},
        reports: Array.isArray(payload.reports) ? payload.reports : [],
        updatedAt: new Date().toISOString(),
      };
      await env.UXHUB_KV.put(DATA_KEY, JSON.stringify(nextData));
      return jsonResponse(nextData);
    }

    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  },
};

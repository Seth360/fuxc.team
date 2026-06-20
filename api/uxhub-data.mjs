import fs from "node:fs/promises";
import path from "node:path";
import { list, put } from "@vercel/blob";

const UXHUB_DATA_PATHNAME = "uxhub/data.json";
const LOCAL_DATA_FILE = path.join(process.cwd(), ".local-data", "uxhub-data.json");
const INITIAL_DATA_URL = new URL("../UXhub/data/uxhub-data.json", import.meta.url);

function json(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
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

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readJsonFile(filePath, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    return fallback;
  }
}

async function writeJsonFile(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function emptyData() {
  return {
    cards: {},
    reports: [],
    reportOrder: {},
    assets: [],
    planning: [],
    updatedAt: null,
  };
}

function normalizeLegacyLocalStorageData(data) {
  if (!data || typeof data !== "object") return emptyData();
  return {
    cards: data["shareagent-uxhub-cards:v1"] || data.cards || {},
    reports: Array.isArray(data["shareagent-uxhub-reports:v1"])
      ? data["shareagent-uxhub-reports:v1"]
      : Array.isArray(data.reports)
        ? data.reports
        : [],
    reportOrder: data["shareagent-uxhub-report-order:v1"] || data.reportOrder || {},
    assets: Array.isArray(data["shareagent-uxhub-assets:v1"])
      ? data["shareagent-uxhub-assets:v1"]
      : Array.isArray(data.assets)
        ? data.assets
        : [],
    planning: Array.isArray(data["shareagent-uxhub-planning:v1"])
      ? data["shareagent-uxhub-planning:v1"]
      : Array.isArray(data.planning)
        ? data.planning
        : [],
    updatedAt: data.updatedAt || null,
  };
}

function normalizeSharedData(data) {
  const normalized = normalizeLegacyLocalStorageData(data);
  return {
    ...normalized,
    updatedAt: data?.updatedAt || normalized.updatedAt || new Date().toISOString(),
  };
}

async function readInitialData() {
  return normalizeLegacyLocalStorageData(await readJsonFile(INITIAL_DATA_URL, emptyData()));
}

async function readRemoteData() {
  if (!hasBlobToken()) {
    return normalizeSharedData(await readJsonFile(LOCAL_DATA_FILE, await readInitialData()));
  }

  try {
    const result = await list({
      limit: 1,
      prefix: UXHUB_DATA_PATHNAME,
    });
    const blob = result.blobs.find((item) => item.pathname === UXHUB_DATA_PATHNAME);
    if (!blob?.url) return normalizeSharedData(await readInitialData());

    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) return normalizeSharedData(await readInitialData());
    return normalizeSharedData(await response.json());
  } catch (error) {
    return normalizeSharedData(await readInitialData());
  }
}

async function writeRemoteData(data) {
  const normalized = normalizeSharedData(data);

  if (!hasBlobToken()) {
    await writeJsonFile(LOCAL_DATA_FILE, normalized);
    return normalized;
  }

  await put(UXHUB_DATA_PATHNAME, JSON.stringify(normalized, null, 2), {
    access: "public",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 60,
  });

  return normalized;
}

function isWriteAllowed(request) {
  const configuredToken = process.env.UXHUB_WRITE_TOKEN || "";
  if (!configuredToken) return true;
  return request.headers.get("x-uxhub-token") === configuredToken;
}

export async function OPTIONS() {
  return json({ ok: true });
}

export async function GET() {
  return json(await readRemoteData());
}

export async function PUT(request) {
  if (!isWriteAllowed(request)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  return json(await writeRemoteData(body));
}

export const config = {
  runtime: "nodejs",
};

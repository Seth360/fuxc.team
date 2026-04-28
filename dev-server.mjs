import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";

const ROOT_DIR = process.cwd();
const DEFAULT_PORT = Number(process.env.PORT || 4174);

const API_ROUTES = new Map([
  ["/api/content", "./api/content.mjs"],
  ["/api/upload", "./api/upload.mjs"],
  ["/api/cards", "./api/cards.mjs"],
  ["/api/knowledge-items", "./api/knowledge-items.mjs"],
  ["/api/members", "./api/members.mjs"],
  ["/api/auth/login", "./api/auth/login.mjs"],
  ["/api/auth/register", "./api/auth/register.mjs"],
  ["/api/auth/me", "./api/auth/me.mjs"],
  ["/api/auth/logout", "./api/auth/logout.mjs"],
]);

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".mp4", "video/mp4"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
]);

function getMimeType(filePath) {
  return MIME_TYPES.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

function toSafeFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const normalized = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(ROOT_DIR, normalized);
}

function collectRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

async function sendResponse(nodeResponse, response) {
  nodeResponse.statusCode = response.status;
  response.headers.forEach((value, key) => {
    nodeResponse.setHeader(key, value);
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  nodeResponse.end(buffer);
}

async function handleApiRequest(nodeRequest, nodeResponse, url) {
  const routeModulePath = API_ROUTES.get(url.pathname);
  if (!routeModulePath) {
    nodeResponse.statusCode = 404;
    nodeResponse.end("Not Found");
    return;
  }

  const routeModule = await import(routeModulePath);
  const method = String(nodeRequest.method || "GET").toUpperCase();
  const handler = routeModule[method];

  if (typeof handler !== "function") {
    nodeResponse.statusCode = 405;
    nodeResponse.end("Method Not Allowed");
    return;
  }

  const body = await collectRequestBody(nodeRequest);
  const requestUrl = new URL(url.pathname + url.search, `http://${nodeRequest.headers.host || "127.0.0.1"}`);
  const request = new Request(requestUrl, {
    method,
    headers: nodeRequest.headers,
    body: method === "GET" || method === "HEAD" ? undefined : body,
  });

  const response = await handler(request);
  await sendResponse(nodeResponse, response);
}

async function tryServeFile(filePath, nodeResponse) {
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      return false;
    }

    const content = await fs.readFile(filePath);
    nodeResponse.statusCode = 200;
    nodeResponse.setHeader("Content-Type", getMimeType(filePath));
    nodeResponse.end(content);
    return true;
  } catch (error) {
    return false;
  }
}

async function handleStaticRequest(nodeResponse, url) {
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = toSafeFilePath(pathname);

  if (await tryServeFile(safePath, nodeResponse)) {
    return;
  }

  nodeResponse.statusCode = 404;
  nodeResponse.end("Not Found");
}

const server = http.createServer(async (nodeRequest, nodeResponse) => {
  try {
    const url = new URL(nodeRequest.url || "/", `http://${nodeRequest.headers.host || "127.0.0.1"}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApiRequest(nodeRequest, nodeResponse, url);
      return;
    }

    await handleStaticRequest(nodeResponse, url);
  } catch (error) {
    nodeResponse.statusCode = 500;
    nodeResponse.setHeader("Content-Type", "application/json; charset=utf-8");
    nodeResponse.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      })
    );
  }
});

server.listen(DEFAULT_PORT, () => {
  console.log(`Local dev server running at http://127.0.0.1:${DEFAULT_PORT}`);
});

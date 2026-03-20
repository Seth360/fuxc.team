import crypto from "node:crypto";

const COOKIE_NAME = "fuxc_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSessionSecret() {
  return process.env.SESSION_SECRET || "change-this-session-secret";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "885522";
}

function sign(value) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function parseCookies(request) {
  const header = request.headers.get("cookie") || "";
  return header.split(";").reduce((acc, item) => {
    const [rawKey, ...rest] = item.trim().split("=");
    if (!rawKey) {
      return acc;
    }
    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export function isPasswordValid(password) {
  return password === getAdminPassword();
}

export function createSessionCookie() {
  const payload = {
    exp: Date.now() + SESSION_MAX_AGE * 1000,
    role: "admin",
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encoded);
  const value = `${encoded}.${signature}`;

  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function isAuthenticated(request) {
  const cookies = parseCookies(request);
  const raw = cookies[COOKIE_NAME];

  if (!raw || !raw.includes(".")) {
    return false;
  }

  const [encoded, signature] = raw.split(".");
  if (!encoded || !signature) {
    return false;
  }

  if (sign(encoded) !== signature) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return payload.exp && payload.exp > Date.now();
  } catch (error) {
    return false;
  }
}

export function json(data, init = {}) {
  return Response.json(data, init);
}

export function unauthorized() {
  return json(
    {
      error: "Unauthorized",
    },
    {
      status: 401,
    }
  );
}

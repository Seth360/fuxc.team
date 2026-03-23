import crypto from "node:crypto";

const COOKIE_NAME = "fuxc_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSessionSecret() {
  return process.env.SESSION_SECRET || "change-this-session-secret";
}

export function normalizeUsername(username) {
  return String(username || "").trim();
}

export function getAdminUsername() {
  return normalizeUsername(process.env.ADMIN_USERNAME || "admin");
}

export function getRegistrationInviteCode() {
  return String(process.env.REGISTRATION_INVITE_CODE || "NEWBEE").trim();
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

export function isAdminCredentials(username, password) {
  return normalizeUsername(username) === getAdminUsername() && isPasswordValid(password);
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto.scryptSync(String(password || ""), salt, 64).toString("base64url");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, passwordHash) {
  const [algorithm, salt, storedHash] = String(passwordHash || "").split("$");
  if (algorithm !== "scrypt" || !salt || !storedHash) {
    return false;
  }

  const derived = crypto.scryptSync(String(password || ""), salt, 64).toString("base64url");
  const derivedBuffer = Buffer.from(derived);
  const storedBuffer = Buffer.from(storedHash);

  if (derivedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(derivedBuffer, storedBuffer);
}

export function createSessionCookie({ username, role }) {
  const payload = {
    exp: Date.now() + SESSION_MAX_AGE * 1000,
    username: normalizeUsername(username),
    role: role === "admin" ? "admin" : "member",
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(encoded);
  const value = `${encoded}.${signature}`;

  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function getSession(request) {
  const cookies = parseCookies(request);
  const raw = cookies[COOKIE_NAME];

  if (!raw || !raw.includes(".")) {
    return {
      authenticated: false,
      username: "",
      role: "guest",
      isAdmin: false,
    };
  }

  const [encoded, signature] = raw.split(".");
  if (!encoded || !signature) {
    return {
      authenticated: false,
      username: "",
      role: "guest",
      isAdmin: false,
    };
  }

  if (sign(encoded) !== signature) {
    return {
      authenticated: false,
      username: "",
      role: "guest",
      isAdmin: false,
    };
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    const authenticated =
      Boolean(payload.exp && payload.exp > Date.now()) &&
      Boolean(normalizeUsername(payload.username)) &&
      Boolean(payload.role);

    const role = payload.role === "admin" ? "admin" : "member";
    const username = normalizeUsername(payload.username);

    return {
      authenticated,
      username: authenticated ? username : "",
      role: authenticated ? role : "guest",
      isAdmin: authenticated && role === "admin",
    };
  } catch (error) {
    return {
      authenticated: false,
      username: "",
      role: "guest",
      isAdmin: false,
    };
  }
}

export function isAuthenticated(request) {
  return getSession(request).authenticated;
}

export function isAdmin(request) {
  return getSession(request).isAdmin;
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

export function forbidden(message = "Forbidden") {
  return json(
    {
      error: message,
    },
    {
      status: 403,
    }
  );
}

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { list, put } from "@vercel/blob";

import {
  getAdminUsername,
  hashPassword,
  normalizeUsername,
  verifyPassword,
} from "./auth.mjs";

const MEMBERS_PATHNAME = "cms/members.json";
const LOCAL_DATA_DIR = path.join(process.cwd(), ".local-data");
const LOCAL_MEMBERS_FILE = path.join(LOCAL_DATA_DIR, "members.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, {
    recursive: true,
  });
}

async function readLocalJson(filePath, fallback) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return JSON.parse(text);
  } catch (error) {
    return fallback;
  }
}

async function writeLocalJson(filePath, data) {
  await ensureDirectory(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function createMemberId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `member-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createUsernameKey(username) {
  return normalizeUsername(username).toLowerCase();
}

export function validateUsername(username) {
  const value = normalizeUsername(username);

  if (!value) {
    throw new Error("用户名不能为空。");
  }

  if (!/^[\p{L}\p{N}_-]{2,24}$/u.test(value)) {
    throw new Error("用户名需为 2-24 位，可使用中文、字母、数字、下划线或短横线。");
  }

  return value;
}

export function validatePassword(password) {
  const value = String(password || "");

  if (value.length < 4 || value.length > 64) {
    throw new Error("密码长度需为 4-64 位。");
  }

  return value;
}

function normalizeMember(member) {
  const username = normalizeUsername(member.username);

  return {
    id: member.id || createMemberId(),
    username,
    usernameKey: member.usernameKey || createUsernameKey(username),
    passwordHash: member.passwordHash || "",
    role: member.role === "admin" ? "admin" : "member",
    createdAt: member.createdAt || new Date().toISOString(),
    updatedAt: member.updatedAt || member.createdAt || new Date().toISOString(),
    lastLoginAt: member.lastLoginAt || "",
  };
}

export function sanitizeMember(member, cardCount = 0) {
  return {
    id: member.id,
    username: member.username,
    role: member.role,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    lastLoginAt: member.lastLoginAt,
    cardCount,
  };
}

export async function readMembers() {
  if (!hasBlobToken()) {
    const parsed = await readLocalJson(LOCAL_MEMBERS_FILE, []);
    return Array.isArray(parsed) ? parsed.map(normalizeMember) : [];
  }

  try {
    const result = await list({
      limit: 1,
      prefix: MEMBERS_PATHNAME,
    });

    const blob = result.blobs.find((item) => item.pathname === MEMBERS_PATHNAME);
    if (!blob?.url) {
      return [];
    }

    const response = await fetch(blob.url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const text = await response.text();
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeMember);
  } catch (error) {
    return [];
  }
}

export async function writeMembers(members) {
  const normalized = Array.isArray(members) ? members.map(normalizeMember) : [];

  if (!hasBlobToken()) {
    await writeLocalJson(LOCAL_MEMBERS_FILE, clone(normalized));
    return normalized;
  }

  await put(MEMBERS_PATHNAME, JSON.stringify(clone(normalized), null, 2), {
    access: "public",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 60,
  });

  return normalized;
}

export async function deleteMemberById(memberId) {
  const safeId = String(memberId || "").trim();
  const members = await readMembers();
  const target = members.find((member) => member.id === safeId);

  if (!target) {
    return null;
  }

  const nextMembers = members.filter((member) => member.id !== safeId);
  await writeMembers(nextMembers);

  return sanitizeMember(target, 0);
}

export async function registerMember({ username, password }) {
  const safeUsername = validateUsername(username);
  const safePassword = validatePassword(password);
  const usernameKey = createUsernameKey(safeUsername);

  if (usernameKey === createUsernameKey(getAdminUsername())) {
    throw new Error("该用户名不可注册。");
  }

  const members = await readMembers();
  const exists = members.some((member) => member.usernameKey === usernameKey);

  if (exists) {
    throw new Error("用户名已存在。");
  }

  const now = new Date().toISOString();
  const nextMember = normalizeMember({
    username: safeUsername,
    usernameKey,
    passwordHash: hashPassword(safePassword),
    role: "member",
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  });

  await writeMembers([...members, nextMember]);
  return sanitizeMember(nextMember, 0);
}

export async function authenticateMember({ username, password }) {
  const safeUsername = validateUsername(username);
  const safePassword = validatePassword(password);
  const usernameKey = createUsernameKey(safeUsername);
  const members = await readMembers();
  const memberIndex = members.findIndex((item) => item.usernameKey === usernameKey);

  if (memberIndex === -1) {
    return null;
  }

  const currentMember = members[memberIndex];
  if (!verifyPassword(safePassword, currentMember.passwordHash)) {
    return null;
  }

  const updatedMember = normalizeMember({
    ...currentMember,
    lastLoginAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const nextMembers = [...members];
  nextMembers[memberIndex] = updatedMember;
  await writeMembers(nextMembers);

  return sanitizeMember(updatedMember, 0);
}

import { getSession, json, unauthorized } from "./_lib/auth.mjs";
import {
  getAppTypeLabel,
  normalizeCard,
  readSiteData,
  writeSiteData,
} from "./_lib/site-data.mjs";

export async function POST(request) {
  const session = getSession(request);
  if (!session.authenticated) {
    return unauthorized();
  }

  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim();

  if (!title) {
    return json(
      {
        error: "应用名称不能为空。",
      },
      {
        status: 400,
      }
    );
  }

  const siteData = await readSiteData();
  const fallbackTypeId = siteData.appTypes?.[0]?.id || "agent";
  const requestedType = String(body.type || fallbackTypeId).trim();
  const type = siteData.appTypes.some((item) => item.id === requestedType)
    ? requestedType
    : fallbackTypeId;
  const timestamp = new Date().toISOString();
  const nextCard = normalizeCard({
    type,
    label: getAppTypeLabel(siteData.appTypes, type),
    badge: "",
    title,
    description: String(body.description || "").trim(),
    stack: String(body.stack || "").trim(),
    mode: String(body.mode || "").trim(),
    tags: Array.isArray(body.tags)
      ? body.tags
      : String(body.tags || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    githubUrl: String(body.githubUrl || "").trim(),
    screenshot: String(body.screenshot || "").trim(),
    ownerUsername: session.username,
    ownerRole: session.role,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  try {
    const saved = await writeSiteData({
      ...siteData,
      cards: [nextCard, ...siteData.cards],
    });

    return json({
      card: saved.cards[0],
      cards: saved.cards,
    });
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : "创建卡片失败。",
      },
      {
        status: 500,
      }
    );
  }
}

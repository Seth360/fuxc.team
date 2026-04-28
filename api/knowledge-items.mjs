import { getSession, json, unauthorized } from "./_lib/auth.mjs";
import {
  normalizeKnowledgeItem,
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
  const url = String(body.url || "").trim();

  if (!title) {
    return json(
      {
        error: "标题不能为空。",
      },
      {
        status: 400,
      }
    );
  }

  if (!url) {
    return json(
      {
        error: "链接地址不能为空。",
      },
      {
        status: 400,
      }
    );
  }

  const siteData = await readSiteData();
  const timestamp = new Date().toISOString();
  const nextItem = normalizeKnowledgeItem({
    title,
    url,
    description: String(body.description || "").trim(),
    tags: Array.isArray(body.tags)
      ? body.tags
      : String(body.tags || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    ownerUsername: session.username,
    ownerRole: session.role,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  try {
    const saved = await writeSiteData({
      ...siteData,
      knowledgeItems: [nextItem, ...(siteData.knowledgeItems || [])],
    });

    return json({
      item: saved.knowledgeItems[0],
      knowledgeItems: saved.knowledgeItems,
    });
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : "创建知识条目失败。",
      },
      {
        status: 500,
      }
    );
  }
}

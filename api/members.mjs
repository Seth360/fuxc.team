import { isAdmin, json, unauthorized } from "./_lib/auth.mjs";
import {
  deleteMemberById,
  readMembers,
  sanitizeMember,
} from "./_lib/members.mjs";
import { readSiteData, writeSiteData } from "./_lib/site-data.mjs";

function createCardCountMap(cards) {
  return cards.reduce((acc, card) => {
    const key = String(card.ownerUsername || "").trim().toLowerCase();
    if (!key) {
      return acc;
    }

    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export async function GET(request) {
  if (!isAdmin(request)) {
    return unauthorized();
  }

  const [members, siteData] = await Promise.all([
    readMembers(),
    readSiteData(),
  ]);
  const cardCountMap = createCardCountMap(siteData.cards || []);

  return json({
    members: members.map((member) =>
      sanitizeMember(member, cardCountMap[String(member.username || "").toLowerCase()] || 0)
    ),
  });
}

export async function DELETE(request) {
  if (!isAdmin(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => ({}));
  const memberId = String(body.memberId || "").trim();

  if (!memberId) {
    return json(
      {
        error: "memberId is required.",
      },
      {
        status: 400,
      }
    );
  }

  const removedMember = await deleteMemberById(memberId);
  if (!removedMember) {
    return json(
      {
        error: "Member not found.",
      },
      {
        status: 404,
      }
    );
  }

  const siteData = await readSiteData();
  const nextCards = siteData.cards.filter(
    (card) => String(card.ownerUsername || "").trim().toLowerCase() !== removedMember.username.toLowerCase()
  );
  const saved = await writeSiteData({
    ...siteData,
    cards: nextCards,
  });

  return json({
    ok: true,
    removedMember,
    removedCardCount: siteData.cards.length - saved.cards.length,
  });
}

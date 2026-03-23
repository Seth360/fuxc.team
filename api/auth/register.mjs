import {
  createSessionCookie,
  getRegistrationInviteCode,
  json,
  normalizeUsername,
} from "../_lib/auth.mjs";
import { registerMember } from "../_lib/members.mjs";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");
  const inviteCode = String(body.inviteCode || "").trim();

  if (inviteCode !== getRegistrationInviteCode()) {
    return json(
      {
        error: "邀请码不正确。",
      },
      {
        status: 403,
      }
    );
  }

  try {
    const member = await registerMember({
      username,
      password,
    });

    return json(
      {
        authenticated: true,
        username: member.username,
        role: member.role,
        isAdmin: false,
      },
      {
        headers: {
          "Set-Cookie": createSessionCookie({
            username: member.username,
            role: member.role,
          }),
        },
      }
    );
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : "注册失败。",
      },
      {
        status: 400,
      }
    );
  }
}

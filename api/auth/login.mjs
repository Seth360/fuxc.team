import {
  createSessionCookie,
  getAdminUsername,
  isAdminCredentials,
  json,
  normalizeUsername,
} from "../_lib/auth.mjs";
import { authenticateMember } from "../_lib/members.mjs";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const username = normalizeUsername(body.username);
  const password = String(body.password || "");

  if (!username || !password) {
    return json(
      {
        error: "用户名和密码不能为空。",
      },
      {
        status: 400,
      }
    );
  }

  if (isAdminCredentials(username, password)) {
    return json(
      {
        authenticated: true,
        username: getAdminUsername(),
        role: "admin",
        isAdmin: true,
      },
      {
        headers: {
          "Set-Cookie": createSessionCookie({
            username: getAdminUsername(),
            role: "admin",
          }),
        },
      }
    );
  }

  const member = await authenticateMember({
    username,
    password,
  }).catch((error) => {
    return error instanceof Error ? error : null;
  });

  if (member instanceof Error || !member) {
    return json(
      {
        error: member instanceof Error ? member.message : "用户名或密码不正确。",
      },
      {
        status: 401,
      }
    );
  }

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
}

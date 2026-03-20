import { createSessionCookie, isPasswordValid, json } from "../_lib/auth.mjs";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const password = String(body.password || "");

  if (!isPasswordValid(password)) {
    return json(
      {
        error: "Invalid password",
      },
      {
        status: 401,
      }
    );
  }

  return json(
    {
      ok: true,
    },
    {
      headers: {
        "Set-Cookie": createSessionCookie(),
      },
    }
  );
}

import { clearSessionCookie, json } from "../_lib/auth.mjs";

export async function POST() {
  return json(
    {
      ok: true,
    },
    {
      headers: {
        "Set-Cookie": clearSessionCookie(),
      },
    }
  );
}

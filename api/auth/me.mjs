import { getSession, json } from "../_lib/auth.mjs";

export async function GET(request) {
  return json(getSession(request));
}

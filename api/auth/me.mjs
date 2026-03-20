import { isAuthenticated, json } from "../_lib/auth.mjs";

export async function GET(request) {
  return json({
    authenticated: isAuthenticated(request),
  });
}

import { isAuthenticated, json, unauthorized } from "./_lib/auth.mjs";
import {
  readSiteData,
  resetSiteData,
  writeSiteData,
} from "./_lib/site-data.mjs";

export async function GET() {
  const siteData = await readSiteData();
  return json(siteData);
}

export async function PUT(request) {
  if (!isAuthenticated(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => ({}));
  const siteData = await writeSiteData(body.siteData || body);
  return json(siteData);
}

export async function DELETE(request) {
  if (!isAuthenticated(request)) {
    return unauthorized();
  }

  const siteData = await resetSiteData();
  return json(siteData);
}

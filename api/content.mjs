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

  try {
    const body = await request.json().catch(() => ({}));
    const siteData = await writeSiteData(body.siteData || body);
    return json(siteData);
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : "Failed to save content.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request) {
  if (!isAuthenticated(request)) {
    return unauthorized();
  }

  try {
    const siteData = await resetSiteData();
    return json(siteData);
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : "Failed to reset content.",
      },
      {
        status: 500,
      }
    );
  }
}

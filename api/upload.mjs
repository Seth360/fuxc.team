import { getSession, json, unauthorized } from "./_lib/auth.mjs";
import { uploadCardImageFromDataUrl } from "./_lib/site-data.mjs";

export async function POST(request) {
  if (!getSession(request).authenticated) {
    return unauthorized();
  }

  const body = await request.json().catch(() => ({}));
  const dataUrl = String(body.dataUrl || "");
  const filename = String(body.filename || "screenshot");

  if (!dataUrl) {
    return json(
      {
        error: "Image data is required.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const url = await uploadCardImageFromDataUrl(dataUrl, filename);
    return json({ url });
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : "Upload failed.",
      },
      {
        status: 400,
      }
    );
  }
}

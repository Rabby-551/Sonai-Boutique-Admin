import bwipjs from "bwip-js";
import {
  checkRateLimit,
  rateLimitHeaders,
  requestRateLimitKey,
} from "@/lib/security/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ value: string }> },
) {
  const rateLimit = checkRateLimit(requestRateLimitKey(request, "barcode"), {
    limit: 120,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return new Response("Too many requests", {
      status: 429,
      headers: rateLimitHeaders(rateLimit),
    });
  }
  const { value } = await params;
  const safe = decodeURIComponent(value)
    .replace(/[^A-Za-z0-9._-]/g, "")
    .slice(0, 60);
  if (!safe) return new Response("Invalid barcode", { status: 400 });
  const png = await bwipjs.toBuffer({
    bcid: "code128",
    text: safe,
    scale: 2,
    height: 12,
    includetext: false,
    backgroundcolor: "FFFFFF",
  });
  return new Response(new Uint8Array(png), {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=3600",
      ...rateLimitHeaders(rateLimit),
    },
  });
}

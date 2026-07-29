import bwipjs from "bwip-js";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ value: string }> },
) {
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
    },
  });
}

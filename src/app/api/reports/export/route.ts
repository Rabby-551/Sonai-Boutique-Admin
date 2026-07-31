import { NextRequest, NextResponse } from "next/server";
import { reportQuerySchema } from "@/features/reports/schemas/reports";
import { getReportRepository } from "@/features/reports/data/repository-factory";
import { reportToCsv } from "@/features/reports/utils/csv";
import { requirePermission } from "@/lib/auth/session";
import {
  checkRateLimit,
  rateLimitHeaders,
  requestRateLimitKey,
} from "@/lib/security/rate-limit";
export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(
    requestRateLimitKey(request, "report-export"),
    {
      limit: 20,
      windowMs: 60_000,
    },
  );
  if (!rateLimit.allowed) {
    return new NextResponse("Too many export requests", {
      status: 429,
      headers: rateLimitHeaders(rateLimit),
    });
  }
  await requirePermission("reports.export");
  const query = reportQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  const report = await getReportRepository().run(query);
  return new NextResponse(reportToCsv(report), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="shonai-${query.type}-report.csv"`,
      "cache-control": "no-store",
      ...rateLimitHeaders(rateLimit),
    },
  });
}

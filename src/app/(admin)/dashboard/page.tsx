import { cookies } from "next/headers";
import { PremiumDashboard } from "@/features/dashboard/components/premium-dashboard";
import { dashboardQuerySchema } from "@/features/dashboard/schemas/dashboard-schema";
import { getDashboardWorkspace } from "@/features/dashboard/server/queries";
import { adminLocaleCookie, isAdminLocale } from "@/lib/i18n/admin-locale";

export const dynamic = "force-dynamic";
type Search = Record<string, string | string[] | undefined>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const raw = await searchParams;
  const query = dashboardQuerySchema.parse({
    ...Object.fromEntries(
      Object.entries(raw).map(([key, value]) => [
        key,
        Array.isArray(value) ? value[0] : value,
      ]),
    ),
  });
  const cookieLocale = (await cookies()).get(adminLocaleCookie)?.value;
  const locale = isAdminLocale(cookieLocale) ? cookieLocale : "en";
  const data = await getDashboardWorkspace(query);
  return <PremiumDashboard data={data} locale={locale} />;
}

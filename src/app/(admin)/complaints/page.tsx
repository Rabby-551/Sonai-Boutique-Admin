import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/features/catalog/components/pagination";
import { ComplaintFilters } from "@/features/complaints/components/complaint-filters";
import { ComplaintTable } from "@/features/complaints/components/complaint-table";
import { listComplaints } from "@/features/complaints/server/queries";
import { listCustomers } from "@/features/customers/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const one = (key: string) =>
    Array.isArray(raw[key]) ? raw[key]?.[0] : raw[key];
  const input = {
    query: one("query"),
    status: one("status") as
      | "all"
      | "open"
      | "acknowledged"
      | "in_progress"
      | "resolved"
      | "closed"
      | undefined,
    priority: one("priority") as
      "all" | "low" | "normal" | "high" | "urgent" | undefined,
    page: Math.max(Number(one("page")) || 1, 1),
    pageSize: 20,
  };
  const [result, customers, user] = await Promise.all([
    listComplaints(input),
    listCustomers({ pageSize: 100 }),
    getCurrentUser(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Customer care"
        title="Complaints"
        description="Accountable service cases with ownership, progress, notes, and resolution history."
        action={
          can(user.role, "complaints.create") && (
            <Link className="button" href="/complaints/new">
              Log complaint
            </Link>
          )
        }
      />
      <ComplaintFilters defaults={input} />
      <ComplaintTable complaints={result.items} customers={customers.items} />
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        pathname="/complaints"
      />
    </div>
  );
}

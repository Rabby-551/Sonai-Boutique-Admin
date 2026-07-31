import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StaffFilters } from "@/features/administration/components/staff-filters";
import { StaffTable } from "@/features/administration/components/staff-table";
import { listStaff } from "@/features/administration/server/queries";
import { listLocations } from "@/features/inventory/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const input = {
    query: typeof raw.query === "string" ? raw.query : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
    locationId: typeof raw.locationId === "string" ? raw.locationId : undefined,
  };
  const [staff, locations, user] = await Promise.all([
    listStaff(input),
    listLocations(),
    getCurrentUser(),
  ]);
  const names = Object.fromEntries(
    locations.map((item) => [item.id, item.name]),
  );
  return (
    <div className="stack">
      <PageHeader
        eyebrow="People"
        title="Staff"
        description="Branch-aware employment profiles and account relationships."
        action={
          can(user.role, "staff.manage") ? (
            <Link className="button" href="/staff/new">
              Add staff
            </Link>
          ) : undefined
        }
      />
      <StaffFilters defaults={input} locations={[...locations]} />
      <StaffTable staff={staff} locationNames={names} />
    </div>
  );
}

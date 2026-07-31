import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { UserTable } from "@/features/administration/components/user-table";
import { listStaff, listUsers } from "@/features/administration/server/queries";
import { requirePermission } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
export default async function UsersPage() {
  const current = await requirePermission("users.view");
  const [users, staff] = await Promise.all([listUsers(), listStaff({})]);
  const editable = can(current.role, "users.manage");
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Access"
        title="Users"
        description="Mock accounts linked to staff profiles. No credentials are stored."
        action={
          editable ? (
            <Link className="button" href="/users/new">
              New user
            </Link>
          ) : undefined
        }
      />
      <UserTable users={users} staff={staff} editable={editable} />
    </div>
  );
}

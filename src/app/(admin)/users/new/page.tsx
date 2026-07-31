import { PageHeader } from "@/components/ui/page-header";
import { UserForm } from "@/features/administration/components/user-form";
import { listStaff } from "@/features/administration/server/queries";
import { requirePermission } from "@/lib/auth/session";

export default async function NewUserPage() {
  await requirePermission("users.manage");
  const staff = await listStaff({ status: "active" });
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Access"
        title="New mock user"
        description="Link an account to staff without storing a password or reset token."
      />
      <UserForm staff={staff} />
    </div>
  );
}

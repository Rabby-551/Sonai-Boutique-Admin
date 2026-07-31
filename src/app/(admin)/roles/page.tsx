import { PageHeader } from "@/components/ui/page-header";
import { RoleEditor } from "@/features/administration/components/role-editor";
import { listRoles } from "@/features/administration/server/queries";
import { can } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/session";
export default async function RolesPage() {
  const [roles, user] = await Promise.all([listRoles(), getCurrentUser()]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Access"
        title="Roles and permissions"
        description="Persisted permission profiles enforced independently by server queries and actions."
      />
      {roles.map((profile) => (
        <RoleEditor
          key={profile.role}
          profile={profile}
          editable={can(user.role, "roles.manage")}
        />
      ))}
    </div>
  );
}

export type Role = "owner" | "manager" | "cashier" | "support";
export type Permission =
  | "dashboard.view"
  | "catalog.view"
  | "catalog.manage"
  | "inventory.manage"
  | "orders.manage"
  | "customers.manage"
  | "complaints.manage"
  | "procurement.manage"
  | "reports.view"
  | "staff.manage"
  | "payroll.manage"
  | "settings.manage"
  | "roles.manage"
  | "audit.view";

const rolePermissions: Record<Role, readonly Permission[]> = {
  owner: [
    "dashboard.view",
    "catalog.view",
    "catalog.manage",
    "inventory.manage",
    "orders.manage",
    "customers.manage",
    "complaints.manage",
    "procurement.manage",
    "reports.view",
    "staff.manage",
    "payroll.manage",
    "settings.manage",
    "roles.manage",
    "audit.view",
  ],
  manager: [
    "dashboard.view",
    "catalog.view",
    "catalog.manage",
    "inventory.manage",
    "orders.manage",
    "customers.manage",
    "complaints.manage",
    "procurement.manage",
    "reports.view",
    "staff.manage",
    "audit.view",
  ],
  cashier: [
    "dashboard.view",
    "catalog.view",
    "inventory.manage",
    "orders.manage",
    "customers.manage",
  ],
  support: [
    "catalog.view",
    "orders.manage",
    "customers.manage",
    "complaints.manage",
  ],
};

/** UI capability helper. Server actions must independently call requirePermission. */
export function can(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

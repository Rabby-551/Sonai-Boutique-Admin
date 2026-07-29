import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  ClipboardCheck,
  FileBarChart,
  Gift,
  LayoutDashboard,
  PackageSearch,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Truck,
  UserRoundCheck,
  UsersRound,
  Warehouse,
} from "lucide-react";
import type { Permission } from "@/lib/auth/permissions";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}
export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigation: NavigationGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard.view",
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        label: "Products",
        href: "/products",
        icon: ShoppingBag,
        permission: "catalog.view",
      },
      {
        label: "Categories",
        href: "/categories",
        icon: Tags,
        permission: "catalog.view",
      },
      {
        label: "Inventory",
        href: "/inventory",
        icon: Warehouse,
        permission: "inventory.manage",
      },
      {
        label: "Stock movements",
        href: "/stock-movements",
        icon: Boxes,
        permission: "inventory.manage",
      },
      {
        label: "Stock counts",
        href: "/stock-counts",
        icon: ClipboardCheck,
        permission: "inventory.manage",
      },
      {
        label: "Orders",
        href: "/orders",
        icon: ReceiptText,
        permission: "orders.manage",
      },
    ],
  },
  {
    label: "Relationships",
    items: [
      {
        label: "Customers",
        href: "/customers",
        icon: UsersRound,
        permission: "customers.manage",
      },
      {
        label: "Complaints",
        href: "/complaints",
        icon: UserRoundCheck,
        permission: "complaints.manage",
      },
      {
        label: "Suppliers",
        href: "/suppliers",
        icon: Truck,
        permission: "procurement.manage",
      },
      {
        label: "Purchase orders",
        href: "/purchase-orders",
        icon: PackageSearch,
        permission: "procurement.manage",
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      {
        label: "Campaigns",
        href: "/campaigns",
        icon: Gift,
        permission: "reports.view",
      },
      {
        label: "Reports",
        href: "/reports",
        icon: FileBarChart,
        permission: "reports.view",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Staff",
        href: "/staff",
        icon: BriefcaseBusiness,
        permission: "staff.manage",
      },
      {
        label: "Attendance",
        href: "/attendance",
        icon: Building2,
        permission: "staff.manage",
      },
      {
        label: "Payroll",
        href: "/payroll",
        icon: CircleDollarSign,
        permission: "payroll.manage",
      },
      {
        label: "Roles",
        href: "/roles",
        icon: ShieldCheck,
        permission: "roles.manage",
      },
      {
        label: "Audit log",
        href: "/audit-log",
        icon: BarChart3,
        permission: "audit.view",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        permission: "settings.manage",
      },
    ],
  },
];

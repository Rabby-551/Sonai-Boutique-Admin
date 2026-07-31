import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  BrainCircuit,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Cable,
  CircleDollarSign,
  ClipboardCheck,
  FileBarChart,
  Gift,
  Languages,
  LayoutDashboard,
  PackageSearch,
  PanelsTopLeft,
  Presentation,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tags,
  Truck,
  UserRoundCheck,
  UsersRound,
  WalletCards,
  Warehouse,
  Workflow,
} from "lucide-react";
import type { Permission, Role } from "@/lib/auth/permissions";
import { can } from "@/lib/auth/permissions";

export interface NavigationItem {
  id: string;
  label: string;
  description: string;
  keywords: readonly string[];
  href: string;
  icon: LucideIcon;
  permission: Permission;
  match?: "exact" | "prefix";
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
}

type ItemSeed = Omit<NavigationItem, "id" | "description" | "keywords"> &
  Partial<Pick<NavigationItem, "description" | "keywords">>;

function item(seed: ItemSeed): NavigationItem {
  return {
    ...seed,
    id: seed.href.replaceAll("/", "-").replace(/^-/, "") || "home",
    description: seed.description ?? `Open ${seed.label.toLowerCase()}`,
    keywords: seed.keywords ?? [],
  };
}

export const navigation: NavigationGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      item({
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard.view",
        match: "exact",
        keywords: ["home", "overview", "performance"],
      }),
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    items: [
      item({
        label: "Products",
        href: "/products",
        icon: ShoppingBag,
        permission: "catalog.view",
        keywords: ["catalog", "sku", "barcode"],
      }),
      item({
        label: "Categories",
        href: "/categories",
        icon: Tags,
        permission: "catalog.view",
        keywords: ["catalog", "collections"],
      }),
      item({
        label: "Website",
        href: "/website",
        icon: PanelsTopLeft,
        permission: "website.view",
        keywords: ["storefront", "homepage", "content", "cms", "bilingual"],
      }),
      item({
        label: "Inventory",
        href: "/inventory",
        icon: Warehouse,
        permission: "inventory.view",
        keywords: ["stock", "transfer", "reorder"],
      }),
      item({
        label: "Stock movements",
        href: "/stock-movements",
        icon: Boxes,
        permission: "inventory.view",
        keywords: ["adjustment", "ledger"],
      }),
      item({
        label: "Stock counts",
        href: "/stock-counts",
        icon: ClipboardCheck,
        permission: "inventory.count",
        keywords: ["cycle count", "variance"],
      }),
      item({
        label: "Orders",
        href: "/orders",
        icon: ReceiptText,
        permission: "orders.view",
        keywords: ["sales", "fulfillment", "returns"],
      }),
    ],
  },
  {
    id: "relationships-supply",
    label: "Relationships & supply",
    items: [
      item({
        label: "Customers",
        href: "/customers",
        icon: UsersRound,
        permission: "customers.view",
        keywords: ["profiles", "loyalty", "privacy"],
      }),
      item({
        label: "Complaints",
        href: "/complaints",
        icon: UserRoundCheck,
        permission: "complaints.view",
        keywords: ["support", "sla", "cases"],
      }),
      item({
        label: "Suppliers",
        href: "/suppliers",
        icon: Truck,
        permission: "procurement.view",
        keywords: ["vendors", "supply"],
      }),
      item({
        label: "Purchase orders",
        href: "/purchase-orders",
        icon: PackageSearch,
        permission: "procurement.view",
        keywords: ["procurement", "receiving"],
      }),
    ],
  },
  {
    id: "growth-finance",
    label: "Growth & finance",
    items: [
      item({
        label: "Campaigns",
        href: "/campaigns",
        icon: Gift,
        permission: "campaigns.view",
        keywords: ["promotions", "discounts"],
      }),
      item({
        label: "Reports",
        href: "/reports",
        icon: FileBarChart,
        permission: "reports.view",
        keywords: ["exports", "schedules", "analytics"],
      }),
      item({
        label: "Insights",
        href: "/insights",
        icon: BrainCircuit,
        permission: "reports.view",
        keywords: ["forecast", "recommendations"],
      }),
      item({
        label: "Segments",
        href: "/customers/segments",
        icon: UsersRound,
        permission: "customers.view",
        keywords: ["audiences", "cohorts"],
      }),
      item({
        label: "Loyalty rewards",
        href: "/loyalty/rewards",
        icon: Sparkles,
        permission: "customers.view",
        keywords: ["points", "tiers", "rewards"],
      }),
      item({
        label: "Reconciliation",
        href: "/finance/reconciliation",
        icon: WalletCards,
        permission: "reports.view",
        keywords: ["finance", "payments"],
      }),
      item({
        label: "Channels",
        href: "/channels",
        icon: Cable,
        permission: "orders.view",
        keywords: ["marketplace", "commerce"],
      }),
    ],
  },
  {
    id: "people-governance",
    label: "People & governance",
    items: [
      item({
        label: "Staff",
        href: "/staff",
        icon: BriefcaseBusiness,
        permission: "staff.view",
        keywords: ["employees", "team"],
      }),
      item({
        label: "Attendance",
        href: "/attendance",
        icon: Building2,
        permission: "attendance.view",
        keywords: ["leave", "timesheet"],
      }),
      item({
        label: "Payroll",
        href: "/payroll",
        icon: CircleDollarSign,
        permission: "payroll.view",
        keywords: ["salary", "runs"],
      }),
      item({
        label: "Users",
        href: "/users",
        icon: UsersRound,
        permission: "users.view",
        keywords: ["accounts", "access"],
      }),
      item({
        label: "Roles",
        href: "/roles",
        icon: ShieldCheck,
        permission: "roles.view",
        keywords: ["permissions", "access"],
      }),
      item({
        label: "Audit log",
        href: "/audit-log",
        icon: BarChart3,
        permission: "audit.view",
        keywords: ["history", "events"],
      }),
      item({
        label: "Settings",
        href: "/settings",
        icon: Settings,
        permission: "settings.view",
        keywords: ["configuration", "preferences"],
      }),
      item({
        label: "Localization",
        href: "/settings/localization",
        icon: Languages,
        permission: "settings.view",
        keywords: ["language", "currency"],
      }),
    ],
  },
  {
    id: "platform-review",
    label: "Platform & review",
    items: [
      item({
        label: "Automation",
        href: "/automation/rules",
        icon: Workflow,
        permission: "settings.view",
        keywords: ["rules", "workflows"],
      }),
      item({
        label: "Platform",
        href: "/platform",
        icon: Activity,
        permission: "settings.view",
        keywords: ["health", "migrations", "readiness"],
      }),
      item({
        label: "Demo & UAT",
        href: "/demo",
        icon: Presentation,
        permission: "catalog.view",
        keywords: ["acceptance", "release", "review"],
      }),
    ],
  },
];

export function isNavigationItemActive(item: NavigationItem, pathname: string) {
  return item.match === "exact"
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function navigationForRole(role: Role) {
  return navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((entry) => can(role, entry.permission)),
    }))
    .filter((group) => group.items.length > 0);
}

export function findNavigationItem(pathname: string, role?: Role) {
  const items = (role ? navigationForRole(role) : navigation).flatMap(
    (group) => group.items,
  );
  return items
    .filter((entry) => isNavigationItemActive(entry, pathname))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

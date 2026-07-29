import type { Permission } from "@/lib/auth/permissions";

export interface ModuleColumn {
  key: string;
  label: string;
}
export interface ModuleMetric {
  label: string;
  value: string;
  note: string;
}
export interface ModuleDefinition {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  permission: Permission;
  requirements: readonly string[];
  columns: readonly ModuleColumn[];
  metrics: readonly ModuleMetric[];
  rows: readonly Record<string, string | number>[];
}

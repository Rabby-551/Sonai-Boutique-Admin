import type { ReactNode } from "react";
import { requirePermission } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function PosLayout({ children }: { children: ReactNode }) {
  await requirePermission("pos.sell");
  return (
    <div className="pos-shell">
      <a className="skip-link" href="#pos-main">
        Skip to POS content
      </a>
      <main id="pos-main">{children}</main>
    </div>
  );
}

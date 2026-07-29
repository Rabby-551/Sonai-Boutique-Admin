import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export async function AdminShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Sidebar role={user.role} />
      <div className="main">
        <Topbar user={user} />
        <main className="content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

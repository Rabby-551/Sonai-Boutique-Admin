import { AlertCircle } from "lucide-react";
import type { AdminLocale } from "@/lib/i18n/admin-locale";

export function DashboardPanelState({
  message,
  locale,
}: {
  message: string;
  locale: AdminLocale;
}) {
  return (
    <div className="premium-panel-state" role="status">
      <AlertCircle aria-hidden="true" size={20} />
      <div>
        <strong>
          {locale === "bn"
            ? "এই তথ্য এখন পাওয়া যাচ্ছে না"
            : "This insight is unavailable"}
        </strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

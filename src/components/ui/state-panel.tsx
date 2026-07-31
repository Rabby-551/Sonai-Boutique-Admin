import type { LucideIcon } from "lucide-react";
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

export function StatePanel({
  title,
  description,
  action,
  icon: Icon = CircleAlert,
  tone = "neutral",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
  tone?: "neutral" | "danger" | "success";
}) {
  return (
    <div
      className={`state-panel ${tone}`}
      role={tone === "danger" ? "alert" : "status"}
    >
      <Icon aria-hidden size={22} />
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
        {action}
      </div>
    </div>
  );
}

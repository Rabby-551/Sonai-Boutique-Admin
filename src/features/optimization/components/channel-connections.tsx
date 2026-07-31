import {
  MessageCircleMore,
  RadioTower,
  ShoppingBasket,
  Store,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ChannelConnection } from "../schemas/optimization";

const iconByType = {
  storefront: Store,
  whatsapp: MessageCircleMore,
  messenger: RadioTower,
  marketplace: ShoppingBasket,
};

export function ChannelConnections({
  channels,
}: {
  channels: ChannelConnection[];
}) {
  return (
    <section className="service-grid" aria-label="Fictional sales channels">
      {channels.map((channel) => {
        const Icon = iconByType[channel.type];
        return (
          <article className="card service-card" key={channel.id}>
            <div className="service-card-head">
              <span className="service-icon" aria-hidden>
                <Icon size={19} />
              </span>
              <StatusBadge status={channel.status} />
            </div>
            <h2>{channel.name}</h2>
            <p>{channel.detail}</p>
            <div className="segment-counts">
              <div>
                <strong>{channel.reviewQueue}</strong>
                <span>Review drafts</span>
              </div>
              <div>
                <strong>{channel.conflicts}</strong>
                <span>Conflicts</span>
              </div>
            </div>
            <small className="muted">
              {channel.mode} · No external message or order is received.
            </small>
          </article>
        );
      })}
    </section>
  );
}

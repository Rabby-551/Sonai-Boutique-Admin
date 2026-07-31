import { PageHeader } from "@/components/ui/page-header";
import { ChannelConnections } from "@/features/optimization/components/channel-connections";
import { MockDesignNotice } from "@/features/optimization/components/mock-design-notice";
import { getChannelsWorkspace } from "@/features/optimization/server/queries";

export default async function ChannelsPage() {
  const workspace = await getChannelsWorkspace();
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Phase 8 · Omnichannel"
        title="Channel operations"
        description="A review-first connector design for storefront, social messages and marketplace orders."
      />
      <MockDesignNotice>
        No external account is connected; review counts and conflicts are
        deterministic.
      </MockDesignNotice>
      <ChannelConnections channels={workspace.channels} />
    </div>
  );
}

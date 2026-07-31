import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { CountTable } from "@/features/inventory/components/count-table";
import { listCounts, listLocations } from "@/features/inventory/server/queries";

export default async function StockCountsPage() {
  const [counts, locations] = await Promise.all([
    listCounts(),
    listLocations(),
  ]);
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Inventory assurance"
        title="Stock counts"
        description="Snapshot expected stock, record physical counts and approve variance movements."
        action={
          <Link className="button" href="/stock-counts/new">
            Schedule count
          </Link>
        }
      />
      <CountTable counts={counts} locations={locations} />
    </div>
  );
}

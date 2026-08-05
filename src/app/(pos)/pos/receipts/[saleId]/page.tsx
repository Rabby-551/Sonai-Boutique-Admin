import { notFound } from "next/navigation";
import { PosReceiptView } from "@/features/pos/components/pos-receipt";
import { getPosBootstrap, getPosSale } from "@/features/pos/server/queries";

export default async function PosReceiptPage({
  params,
}: {
  params: Promise<{ saleId: string }>;
}) {
  const sale = await getPosSale((await params).saleId);
  if (!sale) notFound();
  const bootstrap = await getPosBootstrap(sale.locationId);
  return (
    <PosReceiptView
      location={bootstrap.locations.find((item) => item.id === sale.locationId)}
      providers={bootstrap.providers}
      register={bootstrap.registers.find((item) => item.id === sale.registerId)}
      sale={sale}
      settings={bootstrap.settings}
    />
  );
}

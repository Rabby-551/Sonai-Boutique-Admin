import { getCurrentUser, requirePermission } from "@/lib/auth/session";
import { OperationsError } from "@/lib/operations-error";
import { getPosRepository } from "../data/repository-factory";

export async function getPosBootstrap(locationId?: string | null) {
  const user = await requirePermission("pos.sell");
  return getPosRepository().bootstrap(
    user.branchId ?? locationId ?? null,
    user.id,
  );
}

export async function listPosSales(query?: string, locationId?: string | null) {
  const user = await requirePermission("pos.return");
  return getPosRepository().listSales(query, user.branchId ?? locationId);
}

export async function listPosReturns(locationId?: string | null) {
  const user = await requirePermission("pos.return");
  return getPosRepository().listReturns(user.branchId ?? locationId);
}

export async function getPosSale(id: string) {
  const user = await requirePermission("pos.sell");
  const sale = await getPosRepository().getSale(id);
  if (user.branchId && sale?.locationId !== user.branchId)
    throw new OperationsError(
      "FORBIDDEN",
      "This receipt belongs to another store.",
    );
  return sale;
}

export async function listPosShifts(locationId?: string | null) {
  const user = await requirePermission("pos.shift");
  return getPosRepository().listShifts(user.branchId ?? locationId);
}

export async function listPosApprovals() {
  await requirePermission("pos.approve");
  return getPosRepository().listApprovals();
}

export async function getPosSettingsWorkspace() {
  await requirePermission("pos.configure");
  const repo = getPosRepository();
  const user = await getCurrentUser();
  const [bootstrap, locations, registers, providers] = await Promise.all([
    repo.bootstrap(null, user.id),
    repo.listLocations(),
    repo.listRegisters(),
    repo.listProviders(),
  ]);
  return { ...bootstrap, locations, registers, providers };
}

export async function getPosReconciliationSummary() {
  await requirePermission("pos.report");
  const repo = getPosRepository();
  const [sales, returns, providers] = await Promise.all([
    repo.listSales(),
    repo.listReturns(),
    repo.listProviders(),
  ]);
  const rows = new Map<
    string,
    { id: string; name: string; grossMinor: number; refundMinor: number }
  >();
  const add = (
    key: string,
    name: string,
    grossMinor: number,
    refundMinor: number,
  ) => {
    const row = rows.get(key) ?? {
      id: key,
      name,
      grossMinor: 0,
      refundMinor: 0,
    };
    row.grossMinor += grossMinor;
    row.refundMinor += refundMinor;
    rows.set(key, row);
  };
  for (const sale of sales)
    for (const tender of sale.tenders) {
      const provider = providers.find((item) => item.id === tender.providerId);
      add(
        tender.providerId ?? "cash",
        provider?.name ?? "Cash",
        tender.amountMinor,
        0,
      );
    }
  for (const item of returns.filter((entry) => entry.status === "completed"))
    for (const tender of item.refundTenders) {
      const provider = providers.find(
        (entry) => entry.id === tender.providerId,
      );
      add(
        tender.providerId ?? "cash",
        provider?.name ?? "Cash",
        0,
        tender.amountMinor,
      );
    }
  return [...rows.values()].map((row) => ({
    ...row,
    netMinor: row.grossMinor - row.refundMinor,
  }));
}

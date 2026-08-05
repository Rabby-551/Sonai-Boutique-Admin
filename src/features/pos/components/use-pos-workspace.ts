import { useActionState, useEffect, useMemo, useState } from "react";
import type {
  PosBootstrap,
  PosCatalogItem,
  TenderInput,
} from "../data/repository";
import {
  completeSaleAction,
  requestDiscountApprovalAction,
} from "../server/actions";
import { initialPosActionState } from "../server/action-state";
import type { SelectedCustomer } from "./customer-panel";
import type { TenderDraft } from "./tender-editor";

export interface CartLine {
  item: PosCatalogItem;
  quantity: number;
}

const firstTender = (): TenderDraft => ({
  id: crypto.randomUUID(),
  kind: "cash",
  providerId: "",
  reference: "",
  amount: "",
  received: "",
});

export function usePosWorkspace(bootstrap: PosBootstrap) {
  const shift = bootstrap.openShift!;
  const register = bootstrap.registers.find(
    (item) => item.id === shift.registerId,
  );
  const location = bootstrap.locations.find(
    (item) => item.id === shift.locationId,
  );
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState<SelectedCustomer>({
    id: null,
    name: "",
    phone: "",
  });
  const [tenders, setTenders] = useState<TenderDraft[]>([firstTender()]);
  const [manualDiscount, setManualDiscount] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [approvalId, setApprovalId] = useState("");
  const [saleState, saleAction, salePending] = useActionState(
    completeSaleAction,
    initialPosActionState,
  );
  const [approvalState, approvalAction, approvalPending] = useActionState(
    requestDiscountApprovalAction,
    initialPosActionState,
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bootstrap.catalog
      .filter(
        (item) =>
          !needle ||
          `${item.productName} ${item.variantLabel} ${item.sku} ${item.barcode}`
            .toLowerCase()
            .includes(needle),
      )
      .slice(0, 30);
  }, [bootstrap.catalog, query]);
  const subtotal = cart.reduce(
    (sum, line) => sum + line.item.priceMinor * line.quantity,
    0,
  );
  const campaignDiscount = useMemo(
    () =>
      bootstrap.campaigns
        .map((campaign) => ({
          campaign,
          value: cart.reduce((sum, line) => {
            const match =
              campaign.scope === "store" ||
              (campaign.scope === "variant" &&
                campaign.targetIds.includes(line.item.variantId)) ||
              (campaign.scope === "product" &&
                campaign.targetIds.includes(line.item.productId)) ||
              (campaign.scope === "category" &&
                campaign.targetIds.includes(line.item.categoryId));
            return (
              sum +
              (match
                ? Math.floor(
                    (line.item.priceMinor *
                      line.quantity *
                      campaign.percentageOff) /
                      100,
                  )
                : 0)
            );
          }, 0),
        }))
        .sort(
          (a, b) =>
            b.value - a.value || b.campaign.priority - a.campaign.priority,
        )[0]?.value ?? 0,
    [bootstrap.campaigns, cart],
  );
  const manualMinor = Math.round(Number(manualDiscount || 0) * 100);
  const total = Math.max(subtotal - campaignDiscount - manualMinor, 0);
  const lines = cart.map((line) => ({
    variantId: line.item.variantId,
    quantity: line.quantity,
  }));
  const fingerprint = JSON.stringify({ lines, amountMinor: manualMinor });
  useEffect(() => {
    if (saleState.status === "success" && saleState.id)
      window.location.assign(`/pos/receipts/${saleState.id}`);
  }, [saleState]);
  const add = (item: PosCatalogItem) =>
    setCart((current) => {
      const found = current.find(
        (line) => line.item.variantId === item.variantId,
      );
      if (found)
        return current.map((line) =>
          line.item.variantId === item.variantId
            ? { ...line, quantity: Math.min(line.quantity + 1, item.available) }
            : line,
        );
      return item.available ? [...current, { item, quantity: 1 }] : current;
    });
  const tenderPayload: TenderInput[] = tenders
    .map((item) => ({
      kind: item.kind,
      providerId: item.providerId || null,
      reference: item.reference || null,
      amountMinor: Math.round(Number(item.amount || 0) * 100),
      receivedMinor:
        item.kind === "cash"
          ? Math.round(Number(item.received || item.amount || 0) * 100)
          : null,
    }))
    .filter((item) => item.amountMinor > 0);
  const payload = {
    registerId: shift.registerId,
    shiftId: shift.id,
    locationId: shift.locationId,
    customerId: customer.id,
    customerName: customer.id ? null : customer.name || null,
    customerPhone: customer.id ? null : customer.phone || null,
    lines,
    manualDiscountMinor: manualMinor,
    manualDiscountReason: manualMinor ? discountReason : null,
    approvalId: manualMinor ? approvalId || null : null,
    tenders: tenderPayload,
  };
  return {
    shift,
    register,
    location,
    query,
    setQuery,
    cart,
    setCart,
    customer,
    setCustomer,
    tenders,
    setTenders,
    manualDiscount,
    setManualDiscount,
    discountReason,
    setDiscountReason,
    approvalId,
    setApprovalId,
    saleState,
    saleAction,
    salePending,
    approvalState,
    approvalAction,
    approvalPending,
    filtered,
    subtotal,
    campaignDiscount,
    manualMinor,
    total,
    fingerprint,
    add,
    payload,
  };
}

export type PosWorkspaceModel = ReturnType<typeof usePosWorkspace>;

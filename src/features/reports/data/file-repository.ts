import { ShonaiFileStore } from "@/lib/mock-store/file-store";
import type { ShonaiStore } from "@/lib/mock-store/schema";
import type { ReportQuery, ReportResult } from "../schemas/reports";
import type { ReportRepository } from "./repository";

export class FileReportRepository implements ReportRepository {
  constructor(private readonly store = new ShonaiFileStore()) {}
  async run(query: ReportQuery): Promise<ReportResult> {
    const store = await this.store.read();
    if (query.type === "inventory") return this.inventory(store, query);
    if (query.type === "campaigns") return this.campaigns(store);
    if (query.type === "procurement") return this.procurement(store, query);
    if (query.type === "payroll") return this.payroll(store, query);
    if (query.type === "pos_payments") return this.posPayments(store, query);
    return this.orders(store, query, query.type === "profit");
  }
  private orders(
    store: ShonaiStore,
    query: ReportQuery,
    profit: boolean,
  ): ReportResult {
    const orders = store.orders
      .filter((item) => item.status !== "cancelled")
      .filter(
        (item) => !query.from || item.createdAt.slice(0, 10) >= query.from,
      )
      .filter((item) => !query.to || item.createdAt.slice(0, 10) <= query.to)
      .filter(
        (item) =>
          !query.locationId ||
          query.locationId === "all" ||
          item.fulfillmentLocationId === query.locationId,
      )
      .filter(
        (item) => query.channel === "all" || item.source === query.channel,
      );
    const rows = orders.map((item) => {
      const cost = item.lines.reduce(
        (sum, line) => sum + line.unitCostMinor * line.quantity,
        0,
      );
      const revenue = item.totalMinor - item.deliveryMinor;
      return {
        order: item.orderNumber,
        date: item.createdAt.slice(0, 10),
        channel: item.source,
        location: item.fulfillmentLocationId ?? "Unassigned",
        revenue,
        discount: item.discountMinor,
        cost,
        profit: revenue - cost,
      };
    });
    const revenue = rows.reduce((sum, row) => sum + row.revenue, 0);
    const cost = rows.reduce((sum, row) => sum + row.cost, 0);
    return {
      title: profit ? "Profit report" : "Sales report",
      description:
        "Completed and active order values from the unified operational store.",
      metrics: [
        { label: "Orders", value: rows.length, format: "number" },
        { label: "Revenue", value: revenue, format: "money" },
        {
          label: profit ? "Gross profit" : "Discounts",
          value: profit
            ? revenue - cost
            : rows.reduce((sum, row) => sum + row.discount, 0),
          format: "money",
        },
      ],
      columns: profit
        ? [
            { key: "order", label: "Order", format: "text" },
            { key: "date", label: "Date", format: "date" },
            { key: "revenue", label: "Revenue", format: "money" },
            { key: "cost", label: "Cost", format: "money" },
            { key: "profit", label: "Gross profit", format: "money" },
          ]
        : [
            { key: "order", label: "Order", format: "text" },
            { key: "date", label: "Date", format: "date" },
            { key: "channel", label: "Channel", format: "text" },
            { key: "revenue", label: "Revenue", format: "money" },
            { key: "discount", label: "Discount", format: "money" },
          ],
      rows,
    };
  }
  private inventory(store: ShonaiStore, query: ReportQuery): ReportResult {
    const rows = store.balances
      .filter(
        (item) =>
          !query.locationId ||
          query.locationId === "all" ||
          item.locationId === query.locationId,
      )
      .map((item) => {
        const found = store.products
          .flatMap((product) =>
            product.variants.map((variant) => ({ product, variant })),
          )
          .find((entry) => entry.variant.id === item.variantId);
        return {
          sku: found?.variant.sku ?? item.variantId,
          location: item.locationId,
          onHand: item.onHand,
          reserved: item.reserved,
          available: item.onHand - item.reserved,
          value: item.onHand * (found?.product.costMinor ?? 0),
        };
      });
    return {
      title: "Inventory valuation",
      description:
        "On-hand quantities valued at current catalog cost; procurement history does not revalue stock.",
      metrics: [
        {
          label: "Units",
          value: rows.reduce((sum, row) => sum + row.onHand, 0),
          format: "number",
        },
        {
          label: "Available",
          value: rows.reduce((sum, row) => sum + row.available, 0),
          format: "number",
        },
        {
          label: "Value",
          value: rows.reduce((sum, row) => sum + row.value, 0),
          format: "money",
        },
      ],
      columns: [
        { key: "sku", label: "SKU", format: "text" },
        { key: "location", label: "Location", format: "text" },
        { key: "onHand", label: "On hand", format: "number" },
        { key: "reserved", label: "Reserved", format: "number" },
        { key: "value", label: "Value", format: "money" },
      ],
      rows,
    };
  }
  private campaigns(store: ShonaiStore): ReportResult {
    const rows = store.campaigns.map((item) => {
      const orders = store.orders.filter(
        (order) => order.campaignId === item.id && order.status !== "cancelled",
      );
      const revenue = orders.reduce(
        (sum, order) => sum + order.subtotalMinor - order.discountMinor,
        0,
      );
      return {
        campaign: item.code,
        name: item.name,
        status: item.status,
        orders: orders.length,
        revenue,
        discount: orders.reduce((sum, order) => sum + order.discountMinor, 0),
        roi: item.estimatedCostMinor
          ? Math.round(
              ((revenue - item.estimatedCostMinor) * 10_000) /
                item.estimatedCostMinor,
            ) / 100
          : 0,
      };
    });
    return {
      title: "Campaign performance",
      description:
        "Order attribution, discount impact, and simple ROI against estimated campaign cost.",
      metrics: [
        { label: "Campaigns", value: rows.length, format: "number" },
        {
          label: "Attributed revenue",
          value: rows.reduce((sum, row) => sum + row.revenue, 0),
          format: "money",
        },
        {
          label: "Discount impact",
          value: rows.reduce((sum, row) => sum + row.discount, 0),
          format: "money",
        },
      ],
      columns: [
        { key: "campaign", label: "Campaign", format: "text" },
        { key: "name", label: "Name", format: "text" },
        { key: "orders", label: "Orders", format: "number" },
        { key: "revenue", label: "Revenue", format: "money" },
        { key: "roi", label: "ROI %", format: "number" },
      ],
      rows,
    };
  }
  private procurement(store: ShonaiStore, query: ReportQuery): ReportResult {
    const rows = store.purchaseOrders
      .filter(
        (item) => !query.from || item.createdAt.slice(0, 10) >= query.from,
      )
      .filter((item) => !query.to || item.createdAt.slice(0, 10) <= query.to)
      .map((item) => ({
        po: item.orderNumber,
        supplier:
          store.suppliers.find((supplier) => supplier.id === item.supplierId)
            ?.name ?? item.supplierId,
        status: item.status,
        ordered: item.lines.reduce(
          (sum, line) => sum + line.orderedQuantity,
          0,
        ),
        accepted: item.lines.reduce(
          (sum, line) => sum + line.acceptedQuantity,
          0,
        ),
        total: item.totalMinor,
      }));
    return {
      title: "Procurement report",
      description:
        "Purchase-order commitments and accepted receiving progress.",
      metrics: [
        { label: "Purchase orders", value: rows.length, format: "number" },
        {
          label: "Accepted units",
          value: rows.reduce((sum, row) => sum + row.accepted, 0),
          format: "number",
        },
        {
          label: "Committed value",
          value: rows.reduce((sum, row) => sum + row.total, 0),
          format: "money",
        },
      ],
      columns: [
        { key: "po", label: "PO", format: "text" },
        { key: "supplier", label: "Supplier", format: "text" },
        { key: "status", label: "Status", format: "text" },
        { key: "accepted", label: "Accepted", format: "number" },
        { key: "total", label: "Total", format: "money" },
      ],
      rows,
    };
  }
  private payroll(store: ShonaiStore, query: ReportQuery): ReportResult {
    const rows = store.payrollRuns
      .filter(
        (item) =>
          !query.locationId ||
          query.locationId === "all" ||
          item.locationId === query.locationId,
      )
      .map((item) => ({
        payroll: item.payrollNumber,
        month: item.month,
        location: item.locationId ?? "Consolidated",
        status: item.status,
        staff: item.lines.length,
        gross: item.grossMinor,
        deductions: item.deductionsMinor,
        net: item.netMinor,
      }));
    return {
      title: "Payroll report",
      description:
        "Payroll snapshots by month and branch without employee-sensitive payment data.",
      metrics: [
        { label: "Runs", value: rows.length, format: "number" },
        {
          label: "Staff lines",
          value: rows.reduce((sum, row) => sum + row.staff, 0),
          format: "number",
        },
        {
          label: "Net payroll",
          value: rows.reduce((sum, row) => sum + row.net, 0),
          format: "money",
        },
      ],
      columns: [
        { key: "payroll", label: "Payroll", format: "text" },
        { key: "month", label: "Month", format: "date" },
        { key: "location", label: "Location", format: "text" },
        { key: "status", label: "Status", format: "text" },
        { key: "net", label: "Net", format: "money" },
      ],
      rows,
    };
  }
  private posPayments(store: ShonaiStore, query: ReportQuery): ReportResult {
    const entries = [
      ...store.posSales.flatMap((sale) =>
        sale.tenders.map((tender) => ({
          sale,
          tender,
          receipt: sale.receiptNumber,
        })),
      ),
      ...store.posReturns
        .filter((item) => item.status === "completed")
        .flatMap((item) =>
          item.refundTenders.map((tender) => ({
            sale:
              store.posSales.find((sale) => sale.id === item.saleId) ?? null,
            tender,
            receipt: item.receiptNumber ?? item.id,
            locationId: item.locationId,
            shiftId: item.shiftId,
          })),
        ),
    ].filter((entry) => {
      const locationId =
        entry.sale?.locationId ??
        ("locationId" in entry ? entry.locationId : "");
      const registerId = entry.sale?.registerId ?? "";
      const cashierId = entry.sale?.cashierId ?? "";
      return (
        (!query.from || entry.tender.recordedAt.slice(0, 10) >= query.from) &&
        (!query.to || entry.tender.recordedAt.slice(0, 10) <= query.to) &&
        (!query.locationId ||
          query.locationId === "all" ||
          locationId === query.locationId) &&
        (!query.registerId || registerId === query.registerId) &&
        (!query.cashierId || cashierId === query.cashierId) &&
        (!query.providerId || entry.tender.providerId === query.providerId) &&
        (query.paymentCategory === "all" ||
          entry.tender.kind === query.paymentCategory)
      );
    });
    const rows = entries.map((entry) => {
      const sale = entry.sale;
      const provider = store.paymentProviders.find(
        (item) => item.id === entry.tender.providerId,
      );
      const gross =
        entry.tender.direction === "payment" ? entry.tender.amountMinor : 0;
      const refund =
        entry.tender.direction === "refund" ? entry.tender.amountMinor : 0;
      return {
        receipt: entry.receipt,
        date: entry.tender.recordedAt.slice(0, 10),
        location:
          sale?.locationId ??
          ("locationId" in entry ? entry.locationId : "Unknown"),
        register:
          store.posRegisters.find((item) => item.id === sale?.registerId)
            ?.code ??
          sale?.registerId ??
          "Return desk",
        cashier: sale?.cashierId ?? "Manager refund",
        category: entry.tender.kind,
        provider:
          provider?.name ?? (entry.tender.kind === "cash" ? "Cash" : "Unknown"),
        gross,
        refund,
        net: gross - refund,
      };
    });
    const gross = rows.reduce((sum, row) => sum + row.gross, 0);
    const refunds = rows.reduce((sum, row) => sum + row.refund, 0);
    return {
      title: "POS payment-channel report",
      description:
        "Store, register, cashier, bank and MFS tender totals from completed POS activity.",
      metrics: [
        { label: "Gross tenders", value: gross, format: "money" },
        { label: "Refunds", value: refunds, format: "money" },
        { label: "Net received", value: gross - refunds, format: "money" },
      ],
      columns: [
        { key: "receipt", label: "Receipt", format: "text" },
        { key: "date", label: "Date", format: "date" },
        { key: "location", label: "Store", format: "text" },
        { key: "register", label: "Register", format: "text" },
        { key: "cashier", label: "Cashier", format: "text" },
        { key: "category", label: "Channel", format: "text" },
        { key: "provider", label: "Provider", format: "text" },
        { key: "gross", label: "Gross", format: "money" },
        { key: "refund", label: "Refund", format: "money" },
        { key: "net", label: "Net", format: "money" },
      ],
      rows,
    };
  }
}

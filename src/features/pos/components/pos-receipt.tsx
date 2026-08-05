"use client";
import { formatMoney } from "@/lib/formatting";
import type { InventoryLocation } from "@/features/inventory/schemas/inventory";
import type {
  PaymentProvider,
  PosRegister,
  PosSale,
  PosSettings,
} from "../schemas/pos";

export function PosReceiptView({
  sale,
  register,
  location,
  providers,
  settings,
}: {
  sale: PosSale;
  register?: PosRegister;
  location?: InventoryLocation;
  providers: readonly PaymentProvider[];
  settings: PosSettings;
}) {
  const date = new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date(sale.createdAt));
  return (
    <div className="receipt-page">
      <div className="receipt-actions no-print">
        <button className="button" onClick={() => window.print()}>
          Print / Save PDF
        </button>
        <a className="button secondary" href="/pos">
          New sale
        </a>
      </div>
      <article className="pos-receipt">
        <header>
          <span className="receipt-mark">SONAI</span>
          <h1>Sales receipt</h1>
          <p>
            {location?.name ?? sale.locationId}
            <br />
            {register?.name ?? sale.registerId}
          </p>
        </header>
        <dl className="receipt-meta">
          <div>
            <dt>Receipt</dt>
            <dd>{sale.receiptNumber}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{date}</dd>
          </div>
          <div>
            <dt>Cashier</dt>
            <dd>{sale.cashierId}</dd>
          </div>
          <div>
            <dt>Customer</dt>
            <dd>
              {sale.customer
                ? `${sale.customer.name} · ${sale.customer.phone.replace(/(?<=\+8801\d{3})\d{4}/, "****")}`
                : "Walk-in"}
            </dd>
          </div>
        </dl>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.lines.map((line) => (
              <tr key={line.variantId}>
                <td>
                  {line.productName}
                  <small>
                    {line.variantLabel} · {line.sku}
                  </small>
                </td>
                <td>{line.quantity}</td>
                <td>{formatMoney(line.lineTotalMinor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="receipt-totals">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatMoney(sale.subtotalMinor)}</dd>
          </div>
          <div>
            <dt>Campaign</dt>
            <dd>− {formatMoney(sale.campaignDiscountMinor)}</dd>
          </div>
          <div>
            <dt>Manual discount</dt>
            <dd>− {formatMoney(sale.manualDiscountMinor)}</dd>
          </div>
          <div className="receipt-total">
            <dt>Total</dt>
            <dd>{formatMoney(sale.totalMinor)}</dd>
          </div>
        </dl>
        <section className="receipt-tenders">
          <h2>Payment</h2>
          {sale.tenders.map((tender) => (
            <div key={tender.id}>
              <span>
                {tender.kind === "cash"
                  ? "Cash"
                  : (providers.find((item) => item.id === tender.providerId)
                      ?.name ?? tender.kind.toUpperCase())}
              </span>
              <strong>{formatMoney(tender.amountMinor)}</strong>
              {tender.changeMinor > 0 && (
                <small>Change {formatMoney(tender.changeMinor)}</small>
              )}
              {tender.reference && <small>Ref {tender.reference}</small>}
            </div>
          ))}
        </section>
        <footer>
          <p>{settings.receiptFooter}</p>
          <small>
            Returns and exchanges require staff review. Keep this receipt
            number.
          </small>
        </footer>
      </article>
    </div>
  );
}

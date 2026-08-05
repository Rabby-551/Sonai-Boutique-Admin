import Link from "next/link";
import { ShiftList } from "@/features/pos/components/shift-list";
import { getPosBootstrap, listPosShifts } from "@/features/pos/server/queries";

export default async function PosShiftsPage() {
  const [shifts, bootstrap] = await Promise.all([
    listPosShifts(),
    getPosBootstrap(),
  ]);
  return (
    <div className="pos-subpage">
      <header className="pos-subpage-header">
        <div>
          <span className="eyebrow">Register control</span>
          <h1>Cashier shifts</h1>
          <p>
            Opening float, expected cash, counted cash and variance by register.
          </p>
        </div>
        <Link className="button secondary" href="/pos">
          Back to register
        </Link>
      </header>
      <ShiftList registers={bootstrap.registers} shifts={shifts} />
    </div>
  );
}

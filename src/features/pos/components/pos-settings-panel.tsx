import type { InventoryLocation } from "@/features/inventory/schemas/inventory";
import type { PaymentProvider, PosRegister } from "../schemas/pos";
import { LocationForm, ProviderForm, RegisterForm } from "./pos-settings-forms";

export function PosSettingsPanel({
  locations,
  providers,
  registers,
}: {
  locations: readonly InventoryLocation[];
  providers: readonly PaymentProvider[];
  registers: readonly PosRegister[];
}) {
  return (
    <div className="stack">
      <LocationPanel locations={locations} />
      <section className="card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Counters</span>
            <h2>Physical registers</h2>
          </div>
        </div>
        <div className="stack compact">
          {registers.map((item) => (
            <RegisterForm key={item.id} locations={locations} register={item} />
          ))}
          <RegisterForm locations={locations} />
        </div>
      </section>
      <section className="card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Tender routing</span>
            <h2>Banks and MFS providers</h2>
          </div>
        </div>
        <div className="stack compact">
          {providers.map((item) => (
            <ProviderForm key={item.id} provider={item} />
          ))}
          <ProviderForm />
        </div>
      </section>
    </div>
  );
}

function LocationPanel({
  locations,
}: {
  locations: readonly InventoryLocation[];
}) {
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Store network</span>
          <h2>Physical stores</h2>
          <p className="muted">
            New stores receive zero inventory balances until stock is
            transferred or received.
          </p>
        </div>
      </div>
      <div className="stack compact">
        {locations.map((item) => (
          <LocationForm key={item.id} location={item} />
        ))}
        <LocationForm />
      </div>
    </section>
  );
}

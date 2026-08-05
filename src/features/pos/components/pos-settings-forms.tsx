"use client";

import { useActionState } from "react";
import type { InventoryLocation } from "@/features/inventory/schemas/inventory";
import type { PaymentProvider, PosRegister } from "../schemas/pos";
import {
  savePosLocationAction,
  savePosProviderAction,
  savePosRegisterAction,
} from "../server/actions";
import { initialPosActionState } from "../server/action-state";

export function ProviderForm({ provider }: { provider?: PaymentProvider }) {
  const [state, action, pending] = useActionState(
    savePosProviderAction,
    initialPosActionState,
  );
  return (
    <form action={action} className="pos-setting-row">
      <input name="id" type="hidden" value={provider?.id ?? ""} />
      <input name="version" type="hidden" value={provider?.version ?? ""} />
      <select
        className="select"
        defaultValue={provider?.category ?? "card"}
        name="category"
      >
        <option value="card">Bank card</option>
        <option value="mfs">MFS</option>
      </select>
      <input
        className="input"
        defaultValue={provider?.code}
        name="code"
        placeholder="Code"
        required
      />
      <input
        className="input"
        defaultValue={provider?.name}
        name="name"
        placeholder="Display name"
        required
      />
      <label className="check-label">
        <input
          defaultChecked={provider?.active ?? true}
          name="active"
          type="checkbox"
        />{" "}
        Active
      </label>
      <button className="button small" disabled={pending}>
        {provider ? "Save" : "Add provider"}
      </button>
      {state.message && <small>{state.message}</small>}
    </form>
  );
}

export function RegisterForm({
  register,
  locations,
}: {
  register?: PosRegister;
  locations: readonly InventoryLocation[];
}) {
  const [state, action, pending] = useActionState(
    savePosRegisterAction,
    initialPosActionState,
  );
  return (
    <form action={action} className="pos-setting-row">
      <input name="id" type="hidden" value={register?.id ?? ""} />
      <input name="version" type="hidden" value={register?.version ?? ""} />
      <select
        className="select"
        defaultValue={register?.locationId ?? ""}
        name="locationId"
        required
      >
        <option value="">Physical store</option>
        {locations.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <input
        className="input"
        defaultValue={register?.code}
        name="code"
        placeholder="Register code"
        required
      />
      <input
        className="input"
        defaultValue={register?.name}
        name="name"
        placeholder="Register name"
        required
      />
      <label className="check-label">
        <input
          defaultChecked={register?.active ?? true}
          name="active"
          type="checkbox"
        />{" "}
        Active
      </label>
      <button className="button small" disabled={pending}>
        {register ? "Save" : "Add register"}
      </button>
      {state.message && <small>{state.message}</small>}
    </form>
  );
}

export function LocationForm({ location }: { location?: InventoryLocation }) {
  const [state, action, pending] = useActionState(
    savePosLocationAction,
    initialPosActionState,
  );
  return (
    <form action={action} className="pos-setting-row">
      <input
        className="input"
        defaultValue={location?.id}
        name="id"
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        placeholder="stable-store-slug"
        readOnly={!!location}
        required
      />
      <input
        className="input"
        defaultValue={location?.name}
        name="name"
        placeholder="Store name"
        required
      />
      <label className="check-label">
        <input
          defaultChecked={location?.active ?? true}
          name="active"
          type="checkbox"
        />{" "}
        Active
      </label>
      <button className="button small" disabled={pending}>
        {location ? "Save store" : "Add store"}
      </button>
      {state.message && <small>{state.message}</small>}
    </form>
  );
}

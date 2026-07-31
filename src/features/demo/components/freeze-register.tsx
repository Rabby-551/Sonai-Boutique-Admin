import { StatusBadge } from "@/components/ui/status-badge";
import type { FreezeRecord } from "../schemas/demo";

export function FreezeRegister({ records }: { records: FreezeRecord[] }) {
  return (
    <section aria-labelledby="freeze-register-title">
      <div className="section-title">
        <div>
          <div className="eyebrow">Controlled change</div>
          <h2 id="freeze-register-title">Design freeze register</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table className="freeze-table">
          <thead>
            <tr>
              <th>Area</th>
              <th>Frozen decision</th>
              <th>Policy</th>
              <th>Change requires</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <th scope="row" data-label="Area">
                  {record.area}
                </th>
                <td data-label="Frozen decision">{record.decision}</td>
                <td data-label="Policy">
                  <StatusBadge status={record.policy} />
                </td>
                <td data-label="Change requires">{record.changeRequires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

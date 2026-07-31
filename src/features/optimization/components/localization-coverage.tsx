import { StatusBadge } from "@/components/ui/status-badge";
import type { LocalizationArea } from "../schemas/optimization";

export function LocalizationCoverage({ areas }: { areas: LocalizationArea[] }) {
  return (
    <section className="card table-card" aria-labelledby="localization-title">
      <div className="table-heading">
        <div>
          <div className="eyebrow">English / বাংলা</div>
          <h2 id="localization-title">Localization readiness</h2>
        </div>
        <span className="badge warning">Design preview</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Area</th>
              <th scope="col">Coverage</th>
              <th scope="col">Review</th>
              <th scope="col">Status</th>
              <th scope="col">English sample</th>
              <th scope="col">বাংলা নমুনা</th>
            </tr>
          </thead>
          <tbody>
            {areas.map((area) => {
              const translated = Math.round(
                (area.translated / area.keys) * 100,
              );
              const reviewed = Math.round((area.reviewed / area.keys) * 100);
              return (
                <tr key={area.id}>
                  <td>
                    <strong>{area.area}</strong>
                    <small>{area.keys} text keys</small>
                  </td>
                  <td>
                    <div className="progress">
                      <span style={{ width: `${translated}%` }} />
                    </div>
                    <small>{translated}% translated</small>
                  </td>
                  <td>{reviewed}%</td>
                  <td>
                    <StatusBadge status={area.status} />
                  </td>
                  <td>{area.sampleEnglish}</td>
                  <td lang="bn">{area.sampleBangla}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="table-note">
        Persisted statuses and identifiers remain language-neutral; professional
        translation review is still required.
      </div>
    </section>
  );
}

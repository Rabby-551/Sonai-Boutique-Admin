import type { ForecastPoint } from "../schemas/optimization";

export function DemandForecast({ points }: { points: ForecastPoint[] }) {
  const maximum = Math.max(...points.map((item) => item.upper), 1);
  return (
    <section className="card" aria-labelledby="forecast-title">
      <div className="section-title">
        <div>
          <div className="eyebrow">Demand signal</div>
          <h2 id="forecast-title">Six-week unit outlook</h2>
        </div>
        <span className="badge success">Baseline validated</span>
      </div>
      <p className="muted">
        Fictional weekly demand with confidence range. Future weeks are advisory
        and do not change stock.
      </p>
      <div
        className="forecast-chart"
        role="img"
        aria-label={points
          .map(
            (item) =>
              `${item.week}: forecast ${item.forecast}, range ${item.lower} to ${item.upper}${item.actual === null ? "" : `, actual ${item.actual}`}`,
          )
          .join(". ")}
      >
        {points.map((point) => (
          <div className="forecast-column" key={point.week}>
            <div
              className="forecast-range"
              style={{
                height: `${Math.max(10, (point.upper / maximum) * 100)}%`,
              }}
            >
              <span className="forecast-value">{point.forecast}</span>
              <span
                className="forecast-fill"
                style={{
                  height: `${Math.max(8, (point.forecast / point.upper) * 100)}%`,
                }}
              />
            </div>
            <strong>{point.week}</strong>
            <small>
              {point.actual === null ? "Forecast" : `Actual ${point.actual}`}
            </small>
          </div>
        ))}
      </div>
      <details className="data-summary">
        <summary>Accessible forecast data</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Week</th>
                <th scope="col">Actual</th>
                <th scope="col">Forecast</th>
                <th scope="col">Lower</th>
                <th scope="col">Upper</th>
              </tr>
            </thead>
            <tbody>
              {points.map((item) => (
                <tr key={item.week}>
                  <td>{item.week}</td>
                  <td>{item.actual ?? "Future"}</td>
                  <td>{item.forecast}</td>
                  <td>{item.lower}</td>
                  <td>{item.upper}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

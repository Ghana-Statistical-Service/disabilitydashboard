// app/graphcomponent/AgeChartDetail.js
// Full-size age chart + data table, shown inside the expand modal.
"use client";

const W = 960;
const H = 380;
const M = { top: 28, right: 12, bottom: 40, left: 60 };
const INNER_W = W - M.left - M.right;
const INNER_H = H - M.top - M.bottom;

const fmtInt = (v) => Math.round(v).toLocaleString("en-US");
const fmtCompact = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(v >= 100_000 ? 0 : 1)}k`;
  return String(Math.round(v));
};

/** Round axis maximum up to a "nice" step (1, 2, 2.5, 5 × 10^n). */
function niceTicks(max, count = 5) {
  if (!(max > 0)) return [0, 1];
  const raw = max / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw);
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let t = 0; t <= top + step / 2; t += step) ticks.push(t);
  return ticks;
}

export default function AgeChartDetail({ data, mode }) {
  const rows = Array.isArray(data) ? data : [];
  const isRate = mode === "rate";
  const metric = (d) =>
    isRate ? Number(d.prevalence) || 0 : Number(d.value) || 0;

  const ticks = niceTicks(Math.max(...rows.map(metric), 0));
  const top = ticks[ticks.length - 1] || 1;
  const band = INNER_W / Math.max(rows.length, 1);
  const barW = band * 0.66;
  const y = (v) => M.top + INNER_H - (v / top) * INNER_H;
  const fmtAxis = (v) => (isRate ? `${v}%` : fmtCompact(v));
  const fmtBar = (v) => (isRate ? `${v.toFixed(1)}%` : fmtCompact(v));

  // Summary facts for the header strip
  const withData = rows.filter((r) => Number(r.total) > 0);
  const peakRate = withData.reduce(
    (best, r) => (!best || r.prevalence > best.prevalence ? r : best),
    null
  );
  const peakCount = withData.reduce(
    (best, r) => (!best || r.value > best.value ? r : best),
    null
  );
  const sumWith = withData.reduce((s, r) => s + (Number(r.value) || 0), 0);
  const sumTotal = withData.reduce((s, r) => s + (Number(r.total) || 0), 0);

  if (!rows.length) {
    return <p className="text-sm text-slate-500">No data available.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Key facts */}
      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 px-4 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Highest rate
          </dt>
          <dd className="mt-1 text-lg font-semibold text-slate-900">
            {peakRate ? `${peakRate.prevalence.toFixed(1)}%` : "–"}
            <span className="ml-1.5 text-xs font-normal text-slate-500">
              {peakRate ? `aged ${peakRate.age}` : ""}
            </span>
          </dd>
        </div>
        <div className="rounded-xl border border-slate-200 px-4 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Largest number
          </dt>
          <dd className="mt-1 text-lg font-semibold text-slate-900">
            {peakCount ? fmtInt(peakCount.value) : "–"}
            <span className="ml-1.5 text-xs font-normal text-slate-500">
              {peakCount ? `aged ${peakCount.age}` : ""}
            </span>
          </dd>
        </div>
        <div className="rounded-xl border border-slate-200 px-4 py-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            All age groups
          </dt>
          <dd className="mt-1 text-lg font-semibold text-slate-900">
            {sumTotal ? `${((sumWith / sumTotal) * 100).toFixed(1)}%` : "–"}
            <span className="ml-1.5 text-xs font-normal text-slate-500">
              {fmtInt(sumWith)} persons
            </span>
          </dd>
        </div>
      </dl>

      {/* Chart */}
      <figure>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full min-w-[640px]"
            role="img"
            aria-label={`Bar chart of ${
              isRate ? "disability rate" : "number of persons with difficulty"
            } by age group. Full values are listed in the table below.`}
          >
            {/* Y gridlines + tick labels */}
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={M.left}
                  x2={W - M.right}
                  y1={y(t)}
                  y2={y(t)}
                  stroke={t === 0 ? "#94a3b8" : "#e2e8f0"}
                  strokeWidth="1"
                />
                <text
                  x={M.left - 8}
                  y={y(t)}
                  dy="0.35em"
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                >
                  {fmtAxis(t)}
                </text>
              </g>
            ))}

            {/* Y axis title */}
            <text
              transform={`translate(14 ${M.top + INNER_H / 2}) rotate(-90)`}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#475569"
            >
              {isRate ? "Rate (% of age group)" : "Persons with difficulty"}
            </text>

            {/* Bars */}
            {rows.map((d, i) => {
              const v = metric(d);
              const cx = M.left + band * i + band / 2;
              const barTop = y(v);
              return (
                <g key={d.age} className="group">
                  <rect
                    x={cx - barW / 2}
                    y={barTop}
                    width={barW}
                    height={Math.max(M.top + INNER_H - barTop, 0)}
                    rx="2"
                    className="fill-[#4c3acb] transition-colors group-hover:fill-[#241a57]"
                  >
                    <title>{`Age ${d.age}: ${Number(d.prevalence ?? 0).toFixed(
                      1
                    )}% · ${fmtInt(d.value)} of ${fmtInt(d.total)} persons`}</title>
                  </rect>
                  <text
                    x={cx}
                    y={barTop - 6}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="600"
                    fill="#334155"
                  >
                    {fmtBar(v)}
                  </text>
                  <text
                    x={cx}
                    y={M.top + INNER_H + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#475569"
                  >
                    {d.age}
                  </text>
                </g>
              );
            })}

            <text
              x={M.left + INNER_W / 2}
              y={H - 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#475569"
            >
              Age group (years)
            </text>
          </svg>
        </div>
        <figcaption className="mt-2 text-xs text-slate-500">
          {isRate
            ? "Percentage of persons in each age group with difficulty."
            : "Number of persons with difficulty in each age group."}{" "}
          Hover over a bar for its full figures.
        </figcaption>
      </figure>

      {/* Data table */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Data table
        </h3>
        <div className="mt-2 max-h-72 overflow-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-2 font-semibold">
                  Age group
                </th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">
                  Persons with difficulty
                </th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">
                  Population
                </th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {withData.map((d) => (
                <tr key={d.age} className="hover:bg-slate-50">
                  <th scope="row" className="px-4 py-1.5 font-medium text-slate-800">
                    {d.age}
                  </th>
                  <td className="px-4 py-1.5 text-right">{fmtInt(d.value)}</td>
                  <td className="px-4 py-1.5 text-right text-slate-500">
                    {fmtInt(d.total)}
                  </td>
                  <td className="px-4 py-1.5 text-right font-semibold text-slate-900">
                    {Number(d.prevalence ?? 0).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
              <tr>
                <th scope="row" className="px-4 py-2">
                  Total
                </th>
                <td className="px-4 py-2 text-right">{fmtInt(sumWith)}</td>
                <td className="px-4 py-2 text-right">{fmtInt(sumTotal)}</td>
                <td className="px-4 py-2 text-right">
                  {sumTotal ? `${((sumWith / sumTotal) * 100).toFixed(1)}%` : "–"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

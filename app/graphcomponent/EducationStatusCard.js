// app/components/graphcomponent/EducationStatusCard.js
"use client";

import { useAreaSelection } from "../lib/useAreaSelection";
import { useStatsbankData } from "../lib/useStatsbankData";
import { DATA_SOURCE } from "../lib/indicators";

const FALLBACK_LEVELS = [
  { label: "No Education", percent: 0 },
  { label: "Primary", percent: 0 },
  { label: "JHS", percent: 0 },
  { label: "SHS / Secondary", percent: 0 },
  { label: "Tertiary", percent: 0 },
  { label: "Other", percent: 0 },
];

// Expect rows: [{label, value, percent?}, ...] -> [{label, percent}, ...]
function toPercentLevels(rows) {
  const cleaned = (Array.isArray(rows) ? rows : []).filter(
    (r) =>
      typeof r.label === "string" &&
      typeof r.value === "number" &&
      !Number.isNaN(r.value)
  );
  if (!cleaned.length) return FALLBACK_LEVELS;

  const total = cleaned.reduce((sum, r) => sum + r.value, 0) || 1;
  return cleaned.map((r) => {
    const percent =
      typeof r.percent === "number" ? r.percent : (r.value / total) * 100;
    return { label: r.label, percent: Number.isFinite(percent) ? percent : 0 };
  });
}

export default function EducationStatusCard({ filters }) {
  const indicator = filters?.indicator || "disability";
  const sex = filters?.sex || "all";
  const ageGroupFilter = filters?.ageGroup || "all";

  const {
    regionOptions,
    districtOptions,
    selectedRegion,
    selectedDistrict,
    area,
    selectRegion,
    selectDistrict,
  } = useAreaSelection(filters?.geographicLevel || "national");

  const { data, loading, error } = useStatsbankData(
    "/api/statsbank/disability/education",
    { area, indicator, sex, ageGroup: ageGroupFilter }
  );
  const levels = toPercentLevels(data);

  // Used to scale bar widths but keep some minimum visual width
  const maxPercent =
    levels.length > 0 ? Math.max(...levels.map((l) => l.percent ?? l.value)) : 1;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold text-slate-900">
        Education Status (5+ years) of Persons with Disability
      </h3>
    </div>

    <div className="mb-3 flex flex-wrap gap-3 text-xs">
      <label className="flex items-center gap-2">
        <span className="text-slate-600">Region</span>
          <select
            value={selectedRegion}
            onChange={(e) => selectRegion(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
          >
            {regionOptions.map((r) => (
              <option key={r} value={r}>
                {r === "Ghana" ? "Ghana (National)" : r}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-slate-600">District</span>
          <select
            value={selectedDistrict}
            onChange={(e) => selectDistrict(e.target.value)}
            disabled={selectedRegion === "Ghana"}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">All (region total)</option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && (
        <p className="text-xs text-slate-500" role="status">Loading…</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      <div className="space-y-3 text-xs">
        {levels.map((item) => {
          const pct = item.percent ?? item.value; // fallback for dummy
          // Keep bars within the card, but never totally tiny
          const widthPct =
            maxPercent > 0 ? Math.max((pct / maxPercent) * 90, 8) : 8;

          return (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-[11px] text-slate-600">
                <span className="truncate pr-2">{item.label}</span>
                <span className="font-medium text-slate-900">
                  {Number(pct ?? 0).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#4c3acb]"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-slate-400">
        Education level of persons with disability aged 5+. Source:{" "}
        {DATA_SOURCE}.
      </p>
    </div>
  );
}

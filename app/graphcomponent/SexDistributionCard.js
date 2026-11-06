// app/components/graphcomponent/SexDistributionCard.js
"use client";

import { useAreaSelection } from "../lib/useAreaSelection";
import { useStatsbankData } from "../lib/useStatsbankData";
import { DATA_SOURCE } from "../lib/indicators";

export default function SexDistributionCard({ filters }) {
  const indicator = filters?.indicator || "disability";
  const sexFilter = filters?.sex || "all";
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
    "/api/statsbank/disability/sex",
    { area, indicator, sex: sexFilter, ageGroup: ageGroupFilter }
  );

  // Expecting counts like: { male: 12345, female: 15000, malePrevalence, ... }
  const male = Number(data?.male);
  const female = Number(data?.female);
  const totalCount =
    Number.isFinite(male) && Number.isFinite(female) && male + female > 0
      ? male + female
      : null;
  const malePercent = totalCount ? (male / totalCount) * 100 : null;
  const femalePercent = totalCount ? 100 - malePercent : null;
  const maleRate = data?.malePrevalence ?? null;
  const femaleRate = data?.femalePrevalence ?? null;

  // Use male share for the conic gradient
  const maleDeg = ((malePercent ?? 0) / 100) * 360;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">
        Sex Distribution
      </h3>
      <div className="flex flex-wrap gap-3 text-xs">
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

      {/* Donut chart */}
      <div className="flex justify-center">
        <div
          className="relative h-32 w-32 rounded-full"
          style={{
            background:
              malePercent == null
                ? "#e2e8f0"
                : `conic-gradient(#352676 0deg ${maleDeg}deg, #2a9d8f ${maleDeg}deg 360deg)`,
          }}
          role="img"
          aria-label={
            malePercent == null
              ? "Sex distribution loading"
              : `Male ${malePercent.toFixed(1)}%, female ${femalePercent.toFixed(1)}%`
          }
        >
          {/* inner white circle to create donut effect */}
          <div className="absolute inset-[18px] rounded-full bg-white" />

          {/* center label – total share */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-semibold text-slate-900">
              {totalCount != null
                ? totalCount.toLocaleString("en-US")
                : "–"}
            </span>
            <span className="text-[10px] leading-tight text-slate-500">
              persons with
              <br />
              disability
            </span>
          </div>
        </div>
      </div>

      {/* Legend / summary cards */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        {/* Male */}
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 p-3">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm bg-[#352676]" />
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Male
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {malePercent == null ? "–" : `${malePercent.toFixed(1)}%`}
            </p>
            <p className="text-[11px] text-slate-500">
              Rate:{" "}
              <span className="font-semibold text-slate-700">
                {Number.isFinite(maleRate) ? `${maleRate.toFixed(1)}%` : "–"}
              </span>{" "}
              of males
            </p>
          </div>
        </div>

        {/* Female */}
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 p-3">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm bg-[#2a9d8f]" />
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Female
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {femalePercent == null ? "–" : `${femalePercent.toFixed(1)}%`}
            </p>
            <p className="text-[11px] text-slate-500">
              Rate:{" "}
              <span className="font-semibold text-slate-700">
                {Number.isFinite(femaleRate)
                  ? `${femaleRate.toFixed(1)}%`
                  : "–"}
              </span>{" "}
              of females
            </p>
          </div>
        </div>
      </div>
      <p className="mt-auto pt-2 text-[11px] text-slate-400">
        Large figures: share of all persons with difficulty. Rate: % of
        each sex with difficulty. Source: {DATA_SOURCE}.
      </p>
    </div>
  );
}

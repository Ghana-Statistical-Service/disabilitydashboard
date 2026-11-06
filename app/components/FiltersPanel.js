// app/components/FiltersPanel.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { AGE_BANDS_FOR_CARD } from "../lib/statsbank";
import { INDICATOR_OPTIONS } from "../lib/indicators";
import IndicatorExplainer from "./IndicatorExplainer";

const segmentBase =
  "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition";

const selectClass =
  "w-full rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/15 transition hover:bg-white/15 focus:ring-2 focus:ring-white";

const labelClass =
  "text-[11px] font-semibold uppercase tracking-wide text-violet-200";

const geoOptions = [
  { value: "national", label: "National" },
  { value: "region", label: "Region" },
  { value: "district", label: "District" },
];

const sexOptions = [
  { value: "all", label: "Both" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

function Segmented({ label, options, value, onChange }) {
  return (
    <fieldset className="space-y-1.5">
      <legend className={labelClass}>{label}</legend>
      <div className="mt-1.5 flex gap-1 rounded-lg bg-white/10 p-1 ring-1 ring-white/10">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={`${segmentBase} ${
                active
                  ? "bg-white text-[#352676] shadow-sm"
                  : "text-violet-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function FiltersPanel({ filters, onApply }) {
  const [form, setForm] = useState(filters);

  useEffect(() => {
    setForm(filters);
  }, [filters]);

  const ageOptions = useMemo(
    () => [
      { value: "all", label: "All ages (5+)" },
      ...AGE_BANDS_FOR_CARD.map((band) => ({ value: band, label: band })),
    ],
    []
  );

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const dirty = JSON.stringify(form) !== JSON.stringify(filters);

  return (
    <aside
      aria-label="Filters"
      className="rounded-2xl bg-[#352676] px-5 py-5 text-white shadow-sm"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filters</h2>
        <span className="text-[11px] text-violet-200">2021 PHC</span>
      </div>

      <div className="space-y-5">
        {/* Indicator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="filter-indicator" className={labelClass}>
              Indicator
            </label>
            <IndicatorExplainer variant="icon" label="Explain indicators" />
          </div>
          <select
            id="filter-indicator"
            value={form.indicator}
            onChange={(e) => update("indicator", e.target.value)}
            className={selectClass}
          >
            {INDICATOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-slate-900">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <Segmented
          label="Geographic level"
          options={geoOptions}
          value={form.geographicLevel}
          onChange={(v) => update("geographicLevel", v)}
        />

        {/* Year (static) */}
        <div className="space-y-1.5">
          <label htmlFor="filter-year" className={labelClass}>
            Census year
          </label>
          <select id="filter-year" className={selectClass}>
            <option className="text-slate-900">2021</option>
            <option className="text-slate-900">2010</option>
          </select>
        </div>

        <Segmented
          label="Sex"
          options={sexOptions}
          value={form.sex}
          onChange={(v) => update("sex", v)}
        />

        {/* Age group */}
        <div className="space-y-1.5">
          <label htmlFor="filter-age" className={labelClass}>
            Age group
          </label>
          <select
            id="filter-age"
            value={form.ageGroup}
            onChange={(e) => update("ageGroup", e.target.value)}
            className={selectClass}
          >
            {ageOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-slate-900">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onApply?.(form)}
        disabled={!dirty}
        className="mt-6 w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-[#352676] shadow-sm transition hover:bg-violet-50 disabled:cursor-default disabled:opacity-60 disabled:hover:bg-white"
      >
        {dirty ? "Apply filters" : "Filters applied"}
      </button>
    </aside>
  );
}

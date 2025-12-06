// app/components/FiltersPanel.js
"use client";

import { useEffect, useMemo, useState } from "react";
import { AGE_BANDS_FOR_CARD } from "../lib/statsbank";

const buttonBase =
  "rounded-full px-4 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-white/60";

const indicatorOptions = [
  { value: "disability", label: "Disability Status" },
  { value: "seeing", label: "Seeing Disability" },
  { value: "hearing", label: "Hearing Disability" },
  { value: "intellectual", label: "Intellectual Disability" },
  { value: "physical", label: "Physical Disability" },
  { value: "selfcare", label: "Self-care Disability" },
  { value: "severe", label: "Severe Disability" },
  { value: "speech", label: "Speech Disability" },
];

const geoOptions = [
  { value: "national", label: "National" },
  { value: "region", label: "Region" },
  { value: "district", label: "District" },
];

const sexOptions = [
  { value: "all", label: "All" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export default function FiltersPanel({ filters, onApply }) {
  const [form, setForm] = useState(filters);

  useEffect(() => {
    setForm(filters);
  }, [filters]);

  const ageOptions = useMemo(
    () => [
      { value: "all", label: "All ages" },
      ...AGE_BANDS_FOR_CARD.map((band) => ({ value: band, label: band })),
    ],
    []
  );

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleApply = () => {
    onApply?.(form);
  };

  return (
    <aside className="rounded-3xl bg-[#392675] px-4 py-5 text-white shadow-lg sm:px-5 lg:px-6">
      <h2 className="mb-4 text-base font-semibold">Filters</h2>

      {/* Indicator */}
      <div className="mb-4 space-y-1 text-xs">
        <label className="font-medium text-violet-100">Indicator</label>
        <select
          value={form.indicator}
          onChange={(e) => update("indicator", e.target.value)}
          className="w-full rounded-xl border-0 bg-white/10 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white"
        >
          {indicatorOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Geography level */}
      <div className="mb-4 space-y-1 text-xs">
        <label className="font-medium text-violet-100">Geographic level</label>
        <div className="flex gap-2">
          {geoOptions.map((opt) => {
            const active = form.geographicLevel === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("geographicLevel", opt.value)}
                className={`${buttonBase} ${
                  active ? "bg-white text-[#392675]" : "bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Year (static) */}
      <div className="mb-4 space-y-1 text-xs">
        <label className="font-medium text-violet-100">Year</label>
        <select className="w-full rounded-xl border-0 bg-white/10 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white">
          <option className="text-slate-900">2021</option>
          <option className="text-slate-900">2010</option>
        </select>
      </div>

      {/* Sex */}
      <div className="mb-4 space-y-1 text-xs">
        <label className="font-medium text-violet-100">Sex</label>
        <div className="flex gap-2">
          {sexOptions.map((opt) => {
            const active = form.sex === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("sex", opt.value)}
                className={`${buttonBase} ${
                  active ? "bg-white text-[#392675]" : "bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Age group */}
      <div className="mb-6 space-y-1 text-xs">
        <label className="font-medium text-violet-100">Age Group</label>
        <select
          value={form.ageGroup}
          onChange={(e) => update("ageGroup", e.target.value)}
          className="w-full rounded-xl border-0 bg-white/10 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white"
        >
          {ageOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleApply}
        className="mt-1 w-full rounded-2xl bg-white py-3 text-sm font-semibold text-[#392675] shadow-md transition hover:bg-violet-50"
      >
        Apply
      </button>
    </aside>
  );
}

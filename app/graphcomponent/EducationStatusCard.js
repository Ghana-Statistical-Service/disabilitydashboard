// app/components/graphcomponent/EducationStatusCard.js
"use client";

import { useEffect, useState } from "react";

const FALLBACK_LEVELS = [
  { label: "No schooling", value: 0 },
  { label: "Primary", value: 0 },
  { label: "JHS", value: 0 },
  { label: "SHS+", value: 0 },
];

export default function EducationStatusCard() {
  const [view, setView] = useState("all"); // "all" | "sex" | "region"
  const [levels, setLevels] = useState(FALLBACK_LEVELS);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/statsbank/disability/education?group=${view}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch education status");
        return res.json();
      })
      .then((json) => {
        const rows = Array.isArray(json?.data) ? json.data : [];
        if (!rows.length) return;

        // Expect rows: [{label, value}, ...] where value is a count
        const cleaned = rows.filter(
          (r) =>
            typeof r.label === "string" &&
            typeof r.value === "number" &&
            !Number.isNaN(r.value)
        );

        const total =
          cleaned.length > 0
            ? cleaned.reduce((sum, r) => sum + r.value, 0)
            : 1;

        // Convert to percentages for display & width scaling
        const percentLevels = cleaned.map((r) => ({
          label: r.label,
          percent: (r.value / total) * 100,
        }));

        setLevels(percentLevels);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Education status fetch error:", err);
        // keep fallback data
      });

    return () => controller.abort();
  }, [view]);

  // Used to scale bar widths but keep some minimum visual width
  const maxPercent =
    levels.length > 0 ? Math.max(...levels.map((l) => l.percent ?? l.value)) : 1;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">
          Education Status (5+ years) of Persons with Disability
        </h3>

        {/* Toggle: All / Sex / Region */}
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setView("all")}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
              view === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setView("sex")}
            className={`rounded-full px-3 py-1 text-[11px] ${
              view === "sex" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Sex
          </button>
          <button
            type="button"
            onClick={() => setView("region")}
            className={`rounded-full px-3 py-1 text-[11px] ${
              view === "region"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            Region
          </button>
        </div>
      </div>

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
                <span>{pct.toFixed(0)}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6b4bff] to-[#c9b5ff]"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Higher education levels can inform inclusive schooling policies and
        investments.
      </p>
    </div>
  );
}

// app/components/graphcomponent/EmploymentStatusCard.js
"use client";

import { useEffect, useState } from "react";
import SampleBadge from "./SampleBadge";

const FALLBACK_DATA = [
  { label: "Employed", value: 54, highlight: true },
  { label: "Unemployed", value: 46 },
];

export default function EmploymentStatusCard() {
  const [employmentData, setEmploymentData] = useState(FALLBACK_DATA);
  const [isSample, setIsSample] = useState(true);

  useEffect(() => {
    fetch("/api/statsbank/disability/employment")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch employment status");
        return res.json();
      })
      .then((json) => {
        // Expect: { data: [{label, value}, ...] }
        const rows = Array.isArray(json?.data) ? json.data : [];
        if (rows.length) {
          setIsSample(false);
          setEmploymentData(
            rows
              .filter(
                (r) =>
                  typeof r.label === "string" &&
                  typeof r.value === "number" &&
                  !Number.isNaN(r.value)
              )
              .map((r, idx) => ({
                ...r,
                // keep "Employed" highlighted by default
                highlight: r.label === "Employed" || idx === 0,
              }))
          );
        }
      })
      .catch((err) => {
        console.error("Employment status fetch error:", err);
        // fall back to default dummy data
      });
  }, []);

  const MAX_BAR_HEIGHT = 120; // px
  const maxValue =
    employmentData.length > 0
      ? Math.max(...employmentData.map((d) => d.value))
      : 1;

  const totalValue =
    employmentData.length > 0
      ? employmentData.reduce((sum, d) => sum + d.value, 0)
      : 1;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">
          Employment Status (15+ years)
        </h3>
        {isSample && <SampleBadge />}
      </div>

      {/* Inner chart card */}
      <div className="mt-4 rounded-xl bg-slate-50 px-6 pb-5 pt-6">
        <div className="relative h-44 w-full">
          {/* horizontal reference lines */}
          <div className="pointer-events-none absolute inset-x-2 top-10 h-px bg-slate-200/60" />
          <div className="pointer-events-none absolute inset-x-2 top-24 h-px bg-slate-200/30" />

          {/* bars with shared baseline */}
          <div className="absolute inset-x-4 bottom-0 flex items-end justify-between gap-6">
            {employmentData.map((item) => {
              const height =
                (item.value / maxValue) * MAX_BAR_HEIGHT || 0;
              const percent =
                totalValue > 0 ? (item.value / totalValue) * 100 : 0;

              return (
                <div
                  key={item.label}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  {/* percentage above bar */}
                  <span className="text-xs font-semibold text-slate-900">
                    {Number(percent).toFixed(1)}%
                  </span>

                  <div
                    className={`w-8 rounded-t-md ${
                      item.highlight ? "bg-[#4c3acb]" : "bg-[#b9a6ff]"
                    }`}
                    style={{ height: `${height}px` }}
                  />

                  <span className="mt-1 text-[11px] text-center text-slate-600">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-auto pt-4 text-[11px] text-slate-400">
        Economic activity status of persons with disability aged 15 and
        older.
      </p>
    </div>
  );
}

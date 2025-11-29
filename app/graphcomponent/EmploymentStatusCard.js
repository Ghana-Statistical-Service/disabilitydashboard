// app/components/graphcomponent/EmploymentStatusCard.js
"use client";

import { useEffect, useState } from "react";

const FALLBACK_DATA = [
  { label: "Employed", value: 54 },
  { label: "Unemployed", value: 46 },
];

export default function EmploymentStatusCard() {
  const [employmentData, setEmploymentData] = useState(FALLBACK_DATA);

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
    <div className="rounded-3xl bg-white p-5 shadow-md">
      <h3 className="text-base font-semibold text-slate-900">
        Employment Status (15+ years)
      </h3>

      {/* Inner chart card */}
      <div className="mt-4 rounded-3xl bg-[#f8f6ff] px-6 pt-6 pb-5">
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
                  <span className="text-[11px] font-medium text-slate-500">
                    {percent.toFixed(0)}%
                  </span>

                  <div
                    className={`w-4 sm:w-5 md:w-6 bg-gradient-to-t from-[#b8a4ff] to-[#4c3acb] rounded-t-2xl rounded-b-none ${
                      item.highlight ? "shadow-md" : ""
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

      <p className="mt-4 text-xs text-slate-500">
        Employment among persons with disability remains below the general
        population.
      </p>

      {/* Employed caption in green */}
      <p className="mt-1 text-xs font-semibold text-emerald-700">Employed</p>
    </div>
  );
}

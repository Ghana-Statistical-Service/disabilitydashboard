// app/components/graphcomponent/SexDistributionCard.js
"use client";

import { useEffect, useState } from "react";

export default function SexDistributionCard() {
  const [malePercent, setMalePercent] = useState(53);
  const [femalePercent, setFemalePercent] = useState(47);

  useEffect(() => {
    fetch("/api/statsbank/disability/sex")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sex distribution");
        return res.json();
      })
      .then((json) => {
        // Expecting counts like: { data: { male: 12345, female: 15000 } }
        const male = json?.data?.male;
        const female = json?.data?.female;

        if (typeof male === "number" && typeof female === "number") {
          const total = male + female;
          if (total > 0) {
            const malePct = (male / total) * 100;
            setMalePercent(malePct);
            setFemalePercent(100 - malePct);
          }
        }
      })
      .catch((err) => {
        console.error("Sex distribution fetch error:", err);
        // Keep the default 53 / 47 on error
      });
  }, []);

  // Use male share for the conic gradient
  const maleDeg = (malePercent / 100) * 360;

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-md">
      <h3 className="text-base font-semibold text-slate-900">
        Sex Distribution
      </h3>

      {/* Donut chart */}
      <div className="flex justify-center">
        <div
          className="relative h-32 w-32 rounded-full"
          style={{
            background: `conic-gradient(#4f46e5 0deg ${maleDeg}deg, #f973a5 ${maleDeg}deg 360deg)`,
          }}
        >
          {/* inner white circle to create donut effect */}
          <div className="absolute inset-4 rounded-full bg-white" />

          {/* center label – total share */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-xs font-semibold text-slate-900">
            <span>{Math.round(malePercent + femalePercent)}%</span>
            <span className="text-[10px] text-slate-500">of population</span>
          </div>
        </div>
      </div>

      {/* Legend / summary cards */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        {/* Male */}
        <div className="flex items-center gap-2 rounded-2xl bg-indigo-50 p-3">
          <span className="h-3 w-3 rounded-full bg-[#4f46e5]" />
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Male
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {malePercent.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Female */}
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3">
          <span className="h-3 w-3 rounded-full bg-[#f973a5]" />
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Female
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {femalePercent.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Sex distribution of Persons with Disability.
      </p>
    </div>
  );
}

// app/components/graphcomponent/SexDistributionCard.js
"use client";

import { useEffect, useMemo, useState } from "react";
import regionsGeo from "../../data/Regions.gh.json";
import districtsGeo from "../../data/District.gh.json";

export default function SexDistributionCard({ filters }) {
  const [malePercent, setMalePercent] = useState(53);
  const [femalePercent, setFemalePercent] = useState(47);
  const [selectedRegion, setSelectedRegion] = useState("Ghana");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const indicator = filters?.indicator || "disability";
  const sexFilter = filters?.sex || "all";
  const ageGroupFilter = filters?.ageGroup || "all";
  const geographicLevel = filters?.geographicLevel || "national";

  const regionOptions = useMemo(
    () =>
      ["Ghana", ...new Set(regionsGeo.features.map((f) => f.properties.region))],
    []
  );

  const districtOptions = useMemo(() => {
    if (selectedRegion === "Ghana") return [];
    return districtsGeo.features
      .filter(
        (f) =>
          f.properties.region === selectedRegion ||
          f.properties.Region === selectedRegion
      )
      .map((f) => f.properties.district || f.properties.label || f.properties.name);
  }, [selectedRegion]);

  useEffect(() => {
    if (geographicLevel === "national") {
      setSelectedRegion("Ghana");
      setSelectedDistrict("");
    } else if (geographicLevel === "region") {
      const firstRegion = regionOptions.find((r) => r !== "Ghana") || "Ghana";
      setSelectedRegion(firstRegion);
      setSelectedDistrict("");
    } else if (geographicLevel === "district") {
      const firstDistrict = districtsGeo.features[0];
      const regionName =
        firstDistrict?.properties?.region ||
        firstDistrict?.properties?.Region ||
        "Ghana";
      const districtName =
        firstDistrict?.properties?.district ||
        firstDistrict?.properties?.label ||
        "";
      setSelectedRegion(regionName);
      setSelectedDistrict(districtName);
    }
  }, [geographicLevel, regionOptions]);

  useEffect(() => {
    const area = selectedDistrict || selectedRegion || "Ghana";
    setLoading(true);
    setError(null);

    const url = new URL(
      `/api/statsbank/disability/sex?area=${encodeURIComponent(area)}`,
      window.location.origin
    );
    url.searchParams.set("indicator", indicator);
    url.searchParams.set("sex", sexFilter);
    url.searchParams.set("ageGroup", ageGroupFilter);

    fetch(url.toString())
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
        setLoading(false);
      })
      .catch((err) => {
        console.error("Sex distribution fetch error:", err);
        setError("Unable to load data");
        setLoading(false);
        // Keep the default 53 / 47 on error
      });
  }, [selectedRegion, selectedDistrict, indicator, sexFilter, ageGroupFilter]);

  // Use male share for the conic gradient
  const maleDeg = (malePercent / 100) * 360;

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-md">
      <h3 className="text-base font-semibold text-slate-900">
        Sex Distribution
      </h3>
      <div className="flex flex-wrap gap-3 text-xs">
        <label className="flex items-center gap-2">
          <span className="text-slate-600">Region</span>
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedDistrict("");
            }}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-800"
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
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={selectedRegion === "Ghana"}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100"
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
        <p className="text-xs text-slate-500">Loading…</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

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

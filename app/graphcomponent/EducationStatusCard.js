// app/components/graphcomponent/EducationStatusCard.js
"use client";

import { useEffect, useMemo, useState } from "react";
import regionsGeo from "../../data/Regions.gh.json";
import districtsGeo from "../../data/District.gh.json";

const FALLBACK_LEVELS = [
  { label: "No Education", percent: 0 },
  { label: "Primary", percent: 0 },
  { label: "JHS", percent: 0 },
  { label: "SHS / Secondary", percent: 0 },
  { label: "Tertiary", percent: 0 },
  { label: "Other", percent: 0 },
];

export default function EducationStatusCard({ filters }) {
  const [levels, setLevels] = useState(FALLBACK_LEVELS);
  const [selectedRegion, setSelectedRegion] = useState("Ghana");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const indicator = filters?.indicator || "disability";
  const sex = filters?.sex || "all";
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
    const controller = new AbortController();
    const area = selectedDistrict || selectedRegion || "Ghana";

    setLoading(true);
    setError(null);

    const url = new URL(
      `/api/statsbank/disability/education?area=${encodeURIComponent(area)}`,
      window.location.origin
    );
    url.searchParams.set("indicator", indicator);
    url.searchParams.set("sex", sex);
    url.searchParams.set("ageGroup", ageGroupFilter);

    fetch(url.toString(), {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch education status");
        return res.json();
      })
      .then((json) => {
        const rows = Array.isArray(json?.data) ? json.data : [];
        if (!rows.length) return;

        // Expect rows: [{label, value, percent?}, ...]
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

        const percentLevels = cleaned.map((r) => {
          const percent =
            typeof r.percent === "number"
              ? r.percent
              : (r.value / total) * 100;

          return {
            label: r.label,
            percent: Number.isFinite(percent) ? percent : 0,
          };
        });

        setLevels(percentLevels);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Education status fetch error:", err);
        setError("Unable to load data");
        setLoading(false);
      });

    return () => controller.abort();
  }, [selectedRegion, selectedDistrict, indicator, sex, ageGroupFilter]);

  // Used to scale bar widths but keep some minimum visual width
  const maxPercent =
    levels.length > 0 ? Math.max(...levels.map((l) => l.percent ?? l.value)) : 1;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-base font-semibold text-slate-900">
        Education Status (5+ years) of Persons with Disability
      </h3>
    </div>

    <div className="mb-3 flex flex-wrap gap-3 text-xs">
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
                <span>{Number(pct ?? 0).toFixed(1)}%</span>
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

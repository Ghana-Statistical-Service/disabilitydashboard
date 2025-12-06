// app/components/graphcomponent/AgeDistributionCard.js
"use client";

import { useEffect, useMemo, useState } from "react";
import regionsGeo from "../../data/Regions.gh.json";
import districtsGeo from "../../data/District.gh.json";

export default function AgeDistributionCard({ filters }) {
  const [ageData, setAgeData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("Ghana");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const indicator = filters?.indicator || "disability";
  const sex = filters?.sex || "all";
  const ageGroupFilter = filters?.ageGroup || "all";

  const regionOptions = useMemo(
    () =>
      ["Ghana", ...regionsGeo.features.map((f) => f.properties.region)],
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
      .map((f) => f.properties.district || f.properties.label);
  }, [selectedRegion]);

  useEffect(() => {
    if (filters?.geographicLevel === "national") {
      setSelectedRegion("Ghana");
      setSelectedDistrict("");
    } else if (filters?.geographicLevel === "region") {
      const firstRegion = regionOptions.find((r) => r !== "Ghana") || "Ghana";
      setSelectedRegion(firstRegion);
      setSelectedDistrict("");
    } else if (filters?.geographicLevel === "district") {
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
  }, [filters?.geographicLevel, regionOptions]);

  useEffect(() => {
    const area =
      selectedDistrict || selectedRegion || "Ghana";

    setLoading(true);
    setError(null);

    const url = new URL(
      `/api/statsbank/disability/age?area=${encodeURIComponent(area)}`,
      window.location.origin
    );
    url.searchParams.set("indicator", indicator);
    url.searchParams.set("sex", sex);
    url.searchParams.set("ageGroup", ageGroupFilter);

    fetch(url.toString())
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch age distribution");
        return res.json();
      })
      .then((json) => {
        setAgeData(json.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Age distribution fetch error:", err);
        setError("Unable to load data");
        setLoading(false);
      });
  }, [selectedRegion, selectedDistrict, indicator, sex, ageGroupFilter]);

  const maxValue =
    ageData.length > 0
      ? Math.max(...ageData.map((d) => d.value), 1)
      : 1;

  // --- SVG layout (responsive) ---
  const chartWidth = 100;
  const chartHeight = 60;
  const topPadding = 8;
  const bottomPadding = 14; // space above baseline
  const usableHeight = chartHeight - topPadding - bottomPadding;

  const count = Math.max(ageData.length, 1);
  const gap = 1.5;
  const totalGap = gap * (count + 1);
  const barWidth = Math.max(1.8, (chartWidth - totalGap) / count);

  // helper to keep value labels short
  const formatValue = (v) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${Math.round(v / 1_000)}k`;
    return String(v);
  };

  // for many age groups, show every 2nd label to avoid crowding
  const labelStep = ageData.length > 12 ? 2 : 1;

  return (
    <div className="rounded-3xl bg-white p-5 shadow-md">
      <h3 className="text-base font-semibold text-slate-900">
        Age Distribution of Persons with Disability
      </h3>
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
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

      <div className="mt-4">
        {loading && (
          <p className="text-xs text-slate-500">Loading…</p>
        )}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        {/* Chart */}
        <div className="relative h-52 w-full">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            {/* subtle horizontal reference lines */}
            {[0.25, 0.5, 0.75].map((p) => {
              const y = topPadding + usableHeight * (1 - p);
              return (
                <line
                  key={p}
                  x1="0"
                  x2={chartWidth}
                  y1={y}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="0.3"
                />
              );
            })}

            {/* bars + value labels */}
            {ageData.map((d, i) => {
              const barHeight = (d.value / maxValue) * usableHeight;
              const x = gap + i * (barWidth + gap);
              const y = topPadding + (usableHeight - barHeight);
              const cx = x + barWidth / 2;

              return (
                <g key={d.age}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={barWidth / 2}
                    ry={barWidth / 2}
                    fill="url(#ageGradient)"
                  />
                  {/* numeric value above bar */}
                  <text
                    x={cx}
                    y={Math.max(y - 1.5, 4)} // keep inside chart
                    textAnchor="middle"
                    fontSize="3"
                    fill="#6B7280"
                  >
                    {formatValue(d.value)}
                  </text>
                </g>
              );
            })}

            <defs>
              <linearGradient id="ageGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#6E4FFF" />
                <stop offset="100%" stopColor="#C9B5FF" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* X-axis labels: real age ranges, kept in one row */}
        <div className="mt-2 flex gap-1">
          {ageData.map((d, i) => (
            <span
              key={d.age}
              className="flex-1 text-center text-[10px] leading-tight text-slate-600"
            >
              {i % labelStep === 0 ? d.age : "\u00A0"}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Population with Disability by Age Group.
      </p>
    </div>
  );
}

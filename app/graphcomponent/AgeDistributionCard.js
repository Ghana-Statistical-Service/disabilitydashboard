// app/components/graphcomponent/AgeDistributionCard.js
"use client";

import { useState } from "react";
import { useAreaSelection } from "../lib/useAreaSelection";
import { useStatsbankData } from "../lib/useStatsbankData";
import { DATA_SOURCE, indicatorLabel } from "../lib/indicators";
import Modal from "../components/Modal";
import AgeChartDetail from "./AgeChartDetail";

const MODES = [
  { value: "rate", label: "Rate" },
  { value: "number", label: "Number" },
];

function ModeToggle({ mode, onChange, size = "sm" }) {
  return (
    <div
      role="group"
      aria-label="Show values as"
      className={`flex shrink-0 rounded-md border border-slate-300 p-0.5 font-medium ${
        size === "lg" ? "text-xs" : "text-[11px]"
      }`}
    >
      {MODES.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={mode === opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded transition ${
            size === "lg" ? "px-3 py-1" : "px-2 py-0.5"
          } ${
            mode === opt.value
              ? "bg-[#352676] text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function AgeDistributionCard({ filters }) {
  // "rate" = % of persons in each age group; "number" = count of persons
  const [mode, setMode] = useState("rate");
  const [expanded, setExpanded] = useState(false);
  const metric = (d) =>
    mode === "rate" ? Number(d.prevalence) || 0 : Number(d.value) || 0;
  const indicator = filters?.indicator || "disability";
  const sex = filters?.sex || "all";
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
    "/api/statsbank/disability/age",
    { area, indicator, sex, ageGroup: ageGroupFilter }
  );
  const ageData = Array.isArray(data) ? data : [];

  const maxValue =
    ageData.length > 0
      ? Math.max(...ageData.map(metric), mode === "rate" ? 0.1 : 1)
      : 1;

  // --- SVG layout (responsive) ---
  const chartWidth = 100;
  const chartHeight = 60;
  const topPadding = 8;
  const bottomPadding = 2; // space above baseline
  const usableHeight = chartHeight - topPadding - bottomPadding;

  const count = Math.max(ageData.length, 1);
  const gap = 1.5;
  const totalGap = gap * (count + 1);
  const barWidth = Math.max(1.8, (chartWidth - totalGap) / count);

  // helper to keep value labels short
  const formatValue = (v) => {
    if (mode === "rate") return `${Math.round(v)}%`;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${Math.round(v / 1_000)}k`;
    return String(v);
  };

  // with many age groups, label every 3rd bar to avoid crowding
  const labelStep = ageData.length > 12 ? 3 : 1;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">
          Disability by Age Group
        </h3>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
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

      <div className="mt-4">
        {loading && (
          <p className="text-xs text-slate-500" role="status">Loading…</p>
        )}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        {/* Chart — click to open the full-size view */}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          disabled={!ageData.length}
          aria-haspopup="dialog"
          aria-label="Open a larger view of the age chart with a data table"
          className="group block w-full cursor-zoom-in rounded-lg text-left transition hover:bg-slate-50 disabled:cursor-default disabled:hover:bg-transparent"
        >
        <span className="relative block h-52 w-full">
          <span className="pointer-events-none absolute left-1 top-1 z-10 inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 shadow-sm transition group-hover:border-[#352676] group-hover:text-[#352676] group-focus-visible:border-[#352676] group-focus-visible:text-[#352676]">
            <svg
              viewBox="0 0 16 16"
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5L9 7M2.5 13.5L7 9" />
            </svg>
            Expand
          </span>
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
              const barHeight = (metric(d) / maxValue) * usableHeight;
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
                    rx={0.6}
                    ry={0.6}
                    fill="#4c3acb"
                  >
                    <title>{`${d.age}: ${Number(d.prevalence ?? 0).toFixed(
                      1
                    )}% (${Number(d.value).toLocaleString(
                      "en-US"
                    )} persons)`}</title>
                  </rect>
                  {/* numeric value above bar */}
                  <text
                    x={cx}
                    y={Math.max(y - 1.5, 4)} // keep inside chart
                    textAnchor="middle"
                    fontSize="3"
                    fill="#6B7280"
                  >
                    {i % labelStep === 0 ? formatValue(metric(d)) : ""}
                  </text>
                </g>
              );
            })}

          </svg>
        </span>

        {/* X-axis labels: real age ranges, kept in one row */}
        <span className="mt-1 flex gap-1" aria-hidden="true">
          {ageData.map((d, i) => (
            <span
              key={d.age}
              className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-center text-[10px] leading-tight text-slate-600"
            >
              {i % labelStep === 0 ? d.age : "\u00A0"}
            </span>
          ))}
        </span>
        </button>
      </div>

      <p className="mt-4 text-[11px] text-slate-400">
        {mode === "rate"
          ? "Percentage of persons in each age group with difficulty."
          : "Number of persons with difficulty in each age group."}{" "}
        Click the chart to enlarge. Source: {DATA_SOURCE}.
      </p>

      <Modal
        open={expanded}
        onClose={() => setExpanded(false)}
        eyebrow="Disability by Age Group"
        title={`${
          selectedDistrict ||
          (selectedRegion === "Ghana" ? "Ghana (National)" : `${selectedRegion} Region`)
        } · ${indicatorLabel(indicator)}`}
        widthClass="w-[min(64rem,calc(100vw-2rem))]"
        footer={
          <p>
            {sex === "male" ? "Males" : sex === "female" ? "Females" : "Both sexes"}
            {" · "}Source: {DATA_SOURCE}.
          </p>
        }
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Show values as</p>
          <ModeToggle mode={mode} onChange={setMode} size="lg" />
        </div>
        <AgeChartDetail data={ageData} mode={mode} />
      </Modal>
    </div>
  );
}

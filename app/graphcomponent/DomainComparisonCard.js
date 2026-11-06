// app/graphcomponent/DomainComparisonCard.js
"use client";

import { useEffect, useMemo, useState } from "react";
import regionsGeo from "../../data/Regions.gh.json";
import { DATA_SOURCE } from "../lib/indicators";

const SEGMENTS = [
  { key: "cannotPct", label: "Cannot do at all", color: "#241a57" },
  { key: "aLotPct", label: "A lot of difficulty", color: "#5b47b8" },
  { key: "somePct", label: "Some difficulty", color: "#c9bff0" },
];

const fmt = (v) => (Number.isFinite(v) ? `${v.toFixed(2)}%` : "–");

export default function DomainComparisonCard({ filters }) {
  const sex = filters?.sex || "all";
  const ageGroup = filters?.ageGroup || "all";

  const [area, setArea] = useState("Ghana");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const regionOptions = useMemo(
    () => [
      "Ghana",
      ...new Set(regionsGeo.features.map((f) => f.properties.region)),
    ],
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    const url = new URL(
      "/api/statsbank/disability/domains",
      window.location.origin
    );
    url.searchParams.set("area", area);
    url.searchParams.set("sex", sex);
    url.searchParams.set("ageGroup", ageGroup);

    fetch(url.toString(), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch domain comparison");
        return res.json();
      })
      .then((json) => {
        const data = Array.isArray(json?.data) ? json.data : [];
        setRows(
          [...data].sort((a, b) => b.anyDifficultyPct - a.anyDifficultyPct)
        );
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Domain comparison fetch error:", err);
        setError("Unable to load data");
        setLoading(false);
      });

    return () => controller.abort();
  }, [area, sex, ageGroup]);

  const maxAny = Math.max(...rows.map((r) => r.anyDifficultyPct), 0.0001);
  const top = rows[0];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Difficulty by Functional Domain
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Share of persons aged 5+ reporting difficulty in each of the six
            Washington Group domains, by level of difficulty.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs">
          <span className="text-slate-600">Area</span>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
          >
            {regionOptions.map((r) => (
              <option key={r} value={r}>
                {r === "Ghana" ? "Ghana (National)" : r}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Legend */}
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-600">
        {SEGMENTS.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: s.color }}
              aria-hidden="true"
            />
            {s.label}
          </li>
        ))}
      </ul>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      {/* Column headers */}
      <div className="mt-4 hidden grid-cols-[11rem_1fr_6rem_6rem] gap-4 border-b border-slate-200 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:grid">
        <span>Domain</span>
        <span />
        <span className="text-right">Any difficulty</span>
        <span className="text-right">A lot / cannot</span>
      </div>

      <ul
        className={`divide-y divide-slate-100 ${
          loading && !rows.length ? "animate-pulse" : ""
        }`}
      >
        {(rows.length ? rows : Array.from({ length: 6 }, (_, i) => ({ key: i })))
          .map((r) => (
            <li
              key={r.key}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 py-2.5 sm:grid-cols-[11rem_1fr_6rem_6rem]"
              aria-label={
                r.domain
                  ? `${r.domain}: any difficulty ${fmt(
                      r.anyDifficultyPct
                    )}, a lot of difficulty or cannot do at all ${fmt(
                      r.disabilityPct
                    )}`
                  : undefined
              }
            >
              <span className="text-xs font-medium text-slate-800">
                {r.domain || " "}
              </span>

              {/* Stacked bar (scaled to the largest domain) */}
              <div className="order-last col-span-2 flex h-3 overflow-hidden rounded-sm bg-slate-100 sm:order-none sm:col-span-1">
                {r.domain &&
                  SEGMENTS.map((s) => (
                    <div
                      key={s.key}
                      style={{
                        width: `${(r[s.key] / maxAny) * 100}%`,
                        background: s.color,
                      }}
                      title={`${s.label}: ${fmt(r[s.key])}`}
                    />
                  ))}
              </div>

              <span className="text-right text-xs font-semibold text-slate-900">
                {r.domain ? fmt(r.anyDifficultyPct) : ""}
                <span className="ml-1 font-normal text-slate-400 sm:hidden">
                  any
                </span>
              </span>
              <span className="hidden text-right text-xs font-semibold text-[#352676] sm:block">
                {r.domain ? fmt(r.disabilityPct) : ""}
              </span>
            </li>
          ))}
      </ul>

      <p className="mt-4 text-[11px] text-slate-500">
        {top
          ? `${top.domain} is the most commonly reported difficulty. `
          : ""}
        &ldquo;A lot / cannot&rdquo; is the Washington Group disability
        cut-off. A person can report difficulty in more than one domain, so
        domains do not add up to the overall prevalence.
      </p>
      <p className="mt-1 text-[11px] text-slate-400">Source: {DATA_SOURCE}.</p>
    </section>
  );
}

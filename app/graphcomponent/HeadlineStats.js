// app/graphcomponent/HeadlineStats.js
"use client";

import { useEffect, useState } from "react";
import { indicatorLabel } from "../lib/indicators";

const fmtPct = (v) => (Number.isFinite(v) ? `${v.toFixed(1)}%` : "–");
const fmtNum = (v) =>
  Number.isFinite(v) ? Math.round(v).toLocaleString("en-US") : "–";

function Tile({ label, children, note, loading }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className={`mt-2 ${loading ? "animate-pulse opacity-40" : ""}`}>
        {children}
      </div>
      {note && (
        <p className="mt-auto pt-2 text-[11px] leading-snug text-slate-500">
          {note}
        </p>
      )}
    </div>
  );
}

function Pair({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.label}>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: it.color }}
              aria-hidden="true"
            />
            {it.label}
          </p>
          <p className="text-xl font-semibold tracking-tight text-slate-900">
            {fmtPct(it.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

function gapNote(aLabel, a, bLabel, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const diff = Math.abs(a - b);
  if (diff < 0.05) return `${aLabel} and ${bLabel.toLowerCase()} rates are similar.`;
  const [hi, lo] = a > b ? [aLabel, bLabel] : [bLabel, aLabel];
  return `${hi} rate is ${diff.toFixed(1)} points higher than ${lo.toLowerCase()}.`;
}

export default function HeadlineStats({ filters }) {
  const indicator = filters?.indicator || "disability";
  const sex = filters?.sex || "all";
  const ageGroup = filters?.ageGroup || "all";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const url = new URL(
      "/api/statsbank/disability/headline",
      window.location.origin
    );
    url.searchParams.set("indicator", indicator);
    url.searchParams.set("sex", sex);
    url.searchParams.set("ageGroup", ageGroup);

    fetch(url.toString(), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch headline figures");
        return res.json();
      })
      .then((json) => {
        setData(json?.data ?? null);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Headline figures fetch error:", err);
        setError("Headline figures are unavailable right now.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [indicator, sex, ageGroup]);

  const scope = [
    "Ghana",
    sex === "male" ? "males" : sex === "female" ? "females" : null,
    ageGroup === "all" ? "aged 5+" : `aged ${ageGroup}`,
  ]
    .filter(Boolean)
    .join(", ");

  const overall = data?.overall;
  const isLoading = loading && !data;

  return (
    <section aria-label="Headline figures">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          label="Prevalence"
          loading={isLoading}
          note={`${indicatorLabel(indicator)} · ${scope}`}
        >
          <p className="text-3xl font-semibold tracking-tight text-[#352676]">
            {fmtPct(overall?.prevalence)}
          </p>
        </Tile>

        <Tile
          label="Persons with difficulty"
          loading={isLoading}
          note={
            overall
              ? `Out of ${fmtNum(overall.total)} persons (${scope}).`
              : null
          }
        >
          <p className="text-3xl font-semibold tracking-tight text-slate-900">
            {fmtNum(overall?.withDifficulty)}
          </p>
        </Tile>

        <Tile
          label="Rate by sex"
          loading={isLoading}
          note={gapNote(
            "Female",
            data?.female?.prevalence,
            "Male",
            data?.male?.prevalence
          )}
        >
          <Pair
            items={[
              {
                label: "Female",
                value: data?.female?.prevalence,
                color: "#2a9d8f",
              },
              { label: "Male", value: data?.male?.prevalence, color: "#352676" },
            ]}
          />
        </Tile>

        <Tile
          label="Rate by locality"
          loading={isLoading}
          note={gapNote(
            "Rural",
            data?.rural?.prevalence,
            "Urban",
            data?.urban?.prevalence
          )}
        >
          <Pair
            items={[
              {
                label: "Rural",
                value: data?.rural?.prevalence,
                color: "#b7791f",
              },
              {
                label: "Urban",
                value: data?.urban?.prevalence,
                color: "#64748b",
              },
            ]}
          />
        </Tile>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

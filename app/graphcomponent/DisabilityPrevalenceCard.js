// app/components/graphcomponent/DisabilityPrevalenceCard.js
"use client";

import { useEffect, useRef, useState } from "react";
import regionsGeo from "../../data/Regions.gh.json";

const HIGHEST_FALLBACK = [" "];
const DEFAULT_REGION = "Greater Accra";

export default function DisabilityPrevalenceCard() {
  // region under mouse on the map
  const [tooltipRegion, setTooltipRegion] = useState(null);

  // stats from backend: { [regionName]: { region, total, withDifficulty, withoutDifficulty, prevalence } }
  const [regionStats, setRegionStats] = useState(null);
  const [highestRegions, setHighestRegions] = useState(HIGHEST_FALLBACK);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const geoLayerRef = useRef(null);

  /**
   * 1. Fetch region-level disability stats from our API
   *    /api/disability/regions  ->  { data: [{ region, total, withDifficulty, withoutDifficulty, prevalence }, ...] }
   */
  useEffect(() => {
    fetch("/api/statsbank/disability/region")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch disability regions");
        return res.json();
      })
      .then((json) => {
        const rows = Array.isArray(json?.data) ? json.data : [];

        const statsMap = {};
        rows.forEach((r) => {
          const total = Number(r.total) || 0;
          const withDifficulty = Number(r.withDifficulty) || 0;
          const withoutDifficulty =
            r.withoutDifficulty != null
              ? Number(r.withoutDifficulty)
              : Math.max(total - withDifficulty, 0);

          // use API prevalence if present, else compute it
          const prevalence =
            typeof r.prevalence === "number"
              ? r.prevalence
              : total > 0
              ? (withDifficulty / total) * 100
              : 0;

          statsMap[r.region] = {
            region: r.region,
            total,
            withDifficulty,
            withoutDifficulty,
            prevalence,
          };
        });

        // figure out the highest-prevalence regions (top 4)
        const ordered = Object.values(statsMap)
          .filter((r) => !Number.isNaN(r.prevalence))
          .sort((a, b) => b.prevalence - a.prevalence)
          .slice(0, 4)
          .map((r) => r.region);

        if (ordered.length) setHighestRegions(ordered);
        setRegionStats(statsMap);
      })
      .catch((err) => {
        console.error("Error fetching disability regions:", err);
      });
  }, []);

  /**
   * 2. Initialise Leaflet map (once)
   */
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (!mapContainerRef.current || !isMounted) return;
      if (mapRef.current) return; // already initialised

      const map = L.map(mapContainerRef.current, {
        center: [7.9, -1.2],
        zoom: 6.5,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: false,
      });

      mapRef.current = map;

      const geoLayer = L.geoJSON(regionsGeo, {
        style: () => ({
          color: "#f4f3fb",
          weight: 1,
          fillColor: "#b9a6ff",
          fillOpacity: 1,
        }),
        onEachFeature: (feature, layer) => {
          const name =
            feature.properties.region ||
            feature.properties.Region ||
            feature.properties.name;

          layer.on({
            mouseover() {
              layer.setStyle({ fillColor: "#6c4eff" });
              setTooltipRegion(name);
            },
            mouseout() {
              const base = layer.options._baseFillColor || "#b9a6ff";
              layer.setStyle({ fillColor: base });
              setTooltipRegion(null);
            },
          });
        },
      }).addTo(map);

      geoLayerRef.current = geoLayer;
      map.fitBounds(geoLayer.getBounds(), { padding: [10, 10] });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  /**
   * 3. Once we have stats, colour the map by prevalence (low→light, high→dark)
   */
  useEffect(() => {
    if (!regionStats || !geoLayerRef.current) return;

    const values = Object.values(regionStats)
      .map((r) => r.prevalence)
      .filter((v) => typeof v === "number" && !Number.isNaN(v));

    if (!values.length) return;

    const min = Math.min(...values);
    const max = Math.max(...values);

    const start = { r: 185, g: 166, b: 255 }; // #b9a6ff
    const end = { r: 108, g: 78, b: 255 }; // #6c4eff

    const getColor = (p) => {
      if (Number.isNaN(p) || max <= min) return "#b9a6ff";
      const t = (p - min) / (max - min); // 0..1
      const r = Math.round(start.r + t * (end.r - start.r));
      const g = Math.round(start.g + t * (end.g - start.g));
      const b = Math.round(start.b + t * (end.b - start.b));
      return `rgb(${r}, ${g}, ${b})`;
    };

    const geoLayer = geoLayerRef.current;
    geoLayer.eachLayer((layer) => {
      const feature = layer.feature;
      const name =
        feature.properties.region ||
        feature.properties.Region ||
        feature.properties.name;

      const stat = regionStats[name];
      const color = getColor(stat?.prevalence ?? NaN);

      // remember base colour so mouseout can restore it
      layer.options._baseFillColor = color;
      layer.setStyle({ fillColor: color });
    });
  }, [regionStats]);

  // Which region’s stats should we show on the right?
  const regionForStats = tooltipRegion || DEFAULT_REGION;
  const currentStats =
    (regionStats && regionStats[regionForStats]) || null;

  // prevalence (2 d.p.)
  const prevalenceText = currentStats
    ? `${currentStats.prevalence.toFixed(2)}%`
    : "–";

  // with / without difficulty percentages
  let withPctText = "–";
  let withoutPctText = "–";

  if (currentStats && currentStats.total > 0) {
    const withPct =
      (currentStats.withDifficulty / currentStats.total) * 100;
    const withoutPct = 100 - withPct;
    withPctText = `${withPct.toFixed(1)}%`;
    withoutPctText = `${withoutPct.toFixed(1)}%`;
  }

  const withCount = currentStats
    ? currentStats.withDifficulty.toLocaleString("en-US")
    : "–";

  const highestList =
    highestRegions && highestRegions.length
      ? highestRegions
      : HIGHEST_FALLBACK;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-md">
      {/* Title + toggle */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Disability Prevalence by Region
        </h2>
        <div className="inline-flex items-center rounded-full bg-slate-100 p-1 text-xs">
          <button className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm">
            Map
          </button>
          <button className="px-3 py-1 text-[11px] text-slate-500">
            Tab
          </button>
        </div>
      </div>

      {/* Map + details grid */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* LEFT: Map (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="relative flex flex-1 items-center justify-center rounded-2xl bg-[#efeaff] p-4">
            {/* Leaflet map container */}
            <div
              ref={mapContainerRef}
              className="h-84 w-full max-w-xs overflow-hidden rounded-[2.2rem]"
            />
          </div>

          {/* Low–High legend bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span>Low</span>
            <div className="mx-3 h-2 flex-1 max-w-xs rounded-full bg-gradient-to-r from-[#daccff] to-[#6c4eff]" />
            <span>High</span>
          </div>
        </div>

        {/* RIGHT: dynamic details (1/3) */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="rounded-2xl bg-[#f8f6ff] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              {regionForStats}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {prevalenceText}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Prevalence of disability
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Approx.{" "}
              <span className="font-semibold">{withCount}</span>{" "}
              people with at least one difficulty.
            </p>
          </div>

          {/* With / Without difficulty cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                With difficulty
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {withPctText}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Without difficulty
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {withoutPctText}
              </p>
            </div>
          </div>

          {/* Highest prevalence list */}
          <div className="rounded-2xl bg-white p-3 text-xs shadow-sm">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Highest
            </p>
            <div className="flex flex-col gap-1">
              {highestList.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

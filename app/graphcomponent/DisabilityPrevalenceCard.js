// app/components/graphcomponent/DisabilityPrevalenceCard.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import regionsGeo from "../../data/Regions.gh.json";
import districtsGeo from "../../data/District.gh.json";

const HIGHEST_FALLBACK = ["No data"];
const MAP_LEVELS = {
  region: {
    key: "region",
    label: "Region",
    defaultName: "Greater Accra",
    api: "/api/statsbank/disability/region",
    geo: regionsGeo,
    getName: (feature) =>
      feature.properties.region ||
      feature.properties.Region ||
      feature.properties.name,
  },
  district: {
    key: "district",
    label: "District",
    defaultName: "Accra Metropolitan",
    api: "/api/statsbank/disability/district",
    geo: districtsGeo,
    getName: (feature) =>
      feature.properties.district ||
      feature.properties.District ||
      feature.properties.label ||
      feature.properties.name,
  },
};

export default function DisabilityPrevalenceCard({ filters }) {
  // region/district under mouse on the map
  const [hoveredArea, setHoveredArea] = useState(null);

  // stats from backend: { [areaName]: { total, withDifficulty, withoutDifficulty, prevalence } }
  const [areaStats, setAreaStats] = useState(null);
  const [highestAreas, setHighestAreas] = useState(HIGHEST_FALLBACK);
  const [mapLevel, setMapLevel] = useState("region");
  const [defaultArea, setDefaultArea] = useState(
    MAP_LEVELS.region.defaultName
  );
  const [mapReady, setMapReady] = useState(false);
  const indicator = filters?.indicator || "disability";
  const sex = filters?.sex || "all";
  const ageGroup = filters?.ageGroup || "all";
  const geographicLevel = filters?.geographicLevel || "national";

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const geoLayerRef = useRef(null);
  const leafletRef = useRef(null);

  const levelConfig = useMemo(() => MAP_LEVELS[mapLevel], [mapLevel]);

  useEffect(() => {
    setHoveredArea(null);
    setAreaStats(null);
    setHighestAreas(HIGHEST_FALLBACK);
    setDefaultArea(levelConfig.defaultName);
  }, [levelConfig]);

  useEffect(() => {
    setMapLevel(geographicLevel === "district" ? "district" : "region");
  }, [geographicLevel]);

  /**
   * 1. Fetch disability stats for the current map level
   *    /api/statsbank/disability/{region|district} -> { data: [...] }
   */
  useEffect(() => {
    let cancelled = false;

    const url = new URL(levelConfig.api, window.location.origin);
    url.searchParams.set("indicator", indicator);
    url.searchParams.set("sex", sex);
    url.searchParams.set("ageGroup", ageGroup);

    fetch(url.toString())
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch disability stats");
        }
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const rows = Array.isArray(json?.data) ? json.data : [];

        const statsMap = {};
        rows.forEach((r) => {
          const total = Number(r.total) || 0;
          const withDifficulty = Number(r.withDifficulty) || 0;
          const withoutDifficulty =
            r.withoutDifficulty != null
              ? Number(r.withoutDifficulty)
              : Math.max(total - withDifficulty, 0);

          const prevalence =
            typeof r.prevalence === "number"
              ? r.prevalence
              : total > 0
              ? (withDifficulty / total) * 100
              : 0;

          const name = r[levelConfig.key];
          if (!name) return;
          statsMap[name] = {
            ...r,
            total,
            withDifficulty,
            withoutDifficulty,
            prevalence,
          };
        });

        const ordered = Object.values(statsMap)
          .filter((r) => !Number.isNaN(r.prevalence))
          .sort((a, b) => b.prevalence - a.prevalence)
          .slice(0, 4)
          .map((r) => r[levelConfig.key]);

        if (ordered.length) {
          setHighestAreas(ordered);
          setDefaultArea(ordered[0]);
        } else {
          setHighestAreas(HIGHEST_FALLBACK);
          setDefaultArea(levelConfig.defaultName);
        }
        setAreaStats(statsMap);
      })
      .catch((err) => {
        console.error("Error fetching disability stats:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [levelConfig, indicator, sex, ageGroup]);

  /**
   * 2. Initialise Leaflet map (once)
   */
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;
      leafletRef.current = L;

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
      setMapReady(true);
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
   * 2b. Add/replace GeoJSON layer when map level changes
   */
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !mapReady) return;

    if (geoLayerRef.current) {
      geoLayerRef.current.remove();
      geoLayerRef.current = null;
    }

    const baseColor = "#b9a6ff";

    const geoLayer = L.geoJSON(levelConfig.geo, {
      style: () => ({
        color: "#f4f3fb",
        weight: 1,
        fillColor: baseColor,
        fillOpacity: 1,
      }),
      onEachFeature: (feature, layer) => {
        const name = levelConfig.getName(feature);
        if (!name) return;

        layer.on({
          mouseover() {
            layer.setStyle({ fillColor: "#6c4eff" });
            setHoveredArea(name);
          },
          mouseout() {
            const base = layer.options._baseFillColor || baseColor;
            layer.setStyle({ fillColor: base });
            setHoveredArea(null);
          },
        });
      },
    }).addTo(map);

    geoLayerRef.current = geoLayer;

    if (geoLayer.getLayers().length) {
      map.fitBounds(geoLayer.getBounds(), { padding: [10, 10] });
    }
  }, [levelConfig, mapReady]);

  /**
   * 3. Once we have stats, colour the map by prevalence (low→light, high→dark)
   */
  useEffect(() => {
    if (!areaStats || !geoLayerRef.current) return;

    const values = Object.values(areaStats)
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
      const name = levelConfig.getName(feature);

      const stat = areaStats[name];
      const color = getColor(stat?.prevalence ?? NaN);

      // remember base colour so mouseout can restore it
      layer.options._baseFillColor = color;
      layer.setStyle({ fillColor: color });
    });
  }, [areaStats, levelConfig]);

  // Which area’s stats should we show on the right?
  const areaForStats =
    hoveredArea || defaultArea || highestAreas?.[0] || HIGHEST_FALLBACK[0];
  const currentStats = (areaStats && areaStats[areaForStats]) || null;

  // prevalence (2 d.p.)
  const prevalenceText = currentStats
    ? `${Number(currentStats.prevalence ?? 0).toFixed(1)}%`
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
    highestAreas && highestAreas.length ? highestAreas : HIGHEST_FALLBACK;
  const highestItems = highestList.map((name, idx) => ({
    name,
    prevalence: areaStats?.[name]?.prevalence,
    key: `${name}-${idx}`,
  }));

  return (
    <section className="rounded-3xl bg-white p-5 shadow-md">
      {/* Title + toggle */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Disability Prevalence Map
        </h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-lg border border-slate-200 px-3 py-1 text-slate-700 bg-white">
            Indicator: {indicator}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
            {mapLevel === "district" ? "Districts" : "Regions"}
          </span>
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
              className="h-80 w-full max-w-xs overflow-hidden rounded-[2.2rem]"
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
              {areaForStats}
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
            <div className="flex flex-col gap-2">
              {highestItems.map(({ key, name, prevalence }) => (
                <div key={key} className="flex items-center justify-between">
                  <span>{name}</span>
                  <span className="text-slate-500">
                    {Number.isFinite(prevalence)
                      ? `${prevalence.toFixed(1)}%`
                      : "–"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

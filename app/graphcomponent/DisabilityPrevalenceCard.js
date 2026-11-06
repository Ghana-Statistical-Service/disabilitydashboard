// app/components/graphcomponent/DisabilityPrevalenceCard.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import regionsGeo from "../../data/Regions.gh.json";
import districtsGeo from "../../data/District.gh.json";
import { indicatorLabel, DATA_SOURCE } from "../lib/indicators";

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
  // national (Ghana) figure, returned by the region endpoint
  const [nationalStats, setNationalStats] = useState(null);
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
        setNationalStats(json?.national ?? null);
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
        color: "#ffffff",
        weight: 1,
        fillColor: baseColor,
        fillOpacity: 1,
      }),
      onEachFeature: (feature, layer) => {
        const name = levelConfig.getName(feature);
        if (!name) return;

        layer.on({
          mouseover() {
            layer.setStyle({ weight: 2.5, color: "#0f172a" });
            layer.bringToFront();
            setHoveredArea(name);
          },
          mouseout() {
            layer.setStyle({ weight: 1, color: "#ffffff" });
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
    const end = { r: 59, g: 42, b: 143 }; // #3b2a8f

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
  // On the National view, default to the Ghana figure; hovering a region
  // still shows that region's figure.
  const showNational =
    !hoveredArea && geographicLevel === "national" && Boolean(nationalStats);
  const areaForStats = showNational
    ? "Ghana (National)"
    : hoveredArea || defaultArea || highestAreas?.[0] || HIGHEST_FALLBACK[0];
  const currentStats = showNational
    ? nationalStats
    : areaStats?.[areaForStats] || null;

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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Title + context */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Disability Prevalence by{" "}
            {mapLevel === "district" ? "District" : "Region"}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Share of persons aged 5+ with the selected difficulty. Hover over
            an area to see its figures.
          </p>
        </div>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
          {indicatorLabel(indicator)}
        </span>
      </div>

      {/* Map + details grid */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* LEFT: Map (2/3) */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="relative flex flex-1 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-4">
            {/* Leaflet map container */}
            <div
              ref={mapContainerRef}
              role="img"
              aria-label={`Choropleth map of ${indicatorLabel(
                indicator
              ).toLowerCase()} prevalence by ${
                mapLevel === "district" ? "district" : "region"
              }`}
              className="h-80 w-full max-w-xs overflow-hidden bg-transparent"
              style={{ background: "transparent" }}
            />
          </div>

          {/* Low–High legend bar */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="font-medium text-slate-600">Prevalence</span>
            <span>Lower</span>
            <div className="h-2 max-w-xs flex-1 rounded-sm bg-gradient-to-r from-[#b9a6ff] to-[#3b2a8f]" />
            <span>Higher</span>
          </div>
        </div>

        {/* RIGHT: dynamic details (1/3) */}
        <div className="flex flex-col gap-3 lg:col-span-1">
          <div className="rounded-xl border-l-4 border-[#352676] bg-[#f5f3fc] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5b47b8]">
              {areaForStats}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              {prevalenceText}
            </p>
            <p className="mt-0.5 text-xs text-slate-600">
              Prevalence ({indicatorLabel(indicator).toLowerCase()})
            </p>
            <p className="mt-3 border-t border-[#e2ddf5] pt-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">{withCount}</span>{" "}
              persons with difficulty
            </p>
          </div>

          {/* With / Without difficulty cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                With difficulty
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {withPctText}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Without difficulty
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {withoutPctText}
              </p>
            </div>
          </div>

          {/* Highest prevalence list */}
          <div className="rounded-xl border border-slate-200 p-3 text-xs">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Highest prevalence
            </p>
            <ol className="flex flex-col divide-y divide-slate-100">
              {highestItems.map(({ key, name, prevalence }, idx) => (
                <li
                  key={key}
                  className="flex items-center justify-between gap-2 py-1.5"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="w-3 text-slate-400">{idx + 1}</span>
                    {name}
                  </span>
                  <span className="font-medium text-slate-900">
                    {Number.isFinite(prevalence)
                      ? `${prevalence.toFixed(1)}%`
                      : "–"}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-slate-400">
        Source: {DATA_SOURCE}.
      </p>
    </section>
  );
}

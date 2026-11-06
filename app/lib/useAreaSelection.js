// app/lib/useAreaSelection.js
// Region / district picker state shared by the chart cards.
"use client";

import { useMemo, useState } from "react";
import regionsGeo from "../../data/Regions.gh.json";
import districtsGeo from "../../data/District.gh.json";

export const REGION_OPTIONS = [
  "Ghana",
  ...new Set(regionsGeo.features.map((f) => f.properties.region)),
];

const districtName = (f) =>
  f?.properties?.district || f?.properties?.label || f?.properties?.name || "";
const districtRegion = (f) =>
  f?.properties?.region || f?.properties?.Region || "";

/** Default area shown for each dashboard geographic level. */
function defaultsFor(level) {
  if (level === "region") {
    return { region: REGION_OPTIONS[1] || "Ghana", district: "" };
  }
  if (level === "district") {
    const first = districtsGeo.features[0];
    return {
      region: districtRegion(first) || "Ghana",
      district: districtName(first),
    };
  }
  return { region: "Ghana", district: "" };
}

export function useAreaSelection(geographicLevel = "national") {
  const [level, setLevel] = useState(geographicLevel);
  const [selection, setSelection] = useState(() =>
    defaultsFor(geographicLevel)
  );

  // When the dashboard's geographic level changes, reset to that level's
  // default area. Adjusting state during render (rather than in an effect)
  // avoids an extra render pass with the stale area.
  if (level !== geographicLevel) {
    setLevel(geographicLevel);
    setSelection(defaultsFor(geographicLevel));
  }

  const districtOptions = useMemo(() => {
    if (selection.region === "Ghana") return [];
    return districtsGeo.features
      .filter((f) => districtRegion(f) === selection.region)
      .map(districtName)
      .filter(Boolean);
  }, [selection.region]);

  return {
    regionOptions: REGION_OPTIONS,
    districtOptions,
    selectedRegion: selection.region,
    selectedDistrict: selection.district,
    area: selection.district || selection.region || "Ghana",
    selectRegion: (region) => setSelection({ region, district: "" }),
    selectDistrict: (district) =>
      setSelection((prev) => ({ ...prev, district })),
  };
}

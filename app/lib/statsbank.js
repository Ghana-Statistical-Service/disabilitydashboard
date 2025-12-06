// app/lib/statsbank.js

import districtGeo from "../../data/District.gh.json";

const STATS_BASE =
  "https://statsbank.statsghana.gov.gh/api/v1/en/PHC%202021%20StatsBank/Difficulties%20in%20Performing%20Activities/";

const INDICATOR_ENDPOINTS = {
  disability: "disability_table.px",
  seeing: "forms_seeing_disability_table.px",
  hearing: "hearing_disability_table.px",
  intellectual: "intellectual_disability_table.px",
  physical: "physical_disability_table.px",
  selfcare: "selfcare_disability_table.px",
  severe: "severe_disability_table.px",
  speech: "speech_disability_table.px",
};

const INDICATOR_META = {
  disability: {
    dimCode: "Disability",
    totalValue: "Total",
    withDifficultyValues: ["With Difficulty"],
    withoutDifficultyValues: ["Without Difficulty"],
  },

  seeing: {
    dimCode: "Seeing",
    totalValue: "Total",
    withDifficultyValues: [
      "Yes, some difficulty",
      "Yes, a lot of difficulty",
      "Cannot see at all",
    ],
    withoutDifficultyValues: ["No difficulty"],
  },

  hearing: {
    dimCode: "Hearing",
    totalValue: "Total",
    withDifficultyValues: [
      "Yes, some difficulty",
      "Yes, a lot of difficulty",
      "Cannot hear at all",
    ],
    withoutDifficultyValues: ["No difficulty"],
  },

  intellectual: {
    dimCode: "Intellectual",
    totalValue: "Total",
    withDifficultyValues: [
      "Yes, some difficulty",
      "Yes, a lot of difficulty",
      "Cannot remember or concentrate at all",
    ],
    withoutDifficultyValues: ["No difficulty"],
  },

  physical: {
    dimCode: "Physical",
    totalValue: "Total",
    withDifficultyValues: [
      "Yes, some difficulty",
      "Yes, a lot of difficulty",
      "Cannot do at all",
    ],
    withoutDifficultyValues: ["No difficulty"],
  },

  selfcare: {
    dimCode: "Selfcare",
    totalValue: "Total",
    withDifficultyValues: [
      "Yes, some difficulty",
      "Yes, a lot of difficulty",
      "Cannot do at all",
    ],
    withoutDifficultyValues: ["No difficulty"],
  },

  severe: {
    dimCode: "Severity",
    totalValue: "Total",
    withDifficultyValues: [
      "Cannot do at all in at least one domain",
      "Some difficulty in at least one domain",
      "A lot of difficulty in at least one domain",
    ],
    withoutDifficultyValues: ["No difficulty"],
  },

  speech: {
    dimCode: "Speech",
    totalValue: "Total",
    withDifficultyValues: [
      "Yes, some difficulty",
      "Yes, a lot of difficulty",
      "Cannot communicate at all",
    ],
    withoutDifficultyValues: ["No difficulty"],
  },
};

function indicatorMeta(indicator = "disability") {
  const key =
    typeof indicator === "string" ? indicator.trim().toLowerCase() : "disability";
  return INDICATOR_META[key] || INDICATOR_META.disability;
}

function endpointForIndicator(indicator = "disability") {
  const key =
    typeof indicator === "string" ? indicator.trim().toLowerCase() : "disability";
  const file = INDICATOR_ENDPOINTS[key] || INDICATOR_ENDPOINTS.disability;
  // STATS_BASE already includes encoded spaces; avoid double-encoding
  return `${STATS_BASE}${file}`;
}

function sexSelection(sex = "all") {
  if (sex === "male") return ["Male"];
  if (sex === "female") return ["Female"];
  return ["Both sexes"];
}

function ageSelection(ageGroup = "all") {
  if (ageGroup && ageGroup !== "all") return [ageGroup];
  return ["All ages"];
}

async function fetchWithIndicator(indicator, body) {
  try {
    return await queryPxWeb(endpointForIndicator(indicator), body);
  } catch (err) {
    if (indicator !== "disability") {
      console.warn(
        `Indicator ${indicator} failed, falling back to disability:`,
        err?.message || err
      );
      return queryPxWeb(endpointForIndicator("disability"), body);
    }
    throw err;
  }
}

// Region-level values exactly as they appear in the metadata
export const REGION_VALUES = [
  "Western",
  "Central",
  "Greater Accra",
  "Volta",
  "Eastern",
  "Ashanti",
  "Western North",
  "Ahafo",
  "Bono",
  "Bono East",
  "Oti",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
];

// District values, derived from the GeoJSON properties
export const DISTRICT_VALUES = Array.from(
  new Set(
    (districtGeo?.features || [])
      .map(
        (f) =>
          f?.properties?.district ||
          f?.properties?.District ||
          f?.properties?.label ||
          f?.properties?.name
      )
      .filter(Boolean)
  )
);

export const AGE_BANDS_FOR_CARD = [
  "5-9",
  "10-14",
  "15-17",
  "18-19",
  "20-24",
  "25-29",
  "30-34",
  "35-39",
  "40-44",
  "45-49",
  "50-54",
  "55-59",
  "60-64",
  "65-69",
  "70-74",
  "75-79",
  "80-84",
  "85-89",
  "90-94",
  "95-99",
  "100+",
];

// Allowed geographic areas for filters
const GEO_AREA_VALUES = new Set([
  "Ghana",
  ...REGION_VALUES,
  ...DISTRICT_VALUES,
]);

// Age bands used in the Age Distribution card
// kept for compatibility with existing code paths

// Full list of education values from the metadata (except "Total")
const ALL_EDU_VALUES = [
  "Never attended",
  "Nursery",
  "Kindergarten",
  "Primary",
  "JSS/JHS",
  "Middle",
  "SSS/SHS",
  "Secondary",
  "Voc/technical/commercial",
  "Post middle/secondary Certificate",
  "Post middle/secondary Diploma",
  "Tertiary/HND",
  "Tertiary - Bachelor's Degree",
  "Tertiary - Post graduate Certificate/Diploma",
  "Tertiary - Master's Degree",
  "Tertiary - PhD",
  "Other (specify)",
];

/**
 * Generic PxWeb POST helper
 */
async function queryPxWeb(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `StatsBank request failed (${res.status}): ${text || res.statusText}`
    );
  }
  // console.log("PxWeb URL:", url, "body:", JSON.stringify(body, null, 2));
  return res.json(); // PxWeb "json" format: { columns: [...], data: [...] }
}

/**
 * Helper: find column index safely
 */
function colIndex(json, code) {
  const idx = json.columns.findIndex((c) => c.code === code);
  if (idx === -1) {
    throw new Error(`${code} column not found in response`);
  }
  return idx;
}

/* ------------------------------------------------------------------ */
/* 1. Region summary for the map                                      */
/* ------------------------------------------------------------------ */
/**
 * Get TOTAL and WITH DIFFICULTY by region and compute prevalence %
 * - Age: All ages
 * - Sex: Both sexes
 * - Education: Total
 * - Locality: All Locality Types
 */

/* ------------------------------------------------------------------ */
/* 1. Regional Distribution of Disability                                       */
/* ------------------------------------------------------------------ */

export async function getDisabilityRegionSummary(
  indicator = "disability",
  sex = "all",
  ageGroup = "all"
) {
  const meta = indicatorMeta(indicator);
  const body = {
    query: [
      {
        code: meta.dimCode,
        selection: {
          filter: "item",
          values: [
            meta.totalValue,
            ...meta.withDifficultyValues,
            ...meta.withoutDifficultyValues,
          ],
        },
      },
      {
        code: "Education",
        selection: { filter: "item", values: ["Total"] },
      },
      {
        code: "Locality",
        selection: { filter: "item", values: ["All Locality Types"] },
      },
      {
        code: "Geographic_Area",
        selection: { filter: "item", values: REGION_VALUES },
      },
      {
        code: "Sex",
        selection: { filter: "item", values: sexSelection(sex) },
      },
      {
        code: "Age",
        selection: { filter: "item", values: ageSelection(ageGroup) },
      },
    ],
    response: { format: "json" },
  };

  const json = await fetchWithIndicator(indicator, body);
  const geoIdx = colIndex(json, "Geographic_Area");
  const disIdx = colIndex(json, meta.dimCode);

  // row.key = [Disability, Education, Locality, Geographic_Area, Sex, Age]
  const rows = json.data.map((row) => ({
    disability: row.key[disIdx],
    region: row.key[geoIdx],
    value: Number(row.values[0]),
  }));

  const grouped = new Map();

  for (const r of rows) {
    const current =
      grouped.get(r.region) || {
        region: r.region,
        total: 0,
        withDifficulty: 0,
      };

    if (r.disability === meta.totalValue) current.total = r.value;
    if (meta.withDifficultyValues.includes(r.disability)) {
      current.withDifficulty += r.value;
    }

    grouped.set(r.region, current);
  }

  return REGION_VALUES.map((name) => {
    const g = grouped.get(name) || {
      region: name,
      total: 0,
      withDifficulty: 0,
    };
    const withoutDifficulty = Math.max(g.total - g.withDifficulty, 0);
    const prevalence = g.total ? (g.withDifficulty / g.total) * 100 : 0;
    return {
      region: name,
      total: g.total,
      withDifficulty: g.withDifficulty,
      withoutDifficulty,
      prevalence, // % of population with difficulty
    };
  });
}

/* ------------------------------------------------------------------ */
/* 1b. District distribution of disability                             */
/* ------------------------------------------------------------------ */

export async function getDisabilityDistrictSummary(
  indicator = "disability",
  sex = "all",
  ageGroup = "all"
) {
  const meta = indicatorMeta(indicator);
  const body = {
    query: [
      {
        code: meta.dimCode,
        selection: {
          filter: "item",
          values: [
            meta.totalValue,
            ...meta.withDifficultyValues,
            ...meta.withoutDifficultyValues,
          ],
        },
      },
      {
        code: "Education",
        selection: { filter: "item", values: ["Total"] },
      },
      {
        code: "Locality",
        selection: { filter: "item", values: ["All Locality Types"] },
      },
      {
        code: "Geographic_Area",
        selection: { filter: "item", values: DISTRICT_VALUES },
      },
      {
        code: "Sex",
        selection: { filter: "item", values: sexSelection(sex) },
      },
      {
        code: "Age",
        selection: { filter: "item", values: ageSelection(ageGroup) },
      },
    ],
    response: { format: "json" },
  };

  const json = await fetchWithIndicator(indicator, body);
  const geoIdx = colIndex(json, "Geographic_Area");
  const disIdx = colIndex(json, meta.dimCode);

  // row.key = [Disability, Education, Locality, Geographic_Area, Sex, Age]
  const rows = json.data.map((row) => ({
    disability: row.key[disIdx],
    district: row.key[geoIdx],
    value: Number(row.values[0]),
  }));

  const grouped = new Map();

  for (const r of rows) {
    const current =
      grouped.get(r.district) || {
        district: r.district,
        total: 0,
        withDifficulty: 0,
      };

    if (r.disability === meta.totalValue) current.total = r.value;
    if (meta.withDifficultyValues.includes(r.disability)) {
      current.withDifficulty += r.value;
    }

    grouped.set(r.district, current);
  }

  return DISTRICT_VALUES.map((name) => {
    const g = grouped.get(name) || {
      district: name,
      total: 0,
      withDifficulty: 0,
    };
    const withoutDifficulty = Math.max(g.total - g.withDifficulty, 0);
    const prevalence = g.total ? (g.withDifficulty / g.total) * 100 : 0;
    return {
      district: name,
      total: g.total,
      withDifficulty: g.withDifficulty,
      withoutDifficulty,
      prevalence, // % of population with difficulty
    };
  });
}

/* ------------------------------------------------------------------ */
/* 2. Age distribution (national, with difficulty)                     */
/* ------------------------------------------------------------------ */

export async function getDisabilityAgeDistribution(
  area = "Ghana",
  indicator = "disability",
  sex = "all",
  ageGroup = "all"
) {
  const meta = indicatorMeta(indicator);
  if (!GEO_AREA_VALUES.has(area)) {
    throw new Error(`Unsupported geographic area: ${area}`);
  }

  const body = {
    query: [
      {
        code: meta.dimCode,
        selection: { filter: "item", values: meta.withDifficultyValues },
      },
      {
        code: "Education",
        selection: { filter: "item", values: ["Total"] },
      },
      {
        code: "Locality",
        selection: { filter: "item", values: ["All Locality Types"] },
      },
      {
        code: "Geographic_Area",
        selection: { filter: "item", values: [area] },
      },
      {
        code: "Sex",
        selection: { filter: "item", values: sexSelection(sex) },
      },
      {
        code: "Age",
        selection: {
          filter: "item",
          values:
            ageGroup && ageGroup !== "all"
              ? [ageGroup]
              : AGE_BANDS_FOR_CARD,
        },
      },
    ],
    response: { format: "json" },
  };

  const json = await fetchWithIndicator(indicator, body);
  const ageIdx = colIndex(json, "Age");
  const dimIdx = colIndex(json, meta.dimCode);

  const sums = new Map();
  for (const row of json.data) {
    const category = row.key[dimIdx];
    if (!meta.withDifficultyValues.includes(category)) continue;
    const age = row.key[ageIdx];
    const val = Number(row.values[0]);
    sums.set(age, (sums.get(age) ?? 0) + (Number.isNaN(val) ? 0 : val));
  }

  return AGE_BANDS_FOR_CARD.map((age) => ({
    age,
    value: sums.get(age) ?? 0,
  }));
}

export async function getDisabilityAgeDistributionNational() {
  return getDisabilityAgeDistribution("Ghana");
}

/* ------------------------------------------------------------------ */
/* 3. Sex distribution (national, with difficulty)                     */
/* ------------------------------------------------------------------ */

export async function getDisabilitySexDistribution(
  area = "Ghana",
  indicator = "disability",
  sex = "all",
  ageGroup = "all"
) {
  if (!GEO_AREA_VALUES.has(area)) {
    throw new Error(`Unsupported geographic area: ${area}`);
  }
  const meta = indicatorMeta(indicator);

  const sexValues =
    sex === "male"
      ? ["Male"]
      : sex === "female"
      ? ["Female"]
      : ["Male", "Female"];

  const body = {
    query: [
      {
        code: meta.dimCode,
        selection: { filter: "item", values: meta.withDifficultyValues },
      },
      {
        code: "Education",
        selection: { filter: "item", values: ["Total"] },
      },
      {
        code: "Locality",
        selection: { filter: "item", values: ["All Locality Types"] },
      },
      {
        code: "Geographic_Area",
        selection: { filter: "item", values: [area] },
      },
      {
        code: "Sex",
        selection: {
          filter: "item",
          values: sexValues,
        },
      },
      {
        code: "Age",
        selection: { filter: "item", values: ageSelection(ageGroup) },
      },
    ],
    response: { format: "json" },
  };

  const json = await fetchWithIndicator(indicator, body);
  const sexIdx = colIndex(json, "Sex");
  const dimIdx = colIndex(json, meta.dimCode);

  const rows = json.data
    .map((row) => ({
      sex: row.key[sexIdx],
      category: row.key[dimIdx],
      value: Number(row.values[0]),
    }))
    .filter((r) => meta.withDifficultyValues.includes(r.category));

  const bySex = new Map(rows.map((r) => [r.sex, r.value]));
  const male = bySex.get("Male") ?? 0;
  const female = bySex.get("Female") ?? 0;
  const total = male + female;

  return {
    total,
    male,
    female,
    malePercent: total ? (male / total) * 100 : 0,
    femalePercent: total ? (female / total) * 100 : 0,
  };
}

export async function getDisabilitySexDistributionNational() {
  return getDisabilitySexDistribution("Ghana");
}

/* ------------------------------------------------------------------ */
/* 4. Education status (with difficulty)                               */
/* ------------------------------------------------------------------ */
/**
 * Returns 4 buckets matching your card:
 *  - No schooling  -> "Never attended"
 *  - Primary       -> "Primary"
 *  - JHS           -> "JSS/JHS"
 *  - SHS+          -> everything else above primary/JHS
 */
export async function getDisabilityEducationStatus(
  area = "Ghana",
  indicator = "disability",
  sex = "all",
  ageGroup = "all"
) {
  const meta = indicatorMeta(indicator);
  if (!GEO_AREA_VALUES.has(area)) {
    throw new Error(`Unsupported geographic area: ${area}`);
  }

  const body = {
    query: [
      {
        code: meta.dimCode,
        selection: { filter: "item", values: meta.withDifficultyValues },
      },
      {
        code: "Education",
        selection: { filter: "item", values: ALL_EDU_VALUES },
      },
      {
        code: "Locality",
        selection: { filter: "item", values: ["All Locality Types"] },
      },
      {
        code: "Geographic_Area",
        selection: { filter: "item", values: [area] },
      },
      {
        code: "Sex",
        selection: { filter: "item", values: sexSelection(sex) },
      },
      {
        code: "Age",
        selection: { filter: "item", values: ageSelection(ageGroup) },
      },
    ],
    response: { format: "json" },
  };

  const json = await fetchWithIndicator(indicator, body);
  const eduIdx = colIndex(json, "Education");
  const dimIdx = colIndex(json, meta.dimCode);

  const rows = json.data
    .map((row) => ({
      edu: row.key[eduIdx],
      category: row.key[dimIdx],
      value: Number(row.values[0]),
    }))
    .filter((r) => meta.withDifficultyValues.includes(r.category));

  const byEdu = new Map(rows.map((r) => [r.edu, r.value]));

  const noSchooling = byEdu.get("Never attended") ?? 0;
  const primary = byEdu.get("Primary") ?? 0;
  const jhs = byEdu.get("JSS/JHS") ?? 0;

  // SHS+ = sum of all remaining levels
  let shsPlus = 0;
  for (const [edu, value] of byEdu.entries()) {
    if (
      edu !== "Never attended" &&
      edu !== "Primary" &&
      edu !== "JSS/JHS"
    ) {
      shsPlus += value;
    }
  }

  const total = noSchooling + primary + jhs + shsPlus;

  function pct(x) {
    return total ? (x / total) * 100 : 0;
  }

  return [
    { label: "No schooling", value: noSchooling, percent: pct(noSchooling) },
    { label: "Primary", value: primary, percent: pct(primary) },
    { label: "JHS", value: jhs, percent: pct(jhs) },
    { label: "SHS+", value: shsPlus, percent: pct(shsPlus) },
  ];
}

export async function getDisabilityEducationStatusNational() {
  return getDisabilityEducationStatus("Ghana");
}

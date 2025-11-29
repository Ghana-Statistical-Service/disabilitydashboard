// app/lib/statsbank.js

const DISABILITY_ENDPOINT =
  "https://statsbank.statsghana.gov.gh/api/v1/en/PHC%202021%20StatsBank/Difficulties%20in%20Performing%20Activities/disability_table.px";

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

// Age bands used in the Age Distribution card
const AGE_BANDS_FOR_CARD = [
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

export async function getDisabilityRegionSummary() {
  const body = {
    query: [
      {
        code: "Disability",
        selection: {
          filter: "item",
          values: ["Total", "With Difficulty"],
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
        selection: { filter: "item", values: ["Both sexes"] },
      },
      {
        code: "Age",
        selection: { filter: "item", values: ["All ages"] },
      },
    ],
    response: { format: "json" },
  };

  const json = await queryPxWeb(DISABILITY_ENDPOINT, body);
  const geoIdx = colIndex(json, "Geographic_Area");
  const disIdx = colIndex(json, "Disability");

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

    if (r.disability === "Total") current.total = r.value;
    if (r.disability === "With Difficulty") current.withDifficulty = r.value;

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
/* 2. Age distribution (national, with difficulty)                     */
/* ------------------------------------------------------------------ */

export async function getDisabilityAgeDistributionNational() {
  const body = {
    query: [
      {
        code: "Disability",
        selection: { filter: "item", values: ["With Difficulty"] },
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
        selection: { filter: "item", values: ["Ghana"] },
      },
      {
        code: "Sex",
        selection: { filter: "item", values: ["Both sexes"] },
      },
      {
        code: "Age",
        selection: { filter: "item", values: AGE_BANDS_FOR_CARD },
      },
    ],
    response: { format: "json" },
  };

  const json = await queryPxWeb(DISABILITY_ENDPOINT, body);
  const ageIdx = colIndex(json, "Age");

  const rows = json.data.map((row) => ({
    age: row.key[ageIdx],
    value: Number(row.values[0]),
  }));

  const byAge = new Map(rows.map((r) => [r.age, r.value]));

  return AGE_BANDS_FOR_CARD.map((age) => ({
    age,
    value: byAge.get(age) ?? 0,
  }));
}

/* ------------------------------------------------------------------ */
/* 3. Sex distribution (national, with difficulty)                     */
/* ------------------------------------------------------------------ */

export async function getDisabilitySexDistributionNational() {
  const body = {
    query: [
      {
        code: "Disability",
        selection: { filter: "item", values: ["With Difficulty"] },
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
        selection: { filter: "item", values: ["Ghana"] },
      },
      {
        code: "Sex",
        selection: {
          filter: "item",
          values: ["Male", "Female"],
        },
      },
      {
        code: "Age",
        selection: { filter: "item", values: ["All ages"] },
      },
    ],
    response: { format: "json" },
  };

  const json = await queryPxWeb(DISABILITY_ENDPOINT, body);
  const sexIdx = colIndex(json, "Sex");

  const rows = json.data.map((row) => ({
    sex: row.key[sexIdx],
    value: Number(row.values[0]),
  }));

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

/* ------------------------------------------------------------------ */
/* 4. Education status (national, with difficulty)                     */
/* ------------------------------------------------------------------ */
/**
 * Returns 4 buckets matching your card:
 *  - No schooling  -> "Never attended"
 *  - Primary       -> "Primary"
 *  - JHS           -> "JSS/JHS"
 *  - SHS+          -> everything else above primary/JHS
 */
export async function getDisabilityEducationStatusNational() {
  const body = {
    query: [
      {
        code: "Disability",
        selection: { filter: "item", values: ["With Difficulty"] },
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
        selection: { filter: "item", values: ["Ghana"] },
      },
      {
        code: "Sex",
        selection: { filter: "item", values: ["Both sexes"] },
      },
      {
        code: "Age",
        selection: { filter: "item", values: ["All ages"] },
      },
    ],
    response: { format: "json" },
  };

  const json = await queryPxWeb(DISABILITY_ENDPOINT, body);
  const eduIdx = colIndex(json, "Education");

  const rows = json.data.map((row) => ({
    edu: row.key[eduIdx],
    value: Number(row.values[0]),
  }));

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

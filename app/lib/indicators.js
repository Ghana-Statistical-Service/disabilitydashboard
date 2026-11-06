// app/lib/indicators.js
// Shared, client-safe indicator metadata (labels + WGSS domain mapping).

export const INDICATOR_OPTIONS = [
  { value: "disability", label: "Disability Status", domain: null },
  { value: "seeing", label: "Seeing Disability", domain: "Seeing" },
  { value: "hearing", label: "Hearing Disability", domain: "Hearing" },
  { value: "physical", label: "Physical Disability", domain: "Walking" },
  {
    value: "intellectual",
    label: "Intellectual Disability",
    domain: "Remembering or concentrating",
  },
  { value: "selfcare", label: "Self-care Disability", domain: "Self-care" },
  { value: "speech", label: "Speech Disability", domain: "Communicating" },
  { value: "severe", label: "Severe Disability", domain: null },
];

export function indicatorLabel(value) {
  return (
    INDICATOR_OPTIONS.find((o) => o.value === value)?.label ||
    INDICATOR_OPTIONS[0].label
  );
}

export const WGSS_DOMAINS = [
  { name: "Seeing", indicator: "Seeing Disability" },
  { name: "Hearing", indicator: "Hearing Disability" },
  { name: "Walking", indicator: "Physical Disability" },
  { name: "Remembering or concentrating", indicator: "Intellectual Disability" },
  { name: "Self-care", indicator: "Self-care Disability" },
  { name: "Communicating", indicator: "Speech Disability" },
];

export const WGSS_RESPONSES = [
  { label: "No difficulty", disability: false },
  { label: "Some difficulty", disability: false },
  { label: "A lot of difficulty", disability: true },
  { label: "Cannot do at all", disability: true },
];

export const DATA_SOURCE =
  "Ghana Statistical Service, 2021 Population and Housing Census";

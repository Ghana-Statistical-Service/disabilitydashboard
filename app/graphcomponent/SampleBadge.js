// app/graphcomponent/SampleBadge.js
// Marks cards that still display placeholder figures, so they are not
// mistaken for published census statistics.
export default function SampleBadge() {
  return (
    <span
      className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800"
      title="Illustrative figures — not yet connected to StatsBank"
    >
      Sample data
    </span>
  );
}

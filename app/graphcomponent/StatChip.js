// app/components/graphcomponent/StatChip.js
export default function StatChip({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-white p-3 text-xs shadow-sm">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

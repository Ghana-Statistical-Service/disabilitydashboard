// app/components/graphcomponent/StatChip.js
export default function StatChip({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-slate-200 bg-white p-3 text-xs">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

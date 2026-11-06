// app/components/graphcomponent/AccessServicesCard.js
import StatChip from "./StatChip";
import SampleBadge from "./SampleBadge";

const SERVICES = [
  { label: "Assistive devices", value: 32 },
  { label: "Social protection", value: 24 },
  { label: "Health access", value: 61 },
  { label: "Inclusive sanitation", value: 37 },
];

export default function AccessServicesCard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Access to Services &amp; Assistive Devices
          </h3>
          <SampleBadge />
        </div>
        <ul className="mt-4 space-y-3 text-xs">
          {SERVICES.map((s) => (
            <li key={s.label}>
              <div className="mb-1 flex justify-between text-[11px] text-slate-600">
                <span>{s.label}</span>
                <span className="font-medium text-slate-900">
                  {s.value.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#2a9d8f]"
                  style={{ width: `${s.value}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-slate-400">
          Share of persons with disability reporting access to each service.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatChip label="Inclusive education" value="In focus" />
        <StatChip label="Employment & skills" value="Priority" />
        <StatChip label="Assistive services" value="Emerging gaps" />
      </div>
    </div>
  );
}

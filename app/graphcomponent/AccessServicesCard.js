// app/components/graphcomponent/AccessServicesCard.js
import StatChip from "./StatChip";

export default function AccessServicesCard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-white p-5 shadow-md">
        <h3 className="text-base font-semibold text-slate-900">
          Access to Services &amp; Assistive Devices
        </h3>
        <div className="mt-4 space-y-3 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span>Assistive Devices</span>
            <span className="font-semibold">32.0%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Social Protection</span>
            <span className="font-semibold">24.0%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Health Access</span>
            <span className="font-semibold">61.0%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Inclusive Sanitation</span>
            <span className="font-semibold">37.0%</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Employment among persons with disability remains around 15 percentage
          points lower than the general population.
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

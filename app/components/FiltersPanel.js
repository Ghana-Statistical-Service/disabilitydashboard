// app/components/FiltersPanel.js

const buttonBase =
  "rounded-full px-4 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-white/60";

export default function FiltersPanel() {
  return (
    <aside className="rounded-3xl bg-[#392675] px-4 py-5 text-white shadow-lg sm:px-5 lg:px-6">
      <h2 className="mb-4 text-base font-semibold">Filters</h2>

      {/* Indicator */}
      <div className="mb-4 space-y-1 text-xs">
        <label className="font-medium text-violet-100">Indicator</label>
        <select className="w-full rounded-xl border-0 bg-white/10 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white">
          <option className="text-slate-900">Disability Status</option>
          <option className="text-slate-900">Seeing Disability</option>
          <option className="text-slate-900">Hearing Disability</option>
          <option className="text-slate-900">Intellectual Disability</option>
          <option className="text-slate-900">Physical Disability</option>
          <option className="text-slate-900">Selfcare Disability</option>
          <option className="text-slate-900">Severe Disability</option>
          <option className="text-slate-900">Speech Disability</option>
        </select>
      </div>

      {/* Geography level */}
      <div className="mb-4 space-y-1 text-xs">
        <label className="font-medium text-violet-100">Geographic level</label>
        <div className="flex gap-2">
          <button className={`${buttonBase} bg-white text-[#392675]`}>
            National
          </button>
          <button className={`${buttonBase} bg-white/10`}>Region</button>
          <button className={`${buttonBase} bg-white/10`}>District</button>
        </div>
      </div>

      {/* Year */}
      <div className="mb-4 space-y-1 text-xs">
        <label className="font-medium text-violet-100">Year</label>
        <select className="w-full rounded-xl border-0 bg-white/10 px-3 py-2 text-xs text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white">
          <option className="text-slate-900">2021</option>
          <option className="text-slate-900">2010</option>
        </select>
      </div>

      {/* Sex */}
      <div className="mb-4 space-y-1 text-xs">
        <label className="font-medium text-violet-100">Sex</label>
        <div className="flex gap-2">
          <button className={`${buttonBase} bg-white text-[#392675]`}>
            All
          </button>
          <button className={`${buttonBase} bg-white/10`}>Male</button>
          <button className={`${buttonBase} bg-white/10`}>Female</button>
        </div>
      </div>

      {/* Age group */}
      <div className="mb-6 space-y-1 text-xs">
        <label className="font-medium text-violet-100">Age Group</label>
        <div className="flex flex-wrap gap-2">
          <button className={`${buttonBase} bg-white text-[#392675]`}>
            5-9
          </button>
          <button className={`${buttonBase} bg-white/10`}>10–14</button>
          <button className={`${buttonBase} bg-white/10`}>15–17</button>
          <button className={`${buttonBase} bg-white/10`}>18-19</button>
          <button className={`${buttonBase} bg-white/10`}>20-24</button>
          <button className={`${buttonBase} bg-white/10`}>25-30</button>
        </div>
      </div>

      <button className="mt-1 w-full rounded-2xl bg-white py-3 text-sm font-semibold text-[#392675] shadow-md transition hover:bg-violet-50">
        Apply
      </button>
    </aside>
  );
}

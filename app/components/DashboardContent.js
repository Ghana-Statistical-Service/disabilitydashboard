// app/components/DashboardContent.js
"use client";
import { useState } from "react";
import FiltersPanel from "./FiltersPanel";
import DisabilityPrevalenceCard from "../graphcomponent/DisabilityPrevalenceCard";
import AgeDistributionCard from "../graphcomponent/AgeDistributionCard";
import SexDistributionCard from "../graphcomponent/SexDistributionCard";
import EmploymentStatusCard from "../graphcomponent/EmploymentStatusCard";
import EducationStatusCard from "../graphcomponent/EducationStatusCard";
import AccessServicesCard from "../graphcomponent/AccessServicesCard";


export default function DashboardContent() {
  const [filters, setFilters] = useState({
    indicator: "disability",
    geographicLevel: "national",
    sex: "all",
    ageGroup: "all",
  });

  const handleApply = (next) => setFilters(next);

  return (
    <main className="bg-[#f4f3fb]">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-0 lg:px-0">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* LEFT: Filters panel */}
          <div className="lg:col-span-1 self-start lg:sticky lg:top-24">
            <FiltersPanel filters={filters} onApply={handleApply} />
          </div>

          {/* RIGHT: Dashboard content */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Row 1 */}
            <DisabilityPrevalenceCard filters={filters} />

            {/* Row 2: Age, Sex, Employment */}
            <section className="grid gap-4 lg:grid-cols-3">
              <AgeDistributionCard filters={filters} />
              <SexDistributionCard filters={filters} />
              <EmploymentStatusCard />
            </section>

            {/* Row 3: Education + Access */}
            <section className="grid gap-4 lg:grid-cols-2">
              <EducationStatusCard filters={filters} />
              <AccessServicesCard />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

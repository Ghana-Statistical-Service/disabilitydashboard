// app/components/DashboardContent.js
"use client";
import { useState } from "react";
import FiltersPanel from "./FiltersPanel";
import HeadlineStats from "../graphcomponent/HeadlineStats";
import DomainComparisonCard from "../graphcomponent/DomainComparisonCard";
import IndicatorExplainer from "./IndicatorExplainer";
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
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {/* Context / methodology bar */}
        <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Persons with disability in Ghana
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Functional difficulty among persons aged 5 years and older,
              measured with the Washington Group Short Set of Questions on
              Disability across six domains.
            </p>
          </div>
          <div className="shrink-0">
            <IndicatorExplainer variant="button" label="Explain indicators" />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* LEFT: Filters panel */}
          <div className="self-start lg:sticky lg:top-6 lg:col-span-1">
            <FiltersPanel filters={filters} onApply={handleApply} />
          </div>

          {/* RIGHT: Dashboard content */}
          <div className="flex flex-col gap-6 lg:col-span-3">
            <HeadlineStats filters={filters} />

            <DisabilityPrevalenceCard filters={filters} />

            <DomainComparisonCard filters={filters} />

            <section className="grid gap-6 lg:grid-cols-3">
              <AgeDistributionCard filters={filters} />
              <SexDistributionCard filters={filters} />
              <EmploymentStatusCard />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <EducationStatusCard filters={filters} />
              <AccessServicesCard />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

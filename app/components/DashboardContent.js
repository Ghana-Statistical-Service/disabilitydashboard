// app/components/DashboardContent.js
import FiltersPanel from "./FiltersPanel";
import DisabilityPrevalenceCard from "../graphcomponent/DisabilityPrevalenceCard";
import AgeDistributionCard from "../graphcomponent/AgeDistributionCard";
import SexDistributionCard from "../graphcomponent/SexDistributionCard";
import EmploymentStatusCard from "../graphcomponent/EmploymentStatusCard";
import EducationStatusCard from "../graphcomponent/EducationStatusCard";
import AccessServicesCard from "../graphcomponent/AccessServicesCard";


export default function DashboardContent() {
  return (
    <main className="bg-[#f4f3fb]">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-0 lg:px-0">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* LEFT: Filters panel */}
          <div className="lg:col-span-1 self-start lg:sticky lg:top-24">
            <FiltersPanel />
          </div>

          {/* RIGHT: Dashboard content */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Row 1 */}
            <DisabilityPrevalenceCard />

            {/* Row 2: Age, Sex, Employment */}
            <section className="grid gap-4 lg:grid-cols-3">
              <AgeDistributionCard />
              <SexDistributionCard />
              <EmploymentStatusCard />
            </section>

            {/* Row 3: Education + Access */}
            <section className="grid gap-4 lg:grid-cols-2">
              <EducationStatusCard />
              <AccessServicesCard />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

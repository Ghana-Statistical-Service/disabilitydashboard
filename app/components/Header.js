// app/components/Header.js
import Image from "next/image";
import IndicatorExplainer from "./IndicatorExplainer";

export default function Header() {
  return (
    <header className="w-full bg-[#352676] text-white">
      {/* National colour rule */}
      <div className="flex h-1 w-full" aria-hidden="true">
        <span className="flex-1 bg-[#ce1126]" />
        <span className="flex-1 bg-[#fcd116]" />
        <span className="flex-1 bg-[#006b3f]" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Left: logo + title */}
        <div className="flex items-center gap-4">
          <div className="relative h-11 w-11 shrink-0">
            <Image
              src="/gss-logo.png"
              alt="Ghana Statistical Service"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="border-l border-white/20 pl-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-200">
              2021 Population and Housing Census
            </p>
            <h1 className="text-lg font-semibold leading-tight tracking-tight sm:text-xl">
              Disability Data Dashboard
            </h1>
          </div>
        </div>

        {/* Right nav */}
        <nav
          aria-label="Dashboard"
          className="flex items-center gap-6 text-sm font-medium"
        >
          <IndicatorExplainer variant="link" label="About the data" />
          <a href="#" className="text-white/90 transition hover:text-white">
            User Guide
          </a>
        </nav>
      </div>
    </header>
  );
}

// app/components/Header.js
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-[#352676] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Left: logo + title */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            <Image
              src="/gss-logo.png" // put logo in /public
              alt="Ghana Statistical Service"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight sm:text-2xl">
              Disability Data Dashboard
            </h1>
            <p className="text-xs text-violet-100 sm:text-sm">
              Insights from Ghana Statistical Service StatsBank
            </p>
          </div>
        </div>

        {/* Right nav */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="hover:text-violet-100">
            User Guide
          </a>
          <a href="#" className="hover:text-violet-100">
            About
          </a>
        </nav>
      </div>
    </header>
  );
}

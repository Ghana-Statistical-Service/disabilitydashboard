// app/components/Footer.js

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 text-center text-xs text-slate-500 sm:flex-row lg:px-8">
        <p>&copy; {year} Ghana Statistical Service. All rights reserved.</p>
        <p className="sm:text-right">
          Data and indicators referenced from{" "}
          <span className="font-semibold text-slate-700">StatsBank</span>.
        </p>
      </div>
    </footer>
  );
}

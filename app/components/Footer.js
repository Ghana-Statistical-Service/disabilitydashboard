// app/components/Footer.js
import { DATA_SOURCE } from "../lib/indicators";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>&copy; {year} Ghana Statistical Service. All rights reserved.</p>
        <p className="sm:text-right">
          Source: {DATA_SOURCE}, via{" "}
          <a
            href="https://statsbank.statsghana.gov.gh/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-700 underline-offset-2 hover:underline"
          >
            GSS StatsBank
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

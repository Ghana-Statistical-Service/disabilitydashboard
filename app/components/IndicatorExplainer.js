// app/components/IndicatorExplainer.js
"use client";

import { useId, useState } from "react";
import Modal from "./Modal";
import { WGSS_DOMAINS, WGSS_RESPONSES, DATA_SOURCE } from "../lib/indicators";

function InfoIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 9v4.5" strokeLinecap="round" />
      <circle cx="10" cy="6.4" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

const TRIGGER_STYLES = {
  // Outlined button for light surfaces
  button:
    "inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#352676] shadow-sm transition hover:border-[#352676] hover:bg-[#f5f3fc]",
  // Plain text link for the purple header
  link: "inline-flex items-center gap-1.5 text-sm font-medium text-white/90 transition hover:text-white",
  // Small icon button for the dark filters panel
  icon: "inline-flex h-6 w-6 items-center justify-center rounded-full text-violet-100 transition hover:bg-white/15 hover:text-white",
};

/**
 * Renders a trigger plus a modal dialog that explains how disability is
 * measured (Washington Group Short Set, 2021 PHC).
 *
 * variant: "button" | "link" | "icon"
 */
export default function IndicatorExplainer({
  variant = "button",
  label = "Explain indicators",
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={TRIGGER_STYLES[variant]}
        aria-haspopup="dialog"
        aria-label={variant === "icon" ? label : undefined}
        title={variant === "icon" ? label : undefined}
      >
        <InfoIcon className="h-4 w-4" />
        {variant !== "icon" && <span>{label}</span>}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Methodology"
        title="How disability is measured"
        footer={<p>Source: {DATA_SOURCE}.</p>}
      >
          <div className="space-y-6">
            <p>
              In the 2021 Population and Housing Census (PHC), the Ghana
              Statistical Service (GSS) used the{" "}
              <strong className="font-semibold text-slate-900">
                Washington Group Short Set (WGSS)
              </strong>{" "}
              of Questions on Disability to assess functional difficulties
              among persons aged{" "}
              <strong className="font-semibold text-slate-900">
                5 years and above
              </strong>
              .
            </p>

            {/* Domains */}
            <section aria-labelledby={`${titleId}-domains`}>
              <h3
                id={`${titleId}-domains`}
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Six functional domains
              </h3>
              <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                {WGSS_DOMAINS.map((d, i) => (
                  <li
                    key={d.name}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2.5"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ece8fb] text-[11px] font-semibold text-[#352676]">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-medium text-slate-900">
                        {d.name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        Dashboard indicator: {d.indicator}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Response categories */}
            <section aria-labelledby={`${titleId}-responses`}>
              <h3
                id={`${titleId}-responses`}
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Response categories
              </h3>
              <p className="mt-2">
                Respondents were asked to indicate their level of difficulty
                in each domain using four response categories:
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {WGSS_RESPONSES.map((r) => (
                  <li
                    key={r.label}
                    className={`rounded-xl border px-3 py-2.5 text-center text-xs font-medium ${
                      r.disability
                        ? "border-[#352676] bg-[#352676] text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {r.label}
                  </li>
                ))}
              </ul>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-500 sm:grid-cols-4">
                <span className="col-span-1 text-center sm:col-span-2">
                  Not classified as disability
                </span>
                <span className="col-span-1 text-center font-semibold text-[#352676] sm:col-span-2">
                  Classified as disability
                </span>
              </div>
            </section>

            {/* Classification rule */}
            <section className="rounded-xl border-l-4 border-[#352676] bg-[#f5f3fc] px-4 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#352676]">
                Definition
              </h3>
              <p className="mt-1 text-slate-800">
                Individuals who reported either{" "}
                <strong>a lot of difficulty</strong> or{" "}
                <strong>cannot do at all</strong> in{" "}
                <strong>any</strong> of the six domains were classified as
                having a disability.
              </p>
            </section>
          </div>

      </Modal>
    </>
  );
}

// app/components/Modal.js
"use client";

import { useEffect, useId, useRef } from "react";

/**
 * Accessible modal built on the native <dialog> element.
 * Closes on Esc, on backdrop click and via the close button; locks page
 * scroll while open.
 */
export default function Modal({
  open,
  onClose,
  eyebrow,
  title,
  children,
  footer,
  widthClass = "w-[min(44rem,calc(100vw-2rem))]",
}) {
  const dialogRef = useRef(null);
  const titleId = useId();

  // Sync the native dialog with the `open` prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // click on the backdrop closes the dialog
        if (e.target === dialogRef.current) onClose();
      }}
      className={`app-dialog m-auto ${widthClass} max-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl bg-white p-0 text-slate-700 shadow-2xl`}
    >
      <div className="flex max-h-[calc(100vh-2rem)] flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            {eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5b47b8]">
                {eyebrow}
              </p>
            )}
            <h2 id={titleId} className="mt-1 text-lg font-semibold text-slate-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 text-sm leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>{footer}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#352676] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2a1e5e]"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

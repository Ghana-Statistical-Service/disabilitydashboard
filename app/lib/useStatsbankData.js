// app/lib/useStatsbankData.js
// Fetches `{ data }` from one of the dashboard's API routes.
"use client";

import { useEffect, useState } from "react";

/**
 * @param {string} path   API route, e.g. "/api/statsbank/disability/age"
 * @param {object} params query-string parameters
 * @returns {{ data: any, loading: boolean, error: string | null }}
 *
 * `loading` is derived by comparing the current request with the last one
 * that finished, so no state is set synchronously inside the effect. The
 * previous data stays on screen while a new request loads, and stale
 * requests are aborted so an old response can never overwrite a newer one.
 */
export function useStatsbankData(path, params = {}) {
  const key = `${path}?${new URLSearchParams(params).toString()}`;
  const [result, setResult] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();

    fetch(key, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((json) => {
        setResult({ key, data: json?.data ?? null, error: null });
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error(`StatsBank fetch error (${path}):`, err);
        setResult((prev) => ({
          key,
          data: prev.data,
          error: "Unable to load data",
        }));
      });

    return () => controller.abort();
  }, [key, path]);

  const loading = result.key !== key;
  return {
    data: result.data,
    loading,
    error: loading ? null : result.error,
  };
}

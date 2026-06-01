"use client";

import { useState, useTransition } from "react";
import type { CalculatorInput, RankedPlatform } from "@/lib/types";

export function SaveComparisonButton({
  input,
  results,
}: {
  input: CalculatorInput;
  results: RankedPlatform[];
}) {
  const [isPending, startTransition] = useTransition();
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, results }),
      });

      if (!response.ok) {
        setError("Could not save this comparison.");
        return;
      }

      const data = (await response.json()) as { id: string };
      setSavedUrl(`/saved/${data.id}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={save}
        disabled={isPending}
        className="rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save share link"}
      </button>
      {savedUrl && (
        <a className="text-sm font-medium text-cyan-200 underline-offset-4 hover:underline" href={savedUrl}>
          {savedUrl}
        </a>
      )}
      {error && <p className="text-sm text-rose-200">{error}</p>}
    </div>
  );
}

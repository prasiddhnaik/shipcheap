"use client";

import { useState, useTransition } from "react";
import type { CalculatorInput, RankedPlatform } from "@/lib/types";

const RECENT_SHARE_KEY = "shipcheap:recent-share-links";

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
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Could not create this share link.");
        return;
      }

      const data = (await response.json()) as { id: string };
      const url = `/saved/${data.id}`;
      setSavedUrl(url);
      rememberShareLink(url);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={save}
        disabled={isPending}
        className="brutal-button brutal-button-yellow px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating…" : "Create share link"}
      </button>
      {savedUrl && (
        <a className="text-sm font-black text-[var(--accent)] underline-offset-4 hover:underline" href={savedUrl}>
          {savedUrl}
        </a>
      )}
      {error && <p className="text-sm font-black text-[var(--red)]">{error}</p>}
    </div>
  );
}

function rememberShareLink(url: string) {
  try {
    const existing = JSON.parse(window.localStorage.getItem(RECENT_SHARE_KEY) ?? "[]") as string[];
    const next = [url, ...existing.filter((item) => item !== url)].slice(0, 8);
    window.localStorage.setItem(RECENT_SHARE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("shipcheap:share-links"));
  } catch {
    // Ignore storage failures in private browsing / restricted contexts.
  }
}

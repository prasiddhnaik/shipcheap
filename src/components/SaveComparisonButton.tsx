"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
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
  const { isLoaded, isSignedIn } = useAuth();

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
      {!isLoaded ? (
        <button
          type="button"
          disabled
          className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-semibold text-slate-500"
        >
          Loading save...
        </button>
      ) : isSignedIn ? (
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-md border border-[#2442ed]/35 bg-[#2442ed]/10 px-3 py-2 text-sm font-semibold text-[#e6eaff] transition hover:bg-[#2442ed]/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save private link"}
        </button>
      ) : (
        <SignInButton mode="modal">
          <button
            type="button"
            className="rounded-md border border-[#2442ed]/35 bg-[#2442ed]/10 px-3 py-2 text-sm font-semibold text-[#e6eaff] transition hover:bg-[#2442ed]/15"
          >
            Sign in to save
          </button>
        </SignInButton>
      )}
      {savedUrl && (
        <a className="text-sm font-medium text-[#aeb9ff] underline-offset-4 hover:underline" href={savedUrl}>
          {savedUrl}
        </a>
      )}
      {error && <p className="text-sm text-rose-200">{error}</p>}
    </div>
  );
}

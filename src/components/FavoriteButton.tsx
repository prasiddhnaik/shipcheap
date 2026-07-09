"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  platformSlug: string;
  platformName: string;
  initialFavorited?: boolean;
  initialNote?: string;
  compact?: boolean;
  className?: string;
};

export function FavoriteButton({
  platformSlug,
  platformName,
  initialFavorited = false,
  initialNote = "",
  compact = false,
  className,
}: FavoriteButtonProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [note, setNote] = useState(initialNote);
  const [draftNote, setDraftNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(Boolean(initialNote));

  useEffect(() => {
    if (!isLoaded || !isSignedIn || initialFavorited) return;

    let cancelled = false;

    async function loadFavorite() {
      const response = await fetch("/api/favorites");
      if (!response.ok || cancelled) return;
      const data = (await response.json()) as {
        favorites?: Array<{ platformSlug: string; note: string }>;
      };
      const match = data.favorites?.find((favorite) => favorite.platformSlug === platformSlug);
      if (!match || cancelled) return;
      setFavorited(true);
      setNote(match.note);
      setDraftNote(match.note);
      setShowNote(Boolean(match.note));
    }

    void loadFavorite();

    return () => {
      cancelled = true;
    };
  }, [initialFavorited, isLoaded, isSignedIn, platformSlug]);

  function saveFavorite(nextNote: string) {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformSlug, note: nextNote }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Could not save favorite.");
        return;
      }

      setFavorited(true);
      setNote(nextNote);
      setDraftNote(nextNote);
      setShowNote(true);
      router.refresh();
    });
  }

  function removeFavorite() {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformSlug }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Could not remove favorite.");
        return;
      }

      setFavorited(false);
      setNote("");
      setDraftNote("");
      setShowNote(false);
      router.refresh();
    });
  }

  if (!isLoaded) {
    return (
      <button type="button" disabled className={cn(buttonClass(compact, false), "opacity-60", className)}>
        <Star size={compact ? 14 : 15} />
        {compact ? "…" : "Loading"}
      </button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button type="button" className={cn(buttonClass(compact, false), className)}>
          <Star size={compact ? 14 : 15} />
          {compact ? "Save" : `Save ${platformName}`}
        </button>
      </SignInButton>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {favorited ? (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={removeFavorite}
              className={cn(buttonClass(compact, true), "disabled:cursor-not-allowed disabled:opacity-60")}
            >
              <Star size={compact ? 14 : 15} fill="currentColor" />
              {compact ? "Saved" : "Saved to favorites"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowNote((current) => !current)}
              className="border-2 border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-xs font-black text-[var(--foreground)] shadow-[2px_2px_0_var(--line)] transition hover:bg-[var(--yellow)] disabled:opacity-60"
            >
              {showNote ? "Hide note" : note ? "Edit note" : "Add note"}
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => saveFavorite("")}
            className={cn(buttonClass(compact, false), "disabled:cursor-not-allowed disabled:opacity-60")}
          >
            <Star size={compact ? 14 : 15} />
            {isPending ? "Saving…" : compact ? "Favorite" : `Favorite ${platformName}`}
          </button>
        )}
      </div>

      {favorited && showNote && (
        <div className="border-2 border-[var(--line)] bg-[var(--paper)] p-3">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Why you&apos;re watching this</span>
            <textarea
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value.slice(0, 280))}
              rows={3}
              placeholder="e.g. No-card path looks safest for the FastAPI prototype."
              className="mt-2 w-full resize-y border-2 border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-medium text-[var(--foreground)] outline-none focus:bg-[var(--yellow)]"
            />
          </label>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-[var(--muted)]">{draftNote.length}/280</p>
            <button
              type="button"
              disabled={isPending || draftNote === note}
              onClick={() => saveFavorite(draftNote)}
              className="border-2 border-[var(--line)] bg-[#002fa7] px-3 py-1.5 text-xs font-black text-white shadow-[2px_2px_0_var(--line)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save note"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm font-black text-[var(--red)]">{error}</p>}
    </div>
  );
}

function buttonClass(compact: boolean, active: boolean) {
  return cn(
    "inline-flex items-center justify-center gap-2 border-[3px] border-[var(--line)] font-black shadow-[3px_3px_0_var(--line)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)]",
    compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm",
    active ? "bg-[var(--yellow)] text-[var(--foreground)]" : "bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--yellow)]",
  );
}

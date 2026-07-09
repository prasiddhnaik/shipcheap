"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { AppChrome } from "@/components/AppChrome";
import { ArrowRight, Boxes, Link2 } from "lucide-react";

const RECENT_SHARE_KEY = "shipcheap:recent-share-links";

export default function SavedPage() {
  const recentLinks = useSyncExternalStore(subscribeToShareLinks, getShareLinksSnapshot, getServerShareLinksSnapshot);

  return (
    <AppChrome active="saved">
      <main className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-10">
        <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border-2 border-[var(--line)] bg-[var(--yellow)] text-[var(--foreground)]">
              <Boxes size={20} />
            </span>
            <div>
              <h1 className="text-[28px] font-black leading-tight text-[var(--foreground)] sm:text-[34px]">Share links</h1>
              <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                Create anonymous comparison snapshots from the dashboard. No account required.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3">
          {recentLinks.length === 0 ? (
            <div className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
              <h2 className="text-lg font-black text-[var(--foreground)]">No recent share links on this device</h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--muted)]">
                Rank options on the dashboard, then hit “Create share link.” Recent links stay in this browser only.
              </p>
              <Link
                href="/#recommendations"
                className="mt-4 inline-flex items-center gap-2 border-[3px] border-[var(--line)] bg-[#002fa7] px-4 py-2 text-sm font-black text-white shadow-[4px_4px_0_var(--line)]"
              >
                Go to recommendations
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            recentLinks.map((href) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between gap-3 border-[3px] border-[var(--line)] bg-[var(--panel)] p-4 transition hover:bg-[var(--paper)]"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center border-2 border-[var(--line)] bg-[var(--yellow)]">
                    <Link2 size={16} />
                  </span>
                  <div>
                    <p className="font-black text-[var(--foreground)]">{href}</p>
                    <p className="mt-1 text-xs font-medium text-[var(--muted)]">Stored in this browser</p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-[var(--accent)]" />
              </Link>
            ))
          )}
        </section>
      </main>
    </AppChrome>
  );
}

function subscribeToShareLinks(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("shipcheap:share-links", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("shipcheap:share-links", onStoreChange);
  };
}

function getShareLinksSnapshot() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_SHARE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string").slice(0, 8);
  } catch {
    return [];
  }
}

function getServerShareLinksSnapshot() {
  return [] as string[];
}

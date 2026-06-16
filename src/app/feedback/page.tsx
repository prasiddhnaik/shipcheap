import { AppChrome } from "@/components/AppChrome";
import { FeedbackForm } from "@/components/FeedbackForm";
import { MessageSquare } from "lucide-react";

export default function FeedbackPage() {
  return (
    <AppChrome active="dashboard">
      <main className="mx-auto max-w-[820px] px-4 py-5 sm:px-6 lg:px-10">
        <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border border-[#002fa7]/35 bg-[#002fa7]/10 text-[#002fa7]">
              <MessageSquare size={20} />
            </span>
            <div>
              <h1 className="text-[28px] font-semibold leading-tight text-[var(--foreground)] sm:text-[34px]">Feedback</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">Report broken controls, stale pricing data, or confusing recommendations.</p>
            </div>
          </div>
        </section>
        <FeedbackForm />
      </main>
    </AppChrome>
  );
}

import { AppChrome } from "@/components/AppChrome";
import { FeedbackForm } from "@/components/FeedbackForm";
import { MessageSquare } from "lucide-react";

export default function FeedbackPage() {
  return (
    <AppChrome active="dashboard">
      <main className="mx-auto max-w-[820px] px-4 py-5 sm:px-6 lg:px-10">
        <section className="rounded-lg border border-white/10 bg-[#111821]/85 p-5 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-300/20 bg-violet-500/10 text-violet-200">
              <MessageSquare size={20} />
            </span>
            <div>
              <h1 className="text-[28px] font-semibold leading-tight text-white sm:text-[34px]">Feedback</h1>
              <p className="mt-1 text-sm text-slate-400">Report broken controls, stale pricing data, or confusing recommendations.</p>
            </div>
          </div>
        </section>
        <FeedbackForm />
      </main>
    </AppChrome>
  );
}

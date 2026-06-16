"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

export function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="mt-4 border border-[var(--line)] bg-[var(--panel)] p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!message.trim()) return;
        setSubmitted(true);
      }}
    >
      <label className="block">
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <MessageSquare size={16} className="text-[#002fa7]" />
          Feedback
        </span>
        <textarea
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setSubmitted(false);
          }}
          rows={6}
          className="mt-3 w-full border border-[var(--line)] bg-[var(--panel)] p-3 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[#002fa7]/70"
          placeholder="Tell us what is broken, confusing, or missing."
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-[#002fa7] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#003399] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!message.trim()}
        >
          <Send size={15} />
          Send feedback
        </button>
        {submitted && <p className="text-sm font-medium text-emerald-300">Feedback noted for this session.</p>}
      </div>
    </form>
  );
}

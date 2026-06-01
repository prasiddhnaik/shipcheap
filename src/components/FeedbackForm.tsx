"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

export function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="mt-4 rounded-lg border border-white/10 bg-[#111821]/85 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!message.trim()) return;
        setSubmitted(true);
      }}
    >
      <label className="block">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <MessageSquare size={16} className="text-violet-300" />
          Feedback
        </span>
        <textarea
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setSubmitted(false);
          }}
          rows={6}
          className="mt-3 w-full rounded-lg border border-white/10 bg-[#080d14] p-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-300/60"
          placeholder="Tell us what is broken, confusing, or missing."
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
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

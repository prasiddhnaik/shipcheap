import { Bot, ExternalLink } from "lucide-react";
import { getPlatformMcpIntegration } from "@/data/platforms";

export function ProviderMcpBadge({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const integration = getPlatformMcpIntegration(slug);
  if (!integration) return null;

  return (
    <a
      href={integration.docsUrl}
      target="_blank"
      rel="noreferrer"
      title={integration.caution}
      className="inline-flex items-center gap-1.5 border-2 border-[var(--line)] bg-[#dbeafe] px-2 py-1 text-xs font-black text-[var(--foreground)] transition hover:bg-[#bfdbfe]"
    >
      <Bot size={13} />
      {compact ? "Agent MCP" : integration.label}
      {!compact && <ExternalLink size={11} />}
    </a>
  );
}

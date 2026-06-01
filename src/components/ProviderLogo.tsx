import {
  siDigitalocean,
  siFlydotio,
  siKoyeb,
  siNeon,
  siRailway,
  siRender,
  siSupabase,
  siVercel,
} from "simple-icons";

const logoByName = {
  "DigitalOcean App Platform": siDigitalocean,
  "Fly.io": siFlydotio,
  Koyeb: siKoyeb,
  Neon: siNeon,
  Railway: siRailway,
  Render: siRender,
  Supabase: siSupabase,
  Vercel: siVercel,
};

const colorByName: Record<string, string> = {
  "DigitalOcean App Platform": "text-[#0080FF]",
  "Fly.io": "text-white",
  Koyeb: "text-white",
  Neon: "text-[#00E599]",
  Railway: "text-[#B066FF]",
  Render: "text-white",
  Supabase: "text-[#3ECF8E]",
  Vercel: "text-white",
};

export function ProviderLogo({ name, large = false }: { name: string; large?: boolean }) {
  const logo = logoByName[name as keyof typeof logoByName];
  const size = large ? "h-11 w-11" : "h-7 w-7";
  const iconSize = large ? "h-6 w-6" : "h-4 w-4";
  const color = colorByName[name] ?? "text-white";

  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] ${size}`}>
      {logo ? (
        <svg className={`${iconSize} ${color}`} role="img" aria-label={`${name} logo`} viewBox="0 0 24 24">
          <path fill="currentColor" d={logo.path} />
        </svg>
      ) : (
        <span className="text-xs font-black text-white">{name.slice(0, 1)}</span>
      )}
    </span>
  );
}

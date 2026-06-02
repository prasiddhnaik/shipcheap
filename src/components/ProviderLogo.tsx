import {
  siAppwrite,
  siCloudflareworkers,
  siConvex,
  siDigitalocean,
  siFirebase,
  siFlydotio,
  siGooglecloud,
  siKoyeb,
  siNeon,
  siNetlify,
  siRailway,
  siRender,
  siSupabase,
  siVercel,
} from "simple-icons";

const logoByName = {
  Appwrite: siAppwrite,
  "Cloudflare Workers": siCloudflareworkers,
  Convex: siConvex,
  "DigitalOcean App Platform": siDigitalocean,
  "Firebase App Hosting": siFirebase,
  "Fly.io": siFlydotio,
  "Google Cloud Run": siGooglecloud,
  Koyeb: siKoyeb,
  Neon: siNeon,
  Netlify: siNetlify,
  Railway: siRailway,
  Render: siRender,
  Supabase: siSupabase,
  Vercel: siVercel,
};

const colorByName: Record<string, string> = {
  Appwrite: "text-[#FD366E]",
  "Cloudflare Workers": "text-[#F38020]",
  Convex: "text-[#EE342F]",
  "DigitalOcean App Platform": "text-[#0080FF]",
  "Firebase App Hosting": "text-[#FFCA28]",
  "Fly.io": "text-white",
  "Google Cloud Run": "text-[#4285F4]",
  Koyeb: "text-white",
  Neon: "text-[#00E599]",
  Netlify: "text-[#00C7B7]",
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

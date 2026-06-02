import {
  siAkamai,
  siAppwrite,
  siCaprover,
  siCloudflareworkers,
  siCoolify,
  siConvex,
  siDeno,
  siDigitalocean,
  siFirebase,
  siFlydotio,
  siGooglecloud,
  siHetzner,
  siKoyeb,
  siNeon,
  siNetlify,
  siPlatformdotsh,
  siRailway,
  siRender,
  siReplit,
  siScaleway,
  siSupabase,
  siVercel,
} from "simple-icons";

const logoByName = {
  "Akamai/Linode": siAkamai,
  Appwrite: siAppwrite,
  CapRover: siCaprover,
  "Cloudflare Workers": siCloudflareworkers,
  Coolify: siCoolify,
  Convex: siConvex,
  "Deno Deploy": siDeno,
  "DigitalOcean App Platform": siDigitalocean,
  "Firebase App Hosting": siFirebase,
  "Fly.io": siFlydotio,
  "Google Cloud Run": siGooglecloud,
  "Hetzner Cloud": siHetzner,
  Koyeb: siKoyeb,
  Neon: siNeon,
  Netlify: siNetlify,
  "Platform.sh": siPlatformdotsh,
  Railway: siRailway,
  Render: siRender,
  "Replit Deployments": siReplit,
  "Scaleway Serverless Containers": siScaleway,
  Supabase: siSupabase,
  Vercel: siVercel,
};

const colorByName: Record<string, string> = {
  "Akamai/Linode": "text-[#009CDE]",
  Appwrite: "text-[#FD366E]",
  CapRover: "text-[#2DD4BF]",
  "Cloudflare Workers": "text-[#F38020]",
  Coolify: "text-[#8B5CF6]",
  Convex: "text-[#EE342F]",
  "Deno Deploy": "text-white",
  "DigitalOcean App Platform": "text-[#0080FF]",
  "Firebase App Hosting": "text-[#FFCA28]",
  "Fly.io": "text-white",
  "Google Cloud Run": "text-[#4285F4]",
  "Hetzner Cloud": "text-[#D50C2D]",
  Koyeb: "text-white",
  Neon: "text-[#00E599]",
  Netlify: "text-[#00C7B7]",
  "Platform.sh": "text-white",
  Railway: "text-[#B066FF]",
  Render: "text-white",
  "Replit Deployments": "text-[#F26207]",
  "Scaleway Serverless Containers": "text-[#4F0599]",
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

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
import type { CSSProperties } from "react";

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
  "Akamai/Linode": "#009CDE",
  Appwrite: "#FD366E",
  "AWS Amplify": "#FF9900",
  "AWS App Runner": "#FF9900",
  "Azure App Service": "#0078D4",
  CapRover: "#2DD4BF",
  "Cloudflare Workers": "#F38020",
  Coolify: "#8B5CF6",
  Convex: "#EE342F",
  "Deno Deploy": "#FFFFFF",
  "DigitalOcean App Platform": "#0080FF",
  Dokku: "#3B82F6",
  "Firebase App Hosting": "#FFCA28",
  "Fly.io": "#8B5CF6",
  "Google Cloud Run": "#4285F4",
  Heroku: "#79589F",
  "Hetzner Cloud": "#D50C2D",
  Koyeb: "#00B4FF",
  Neon: "#00E599",
  Netlify: "#00C7B7",
  Northflank: "#00E0FF",
  "Oracle Cloud": "#C74634",
  "Platform.sh": "#F7C948",
  Railway: "#B066FF",
  Render: "#46E3B7",
  "Replit Deployments": "#F26207",
  "Scaleway Serverless Containers": "#A855F7",
  Supabase: "#3ECF8E",
  Vercel: "#FFFFFF",
};

const fallbackLabelByName: Record<string, string> = {
  "AWS Amplify": "AWS",
  "AWS App Runner": "AWS",
  "Azure App Service": "AZ",
  Dokku: "DK",
  Heroku: "HK",
  Northflank: "NF",
  "Oracle Cloud": "OCI",
};

const customAssetByName: Record<string, { alt: string; largeClassName: string; smallClassName: string; src: string }> = {
  "AWS Amplify": {
    alt: "AWS logo",
    largeClassName: "h-6 w-9",
    smallClassName: "h-4 w-6",
    src: "/provider-logos/aws.svg",
  },
  "AWS App Runner": {
    alt: "AWS logo",
    largeClassName: "h-6 w-9",
    smallClassName: "h-4 w-6",
    src: "/provider-logos/aws.svg",
  },
  Dokku: {
    alt: "Dokku logo",
    largeClassName: "h-7 w-8",
    smallClassName: "h-4 w-5",
    src: "/provider-logos/dokku.svg",
  },
};

export function getProviderTheme(name: string) {
  const accent = colorByName[name] ?? "#002fa7";
  const text = readableOnPaper(accent);

  return {
    accent,
    border: rgbaFromHex(accent, 0.5),
    background: rgbaFromHex(accent, 0.12),
    softBackground: rgbaFromHex(accent, 0.08),
    text,
    onAccent: shouldUseDarkText(accent) ? "#111827" : "#ffffff",
  };
}

export function ProviderLogo({ name, large = false }: { name: string; large?: boolean }) {
  const logo = logoByName[name as keyof typeof logoByName];
  const customAsset = customAssetByName[name];
  const size = large ? "h-11 w-11" : "h-7 w-7";
  const iconSize = large ? "h-6 w-6" : "h-4 w-4";
  const imageSize = customAsset ? large ? customAsset.largeClassName : customAsset.smallClassName : "";
  const fallbackTextSize = large ? "text-xs" : "text-[9px]";
  const fallbackLabel = fallbackLabelByName[name] ?? name.slice(0, 2).toUpperCase();
  const theme = getProviderTheme(name);
  const style = {
    color: theme.text,
  } as CSSProperties;

  return (
    <span className={`inline-flex shrink-0 items-center justify-center border-[3px] border-[var(--line)] bg-[var(--paper)] shadow-[4px_4px_0_var(--line)] ${size}`} style={style}>
      {customAsset ? (
        <span
          aria-label={customAsset.alt}
          className={`${imageSize} bg-contain bg-center bg-no-repeat`}
          role="img"
          style={{ backgroundImage: `url(${customAsset.src})` }}
        />
      ) : logo ? (
        <svg className={iconSize} role="img" aria-label={`${name} logo`} viewBox="0 0 24 24">
          <path fill="currentColor" d={logo.path} />
        </svg>
      ) : (
        <span
          role="img"
          aria-label={`${name} logo fallback`}
          className={`${fallbackTextSize} font-black leading-none tracking-normal`}
        >
          {fallbackLabel}
        </span>
      )}
    </span>
  );
}

function rgbaFromHex(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((character) => `${character}${character}`).join("") : normalized;
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function shouldUseDarkText(hex: string) {
  const accentLuminance = relativeLuminance(hex);
  const whiteContrast = contrastRatio(accentLuminance, relativeLuminance("#ffffff"));
  const darkContrast = contrastRatio(accentLuminance, relativeLuminance("#111827"));

  return darkContrast > whiteContrast;
}

function readableOnPaper(hex: string) {
  if (hex.toUpperCase() === "#FFFFFF") return "#111111";
  const paperLuminance = relativeLuminance("#fff7de");
  let candidate = hex;

  for (let step = 0; step < 8; step += 1) {
    if (contrastRatio(relativeLuminance(candidate), paperLuminance) >= 3) return candidate;
    candidate = mixWithBlack(candidate, 0.18);
  }

  return "#111111";
}

function mixWithBlack(hex: string, amount: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((character) => `${character}${character}`).join("") : normalized;
  const red = Math.round(parseInt(value.slice(0, 2), 16) * (1 - amount));
  const green = Math.round(parseInt(value.slice(2, 4), 16) * (1 - amount));
  const blue = Math.round(parseInt(value.slice(4, 6), 16) * (1 - amount));

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function toHex(value: number) {
  return value.toString(16).padStart(2, "0");
}

function relativeLuminance(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((character) => `${character}${character}`).join("") : normalized;
  const red = toLinearRgb(parseInt(value.slice(0, 2), 16));
  const green = toLinearRgb(parseInt(value.slice(2, 4), 16));
  const blue = toLinearRgb(parseInt(value.slice(4, 6), 16));

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function toLinearRgb(value: number) {
  const channel = value / 255;

  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function contrastRatio(firstLuminance: number, secondLuminance: number) {
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

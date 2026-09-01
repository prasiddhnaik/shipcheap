"use client";

import Image from "next/image";
import { useState } from "react";

export function ProviderAssetImage({
  alt,
  className,
  fallbackClassName,
  fallbackLabel,
  name,
  src,
}: {
  alt: string;
  className: string;
  fallbackClassName: string;
  fallbackLabel: string;
  name: string;
  src: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={`${name} logo fallback`}
        className={`${fallbackClassName} font-black leading-none tracking-normal`}
      >
        {fallbackLabel}
      </span>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      height={56}
      onError={() => setFailed(true)}
      src={src}
      unoptimized
      width={56}
    />
  );
}

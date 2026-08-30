import React from "react";

// Vector copy of `shipcheap logo.svg` so it can be animated and recoloured.
export const ShipCheapMark: React.FC<{ size: number }> = ({ size }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="4.5" y="4.5" width="39" height="39" rx="9" fill="#101827" stroke="#111111" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="13.25" stroke="#FFFFFF" strokeOpacity=".16" strokeWidth="1.5" />
      <path
        d="M24 10.75V14.25M24 33.75V37.25M10.75 24H14.25M33.75 24H37.25"
        stroke="#FFFFFF"
        strokeOpacity=".22"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M13 31L20 24L26.5 28L35 16" stroke="#55D7FF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="31" r="3.25" fill="#101827" stroke="#55D7FF" strokeWidth="2.4" />
      <circle cx="20" cy="24" r="3" fill="#55D7FF" />
      <circle cx="26.5" cy="28" r="2.7" fill="#FFFFFF" />
      <path d="M35 11.6L40.4 17L35 22.4L29.6 17L35 11.6Z" fill="#F5C84B" />
      <path
        d="M32.9 17.25L34.45 18.8L37.25 15.45"
        stroke="#101827"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

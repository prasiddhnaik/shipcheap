import React, { CSSProperties } from "react";

/**
 * A neo-brutalist card turned into a real extruded solid.
 *
 * The extrusion is a stack of silhouette copies pushed back along Z, which
 * keeps the solid content-sized (no width/height needed) and works with
 * rounded corners. The black sides read as ShipCheap's hard offset shadow
 * promoted into actual depth.
 */
export const Slab3D: React.FC<{
  /** Total extrusion depth in px. */
  depth: number;
  /** Number of silhouette copies. More = smoother sides, slower to render. */
  layers?: number;
  /** Must match the front face's borderRadius. */
  radius?: number;
  /** Colour of the extruded sides. */
  sideColor?: string;
  /** Styles for the visible front face (background, border, padding, type). */
  faceStyle: CSSProperties;
  /** Animation / placement styles for the whole solid. */
  style?: CSSProperties;
  children?: React.ReactNode;
}> = ({ depth, layers = 14, radius = 0, sideColor = "#111111", faceStyle, style, children }) => {
  const step = depth / layers;

  return (
    <div style={{ position: "relative", transformStyle: "preserve-3d", ...style }}>
      {Array.from({ length: layers }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateZ(${-(i + 1) * step}px)`,
            backgroundColor: sideColor,
            borderRadius: radius,
          }}
        />
      ))}
      <div style={{ position: "relative", ...faceStyle }}>{children}</div>
    </div>
  );
};

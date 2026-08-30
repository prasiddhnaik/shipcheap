import React, { CSSProperties } from "react";

/**
 * Establishes a perspective camera space. `transform` is the camera move
 * (dolly / tilt / orbit) and should be driven by `useCurrentFrame()`.
 *
 * Nothing between the perspective root and a `Slab3D` may set `overflow`,
 * `filter` or `opacity` below 1, or the browser flattens the 3D context.
 */
export const Stage3D: React.FC<{
  perspective: number;
  transform: string;
  style?: CSSProperties;
  children: React.ReactNode;
}> = ({ perspective, transform, style, children }) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        perspective,
        perspectiveOrigin: "50% 50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transform,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Positions a child at a depth in the stage without giving it a body. */
export const Layer3D: React.FC<{
  z: number;
  style?: CSSProperties;
  children: React.ReactNode;
}> = ({ z, style, children }) => {
  return (
    <div
      style={{
        transformStyle: "preserve-3d",
        transform: `translateZ(${z}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

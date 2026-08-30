import React from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "../LayoutContext";
import { geist, geistMono } from "./fonts";
import { ShipCheapMark } from "./ShipCheapMark";
import { Slab3D } from "./three-d/Slab3D";
import { Layer3D, Stage3D } from "./three-d/Stage3D";

export const Scene03Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { padding, fontScale, chrome, isPortrait } = useLayout();

  return (
    <AbsoluteFill name="Scene 3 — ShipCheap reveal" style={{ backgroundColor: "#fff7de", fontFamily: geist }}>
      <Stage3D
        perspective={1800}
        transform={`translateZ(${interpolate(frame, [0, 105], [-180, 40], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px) rotateX(${interpolate(frame, [0, 105], [5, -1.5], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}deg)`}
        style={{ paddingLeft: padding, paddingRight: padding, textAlign: "center" }}
      >
        {/* The flat mark on an extruded tile: depth describes the card, not the logo. */}
        <Slab3D
          depth={40 * chrome}
          layers={16}
          radius={26}
          style={{
            marginBottom: 48 * chrome,
            transform: `rotateY(${interpolate(frame, [0, 105], [-16, -7], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}deg)`,
            scale: interpolate(frame, [0, 0.85 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 13, mass: 0.7 }),
              output: "perceptual-scale",
            }),
          }}
          faceStyle={{
            backgroundColor: "#002fa7",
            border: `${6 * chrome}px solid #111111`,
            borderRadius: 26,
            padding: 30 * chrome,
            display: "flex",
          }}
        >
          <ShipCheapMark size={isPortrait ? 118 : 152} />
        </Slab3D>

        <Interactive.Div
          name="Wordmark"
          style={{
            fontSize: 168 * fontScale,
            fontWeight: 900,
            letterSpacing: "-0.058em",
            color: "#111111",
            lineHeight: 1,
            opacity: interpolate(frame, [0.45 * fps, 1 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [0.45 * fps, 1.1 * fps], ["0px 44px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          ShipCheap
        </Interactive.Div>

        <Layer3D z={90}>
          <Slab3D
            depth={34 * chrome}
            layers={14}
            sideColor="#8a6c00"
            style={{
              marginTop: 40 * chrome,
              // Yawed so the extruded wall of the tagline slab stays visible.
              transform: "rotateY(-9deg)",
              opacity: interpolate(frame, [1 * fps, 1.6 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              translate: interpolate(frame, [1 * fps, 1.7 * fps], ["0px 48px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
            faceStyle={{
              backgroundColor: "#ffcf24",
              border: `${6 * chrome}px solid #111111`,
              padding: `${20 * chrome}px ${38 * chrome}px`,
              fontFamily: geistMono,
              fontSize: 50 * fontScale,
              fontWeight: 700,
              color: "#111111",
              letterSpacing: "-0.025em",
              maxWidth: 1500 * fontScale,
              textWrap: "balance",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            Backend hosting without billing jumpscares.
          </Slab3D>
        </Layer3D>
      </Stage3D>
    </AbsoluteFill>
  );
};

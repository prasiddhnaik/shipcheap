import React from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "../LayoutContext";
import { geist, geistMono } from "./fonts";
import { ShipCheapMark } from "./ShipCheapMark";
import { Slab3D } from "./three-d/Slab3D";
import { Layer3D, Stage3D } from "./three-d/Stage3D";

export const Scene08CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { padding, fontScale, chrome, isPortrait } = useLayout();

  return (
    <AbsoluteFill name="Scene 8 — Call to action" style={{ backgroundColor: "#fff7de", fontFamily: geist }}>
      <Stage3D
        perspective={1600}
        transform={`translateZ(${interpolate(frame, [0, 130], [-160, 50], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px) rotateX(${interpolate(frame, [0, 130], [6, -1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}deg)`}
        style={{ paddingLeft: padding, paddingRight: padding, textAlign: "center" }}
      >
        <Interactive.Div
          name="CTA lockup"
          style={{
            transformStyle: "preserve-3d",
            display: "flex",
            alignItems: "center",
            gap: 28 * chrome,
            marginBottom: 44 * chrome,
            opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            scale: interpolate(frame, [0, 0.8 * fps], [0.82, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 15, mass: 0.6 }),
              output: "perceptual-scale",
            }),
          }}
        >
          <Slab3D
            depth={30 * chrome}
            layers={12}
            radius={20}
            style={{ transform: "rotateY(-11deg)" }}
            faceStyle={{
              backgroundColor: "#002fa7",
              border: `${5 * chrome}px solid #111111`,
              borderRadius: 20,
              padding: 20 * chrome,
              display: "flex",
            }}
          >
            <ShipCheapMark size={isPortrait ? 82 : 100} />
          </Slab3D>
          <span style={{ fontSize: 122 * fontScale, fontWeight: 900, letterSpacing: "-0.055em", color: "#111111" }}>ShipCheap</span>
        </Interactive.Div>

        <Layer3D z={60}>
          <Interactive.Div
            name="CTA line"
            style={{
              fontSize: 70 * fontScale,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#111111",
              lineHeight: 1.12,
              maxWidth: 1450 * fontScale,
              textWrap: "balance",
              opacity: interpolate(frame, [0.6 * fps, 1.2 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              translate: interpolate(frame, [0.6 * fps, 1.3 * fps], ["0px 40px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          >
            Compare free tiers. Model the risk. Then deploy.
          </Interactive.Div>
        </Layer3D>

        <Slab3D
          depth={40 * chrome}
          layers={16}
          sideColor="#8a6c00"
          style={{
            marginTop: 42 * chrome,
            transform: `translateZ(150px) rotateY(${interpolate(frame, [1.3 * fps, 130], [-14, -5], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}deg)`,
            opacity: interpolate(frame, [1.3 * fps, 1.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            scale: interpolate(frame, [1.3 * fps, 2.1 * fps], [0.72, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 13, mass: 0.55 }),
              output: "perceptual-scale",
            }),
          }}
          faceStyle={{
            backgroundColor: "#ffcf24",
            border: `${6 * chrome}px solid #111111`,
            padding: `${24 * chrome}px ${52 * chrome}px`,
            fontFamily: geistMono,
            fontSize: 56 * fontScale,
            fontWeight: 700,
            color: "#111111",
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}
        >
          shipcheap.vercel.app
        </Slab3D>

        <Layer3D z={190}>
          <Interactive.Div
            name="CTA footnote"
            style={{
              marginTop: 34 * chrome,
              fontFamily: geistMono,
              fontSize: 28 * fontScale,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#5b584e",
              opacity: interpolate(frame, [2 * fps, 2.5 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          >
            No account · No card · Shareable links
          </Interactive.Div>
        </Layer3D>
      </Stage3D>
    </AbsoluteFill>
  );
};

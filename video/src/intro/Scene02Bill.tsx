import React from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "../LayoutContext";
import { geist, geistMono } from "./fonts";
import { Slab3D } from "./three-d/Slab3D";
import { Layer3D, Stage3D } from "./three-d/Stage3D";

export const Scene02Bill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { padding, fontScale, chrome } = useLayout();

  // Counter value drives text content; style props keep their interpolate() inline.
  const billed = interpolate(frame, [0.35 * fps, 2.5 * fps], [0, 1694], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 1, 0.32, 1),
  });

  return (
    <AbsoluteFill name="Scene 2 — The bill" style={{ backgroundColor: "#111111", fontFamily: geist }}>
      <Stage3D
        perspective={1600}
        transform={`translateZ(${interpolate(frame, [0, 120], [-320, 90], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px) rotateX(${interpolate(frame, [0, 120], [-9, 3], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}deg)`}
        style={{ paddingLeft: padding, paddingRight: padding, textAlign: "center" }}
      >
        <Slab3D
          depth={94 * chrome}
          layers={26}
          sideColor="#a82330"
          style={{
            // Yawed off-axis so the extruded side wall stays visible.
            transform: `rotateY(${interpolate(frame, [0, 120], [-25, -11], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}deg)`,
            scale: interpolate(frame, [0, 0.7 * fps], [0.72, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 15, mass: 0.6 }),
              output: "perceptual-scale",
            }),
          }}
          faceStyle={{
            backgroundColor: "#ff4b5f",
            border: `${6 * chrome}px solid #fff7de`,
            padding: `${52 * chrome}px ${84 * chrome}px`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Interactive.Div
            name="Bill label"
            style={{
              fontFamily: geistMono,
              fontSize: 34 * fontScale,
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "#111111",
              textTransform: "uppercase",
            }}
          >
            Monthly bill · simulated
          </Interactive.Div>
          <Interactive.Div
            name="Bill amount"
            style={{
              fontFamily: geistMono,
              fontSize: 226 * fontScale,
              fontWeight: 700,
              letterSpacing: "-0.055em",
              color: "#ffffff",
              lineHeight: 1.02,
              marginTop: 10 * chrome,
            }}
          >
            ${billed.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </Interactive.Div>
        </Slab3D>

        <Layer3D z={150}>
          <Interactive.Div
            name="Bill caption"
            style={{
              marginTop: 62 * chrome,
              fontSize: 66 * fontScale,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#fff7de",
              maxWidth: 1400 * fontScale,
              textWrap: "balance",
              lineHeight: 1.15,
              opacity: interpolate(frame, [2.5 * fps, 3.1 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              translate: interpolate(frame, [2.5 * fps, 3.3 * fps], ["0px 40px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          >
            Nobody warned you.
          </Interactive.Div>
        </Layer3D>
      </Stage3D>
    </AbsoluteFill>
  );
};

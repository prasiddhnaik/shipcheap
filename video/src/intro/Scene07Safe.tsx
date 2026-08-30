import { ShieldCheck } from "lucide-react";
import React from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "../LayoutContext";
import { geist, geistMono } from "./fonts";
import { Slab3D } from "./three-d/Slab3D";
import { Layer3D, Stage3D } from "./three-d/Stage3D";

export const Scene07Safe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { padding, fontScale, chrome } = useLayout();

  return (
    <AbsoluteFill name="Scene 7 — Safe result" style={{ backgroundColor: "#18b869", fontFamily: geist }}>
      <Stage3D
        perspective={1500}
        transform={`translateZ(${interpolate(frame, [0, 124], [-230, 70], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px) rotateX(${interpolate(frame, [0, 124], [8, -2], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}deg)`}
        style={{ paddingLeft: padding, paddingRight: padding, textAlign: "center" }}
      >
        <Layer3D z={-60}>
          <Slab3D
            depth={20 * chrome}
            layers={9}
            sideColor="#0a6b3d"
            style={{
              marginBottom: 50 * chrome,
              transform: "rotateY(-6deg)",
              opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
            faceStyle={{
              display: "flex",
              alignItems: "center",
              gap: 16 * chrome,
              backgroundColor: "#111111",
              border: `${5 * chrome}px solid #111111`,
              padding: `${14 * chrome}px ${28 * chrome}px`,
              fontFamily: geistMono,
              fontSize: 32 * fontScale,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            <ShieldCheck size={34 * fontScale} strokeWidth={2.8} />
            Koyeb · hard spend cap on
          </Slab3D>
        </Layer3D>

        <Interactive.Div
          name="Safe amount"
          style={{
            fontFamily: geistMono,
            fontSize: 268 * fontScale,
            fontWeight: 700,
            letterSpacing: "-0.055em",
            color: "#111111",
            lineHeight: 1,
            scale: interpolate(frame, [0.3 * fps, 1.1 * fps], [0.6, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 13, mass: 0.6 }),
              output: "perceptual-scale",
            }),
            rotate: interpolate(frame, [0.3 * fps, 124], ["-4deg", "0deg"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          $0
        </Interactive.Div>

        <Layer3D z={120}>
          <Interactive.Div
            name="Safe caption"
            style={{
              marginTop: 40 * chrome,
              fontSize: 62 * fontScale,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#111111",
              maxWidth: 1500 * fontScale,
              textWrap: "balance",
              lineHeight: 1.14,
              opacity: interpolate(frame, [1.2 * fps, 1.8 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              translate: interpolate(frame, [1.2 * fps, 2 * fps], ["0px 36px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          >
            Same app. Most simulated months stay near $0.
          </Interactive.Div>
        </Layer3D>
      </Stage3D>
    </AbsoluteFill>
  );
};

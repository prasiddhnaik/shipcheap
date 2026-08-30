import React from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "../LayoutContext";
import { geist, geistMono } from "./fonts";

/** Pure type, so this scene stays flat — there is no solid here for depth to describe. */
export const Scene01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { padding, fontScale, chrome } = useLayout();

  return (
    <AbsoluteFill
      name="Scene 1 — Hook"
      style={{
        backgroundColor: "#fff7de",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontFamily: geist,
        padding,
      }}
    >
      <Interactive.Div
        name="Eyebrow"
        style={{
          fontFamily: geistMono,
          fontSize: 30 * fontScale,
          fontWeight: 700,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "#5b584e",
          marginBottom: 32 * chrome,
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Friday, 11:40 pm
      </Interactive.Div>

      <Interactive.Div
        name="Hook line"
        style={{
          fontSize: 112 * fontScale,
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: "#111111",
          lineHeight: 1.04,
          maxWidth: 1450 * fontScale,
          textWrap: "balance",
          opacity: interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0.2 * fps, 1 * fps], ["0px 56px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        You deployed a small side project.
      </Interactive.Div>

      <Interactive.Div
        name="Hook subline"
        style={{
          marginTop: 44 * chrome,
          fontSize: 52 * fontScale,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#5b584e",
          opacity: interpolate(frame, [1.1 * fps, 1.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [1.1 * fps, 1.9 * fps], ["0px 34px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Free tier. Should be fine.
      </Interactive.Div>
    </AbsoluteFill>
  );
};

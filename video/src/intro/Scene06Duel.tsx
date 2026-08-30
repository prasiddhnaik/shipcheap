import React from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "../LayoutContext";
import { geist, geistMono } from "./fonts";
import { DUEL_BARS, DuelChart3D, duelLabelPadding } from "./three-d/DuelChart3D";

/** Value + name label sitting above/below its 3D column. */
const ColumnLabel: React.FC<{ name: string; p90: number; index: number }> = ({ name, p90, index }) => {
  const frame = useCurrentFrame();
  const { fontScale, chrome } = useLayout();
  const delay = 14 + index * 7;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: interpolate(frame, [delay + 12, delay + 26], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      <div
        style={{
          fontFamily: geistMono,
          fontSize: 34 * fontScale,
          fontWeight: 700,
          color: "#111111",
          backgroundColor: "#fff7de",
          border: `${4 * chrome}px solid #111111`,
          boxShadow: `${5 * chrome}px ${5 * chrome}px 0 #111111`,
          padding: `${5 * chrome}px ${13 * chrome}px`,
          whiteSpace: "nowrap",
        }}
      >
        ${p90.toLocaleString("en-US")}
      </div>
      <div
        style={{
          marginTop: 10 * chrome,
          fontSize: 34 * fontScale,
          fontWeight: 900,
          letterSpacing: "-0.02em",
          color: "#111111",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </div>
  );
};

export const Scene06Duel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, padding, fontScale, chrome, isPortrait } = useLayout();

  return (
    <AbsoluteFill
      name="Scene 6 — Bill duel"
      style={{
        backgroundColor: "#fff7de",
        fontFamily: geist,
      }}
    >
      {/* Hero beat: real 3D columns on a floor plane, with a slow orbit. */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <DuelChart3D width={width} height={height} isPortrait={isPortrait} />
      </div>

      {/* Value + name labels ride above the columns; even spacing matches the 3D layout. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: isPortrait ? "63%" : "63%",
          display: "flex",
          // Matches the projected column centres, so labels sit under their bars.
          paddingLeft: duelLabelPadding(isPortrait, width, height),
          paddingRight: duelLabelPadding(isPortrait, width, height),
        }}
      >
        {DUEL_BARS.map((b, i) => (
          <ColumnLabel key={b.name} name={b.name} p90={b.p90} index={i} />
        ))}
      </div>

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "center",
          paddingTop: isPortrait ? 220 : padding,
          paddingLeft: padding,
          paddingRight: padding,
        }}
      >
        <Interactive.Div
          name="Duel headline"
          style={{
            fontSize: 88 * fontScale,
            fontWeight: 900,
            letterSpacing: "-0.045em",
            color: "#111111",
            lineHeight: 1.06,
            maxWidth: 1550 * fontScale,
            textWrap: "balance",
            opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(frame, [0, 0.6 * fps], ["0px 36px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Then simulate the bad month.
        </Interactive.Div>

        <Interactive.Div
          name="Duel subhead"
          style={{
            marginTop: 16 * chrome,
            fontFamily: geistMono,
            fontSize: 28 * fontScale,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#5b584e",
            maxWidth: 1300 * fontScale,
            textWrap: "balance",
            opacity: interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          P90 across 1,000 simulated months · traffic spike, no spend cap
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

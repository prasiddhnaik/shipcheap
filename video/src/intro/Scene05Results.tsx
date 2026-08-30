import React from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "../LayoutContext";
import { BrowserMockup } from "./BrowserMockup";
import { geist, geistMono } from "./fonts";
import { Slab3D } from "./three-d/Slab3D";
import { Layer3D, Stage3D } from "./three-d/Stage3D";

/** Real output of `recommendPlatforms()` for a free, no-card, Postgres, always-on, EU, low-risk Node app. */
const ResultRow: React.FC<{
  rank: number;
  name: string;
  score: number;
  fill: string;
  tags: string[];
  delay: number;
}> = ({ rank, name, score, fill, tags, delay }) => {
  const frame = useCurrentFrame();
  const { fontScale, chrome, isPortrait } = useLayout();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22 * chrome,
        backgroundColor: "#fff7de",
        border: `${5 * chrome}px solid #111111`,
        boxShadow: `${8 * chrome}px ${8 * chrome}px 0 #111111`,
        padding: `${16 * chrome}px ${24 * chrome}px`,
        marginBottom: 18 * chrome,
        opacity: interpolate(frame, [delay, delay + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: interpolate(frame, [delay, delay + 16], ["70px 0px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      <div
        style={{
          width: 62 * chrome,
          height: 62 * chrome,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#002fa7",
          border: `${4 * chrome}px solid #111111`,
          color: "#ffffff",
          fontFamily: geistMono,
          fontSize: 34 * fontScale,
          fontWeight: 700,
        }}
      >
        {rank}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 * chrome, flexWrap: "wrap" }}>
          <span style={{ fontSize: 46 * fontScale, fontWeight: 900, letterSpacing: "-0.03em", color: "#111111" }}>{name}</span>
          <span style={{ fontFamily: geistMono, fontSize: 27 * fontScale, fontWeight: 700, color: "#5b584e" }}>Score {score}</span>
        </div>

        <div
          style={{
            marginTop: 12 * chrome,
            height: 20 * chrome,
            backgroundColor: "#ffffff",
            border: `${4 * chrome}px solid #111111`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: fill,
              width: interpolate(frame, [delay + 8, delay + 30], ["0%", `${Math.round((score / 160) * 100)}%`], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 * chrome, marginTop: 14 * chrome, flexWrap: "wrap" }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: geistMono,
                fontSize: 24 * fontScale,
                fontWeight: 700,
                color: "#111111",
                backgroundColor: "#ffffff",
                border: `${3 * chrome}px solid #111111`,
                padding: `${5 * chrome}px ${12 * chrome}px`,
                whiteSpace: "nowrap",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {!isPortrait && rank === 1 ? (
        <div
          style={{
            flexShrink: 0,
            backgroundColor: "#18b869",
            border: `${4 * chrome}px solid #111111`,
            padding: `${10 * chrome}px ${20 * chrome}px`,
            fontFamily: geistMono,
            fontSize: 26 * fontScale,
            fontWeight: 700,
            color: "#111111",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Best fit
        </div>
      ) : null}
    </div>
  );
};

export const Scene05Results: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { padding, fontScale, chrome, isPortrait } = useLayout();

  return (
    <AbsoluteFill name="Scene 5 — Ranked results" style={{ backgroundColor: "#fff7de", fontFamily: geist }}>
      <Stage3D
        perspective={2200}
        transform={`translateZ(${interpolate(frame, [0, 150], [-240, 20], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px) rotateX(${interpolate(frame, [0, 150], [8, 4], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}deg)`}
        style={{ paddingLeft: padding, paddingRight: padding, textAlign: "center" }}
      >
        <Layer3D z={50}>
          <Interactive.Div
            name="Results headline"
            style={{
              fontSize: 76 * fontScale,
              fontWeight: 900,
              letterSpacing: "-0.045em",
              color: "#111111",
              lineHeight: 1.06,
              maxWidth: 1500 * fontScale,
              textWrap: "balance",
              marginBottom: 34 * chrome,
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
            Get ranked picks, with the reasons.
          </Interactive.Div>
        </Layer3D>

        {/* The whole app window is one extruded solid, orbiting under the camera. */}
        <Slab3D
          depth={70 * chrome}
          layers={20}
          radius={10}
          style={{
            width: isPortrait ? "100%" : "56%",
            textAlign: "left",
            transform: `rotateY(${interpolate(frame, [0, 150], [-19, -11], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}deg)`,
          }}
          faceStyle={{}}
        >
          <BrowserMockup url="shipcheap.vercel.app  ·  ranked for your constraints" shadow={false}>
            <ResultRow rank={1} name="Koyeb" score={160} fill="#18b869" tags={["Free tier", "No card", "Low risk"]} delay={16} />
            <ResultRow rank={2} name="CapRover" score={138} fill="#002fa7" tags={["Self-hosted", "No card"]} delay={30} />
            <ResultRow rank={3} name="Coolify" score={138} fill="#002fa7" tags={["Self-hosted", "No card"]} delay={44} />
          </BrowserMockup>
        </Slab3D>
      </Stage3D>
    </AbsoluteFill>
  );
};

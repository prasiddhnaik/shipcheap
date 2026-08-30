import { Clock, CreditCard, Database, Globe2, PiggyBank, ShieldCheck, Terminal } from "lucide-react";
import React from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useLayout } from "../LayoutContext";
import { geist } from "./fonts";
import { Slab3D } from "./three-d/Slab3D";
import { Layer3D, Stage3D } from "./three-d/Stage3D";

/** Each chip is an extruded solid, yawed and pushed to its own depth. */
const Chip: React.FC<{
  label: string;
  icon: React.ReactNode;
  background: string;
  delay: number;
  z: number;
  yaw: number;
}> = ({ label, icon, background, delay, z, yaw }) => {
  const frame = useCurrentFrame();
  const { fontScale, chrome } = useLayout();

  return (
    <Slab3D
      depth={26 * chrome}
      layers={11}
      style={{
        transform: `translateZ(${z}px) rotateY(${yaw}deg)`,
        opacity: interpolate(frame, [delay, delay + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        scale: interpolate(frame, [delay, delay + 14], [0.6, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.spring({ damping: 14, mass: 0.5 }),
          output: "perceptual-scale",
        }),
      }}
      faceStyle={{
        display: "flex",
        alignItems: "center",
        gap: 16 * chrome,
        backgroundColor: background,
        border: `${5 * chrome}px solid #111111`,
        padding: `${16 * chrome}px ${30 * chrome}px`,
        fontSize: 44 * fontScale,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: "#111111",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
    </Slab3D>
  );
};

export const Scene04Constraints: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { padding, fontScale, chrome, isPortrait } = useLayout();
  const iconSize = 44 * fontScale;

  return (
    <AbsoluteFill name="Scene 4 — Your constraints" style={{ backgroundColor: "#fff7de", fontFamily: geist }}>
      <Stage3D
        perspective={1700}
        transform={`translateZ(${interpolate(frame, [0, 125], [-200, 30], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px) rotateY(${interpolate(frame, [0, 125], [-8, 5], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}deg) rotateX(${interpolate(frame, [0, 125], [6, -2], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}deg)`}
        style={{ paddingLeft: padding, paddingRight: padding, textAlign: "center" }}
      >
        <Layer3D z={-90}>
          <Interactive.Div
            name="Constraints headline"
            style={{
              fontSize: 96 * fontScale,
              fontWeight: 900,
              letterSpacing: "-0.045em",
              color: "#111111",
              lineHeight: 1.06,
              maxWidth: 1500 * fontScale,
              textWrap: "balance",
              marginBottom: 62 * chrome,
              opacity: interpolate(frame, [0, 0.55 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              translate: interpolate(frame, [0, 0.65 * fps], ["0px 40px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          >
            Start with your real constraints.
          </Interactive.Div>
        </Layer3D>

        <div
          style={{
            transformStyle: "preserve-3d",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: isPortrait ? 26 : 30,
            maxWidth: isPortrait ? "100%" : 1520,
          }}
        >
          <Chip label="Node.js API" icon={<Terminal size={iconSize} strokeWidth={2.6} />} background="#ffffff" delay={14} z={40} yaw={-7} />
          <Chip label="$0 / month" icon={<PiggyBank size={iconSize} strokeWidth={2.6} />} background="#ffcf24" delay={22} z={120} yaw={5} />
          <Chip label="Postgres" icon={<Database size={iconSize} strokeWidth={2.6} />} background="#ffffff" delay={30} z={0} yaw={-4} />
          <Chip label="Always-on" icon={<Clock size={iconSize} strokeWidth={2.6} />} background="#ffffff" delay={38} z={80} yaw={6} />
          <Chip label="Europe" icon={<Globe2 size={iconSize} strokeWidth={2.6} />} background="#ffffff" delay={46} z={20} yaw={-6} />
          <Chip label="No credit card" icon={<CreditCard size={iconSize} strokeWidth={2.6} />} background="#18b869" delay={54} z={150} yaw={4} />
          <Chip label="Low billing risk" icon={<ShieldCheck size={iconSize} strokeWidth={2.6} />} background="#18b869" delay={62} z={60} yaw={-5} />
        </div>
      </Stage3D>
    </AbsoluteFill>
  );
};

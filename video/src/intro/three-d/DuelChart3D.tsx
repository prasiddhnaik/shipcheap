import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

/**
 * Real 3D columns for the bill duel. Values are the P90 output of
 * `simulateMonthlyBill()` under spike traffic with no spend cap.
 */
export const DUEL_BARS = [
  { name: "Railway", p90: 1694, color: "#ff4b5f" },
  { name: "Fly.io", p90: 1402, color: "#ff4b5f" },
  { name: "Render", p90: 1240, color: "#ff6470" },
  { name: "Vercel", p90: 1095, color: "#ffcf24" },
  { name: "Koyeb", p90: 741, color: "#18b869" },
] as const;

const MAX = 1694;
const FOV = 42;

/**
 * A 9:16 frame has a far narrower horizontal field of view than 16:9, so the
 * columns need their own spacing and camera distance per format.
 */
export const duelGeometry = (isPortrait: boolean) =>
  isPortrait
    ? { spacing: 0.82, barW: 0.5, maxH: 2.5, distance: 11, camY: 1.5, groupY: -1.15 }
    : { spacing: 1.28, barW: 0.78, maxH: 3.05, distance: 7.9, camY: 1.45, groupY: -1.62 };

/**
 * Horizontal padding that makes an evenly-flexed CSS label row line up with
 * the projected column centres, so the labels need no projection math.
 */
export const duelLabelPadding = (isPortrait: boolean, width: number, height: number) => {
  const g = duelGeometry(isPortrait);
  const visibleHeight = 2 * g.distance * Math.tan(((FOV / 2) * Math.PI) / 180);
  const visibleWidth = visibleHeight * (width / height);
  const slot = (g.spacing / visibleWidth) * width;
  return Math.max((width - slot * DUEL_BARS.length) / 2, 24);
};

const Column: React.FC<{ index: number; p90: number; color: string; isPortrait: boolean }> = ({
  index,
  p90,
  color,
  isPortrait,
}) => {
  const frame = useCurrentFrame();
  const g = duelGeometry(isPortrait);
  const delay = 14 + index * 7;

  const grow = interpolate(frame, [delay, delay + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const h = Math.max((p90 / MAX) * g.maxH * grow, 0.001);
  const x = (index - (DUEL_BARS.length - 1) / 2) * g.spacing;

  return (
    <group position={[x, 0, 0]}>
      {/* Growing column */}
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[g.barW, h, g.barW]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.08} />
      </mesh>
      {/* Dark base plinth, so every column reads as seated on the floor */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[g.barW + 0.1, 0.07, g.barW + 0.1]} />
        <meshStandardMaterial color="#111111" roughness={0.6} />
      </mesh>
    </group>
  );
};

const Scene: React.FC<{ isPortrait: boolean }> = ({ isPortrait }) => {
  const frame = useCurrentFrame();
  const g = duelGeometry(isPortrait);

  // Gentle orbit so the columns read as solid, never enough to spin the frame
  // or pull the labels off their columns.
  const orbit = interpolate(frame, [0, 150], [-0.16, 0.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <group rotation={[0.16, orbit, 0]} position={[0, g.groupY, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[44, 26]} />
        {/* Unlit, so the floor stays the exact paper tone and no horizon line appears. */}
        <meshBasicMaterial color="#f7ecd2" toneMapped={false} />
      </mesh>
      {DUEL_BARS.map((b, i) => (
        <Column key={b.name} index={i} p90={b.p90} color={b.color} isPortrait={isPortrait} />
      ))}
    </group>
  );
};

export const DuelChart3D: React.FC<{ width: number; height: number; isPortrait: boolean }> = ({
  width,
  height,
  isPortrait,
}) => {
  const g = duelGeometry(isPortrait);
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [0, g.camY, g.distance], fov: FOV }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 8, 6]} intensity={2.2} />
      <directionalLight position={[-6, 3, 2]} intensity={0.55} color="#ffd76b" />
      <Scene isPortrait={isPortrait} />
    </ThreeCanvas>
  );
};

import React from "react";
import { useLayout } from "../LayoutContext";

/** Neo-brutalist browser chrome with a subtle 3D tilt, matching the ShipCheap app shell. */
export const BrowserMockup: React.FC<{
  url: string;
  /** Omit when the surrounding 3D stage already supplies the tilt. */
  transform?: string;
  /** Drop the flat offset shadow when the mockup is extruded as a 3D solid. */
  shadow?: boolean;
  children: React.ReactNode;
}> = ({ url, transform, shadow = true, children }) => {
  const { chrome, fontScale } = useLayout();

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#ffffff",
        border: `${6 * chrome}px solid #111111`,
        boxShadow: shadow ? `${18 * chrome}px ${18 * chrome}px 0 #111111` : undefined,
        borderRadius: 10,
        overflow: "hidden",
        transform,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14 * chrome,
          padding: `${16 * chrome}px ${22 * chrome}px`,
          backgroundColor: "#ffcf24",
          borderBottom: `${6 * chrome}px solid #111111`,
        }}
      >
        <div style={{ width: 20 * chrome, height: 20 * chrome, borderRadius: 999, backgroundColor: "#ff4b5f", border: `${3 * chrome}px solid #111111` }} />
        <div style={{ width: 20 * chrome, height: 20 * chrome, borderRadius: 999, backgroundColor: "#ffffff", border: `${3 * chrome}px solid #111111` }} />
        <div style={{ width: 20 * chrome, height: 20 * chrome, borderRadius: 999, backgroundColor: "#18b869", border: `${3 * chrome}px solid #111111` }} />
        <div
          style={{
            marginLeft: 18 * chrome,
            flex: 1,
            backgroundColor: "#ffffff",
            border: `${3 * chrome}px solid #111111`,
            borderRadius: 6,
            padding: `${7 * chrome}px ${16 * chrome}px`,
            fontSize: 26 * fontScale,
            fontWeight: 700,
            color: "#5b584e",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {url}
        </div>
      </div>
      <div style={{ padding: 34 * chrome }}>{children}</div>
    </div>
  );
};

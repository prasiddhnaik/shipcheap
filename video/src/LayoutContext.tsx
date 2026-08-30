import React, { createContext, useContext } from "react";

interface LayoutInfo {
  width: number;
  height: number;
  isPortrait: boolean;
  /** Padding from the frame edges. */
  padding: number;
  /** Multiplier applied to every landscape-designed font size. */
  fontScale: number;
  /** Multiplier for the neo-brutalist border + hard shadow offsets. */
  chrome: number;
}

const LayoutContext = createContext<LayoutInfo>({
  width: 1920,
  height: 1080,
  isPortrait: false,
  padding: 110,
  fontScale: 1,
  chrome: 1,
});

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{
  width: number;
  height: number;
  children: React.ReactNode;
}> = ({ width, height, children }) => {
  const isPortrait = height > width;
  return (
    <LayoutContext.Provider
      value={{
        width,
        height,
        isPortrait,
        padding: isPortrait ? 60 : 110,
        fontScale: isPortrait ? 1 : 1,
        chrome: isPortrait ? 1.3 : 1,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

import React from "react";
import { LayoutProvider } from "./LayoutContext";
import { IntroScenes } from "./Scenes";

export const IntroLandscape: React.FC = () => (
  <LayoutProvider width={1920} height={1080}>
    <IntroScenes />
  </LayoutProvider>
);

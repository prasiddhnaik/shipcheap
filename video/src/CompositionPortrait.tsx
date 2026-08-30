import React from "react";
import { LayoutProvider } from "./LayoutContext";
import { IntroScenes } from "./Scenes";

export const IntroPortrait: React.FC = () => (
  <LayoutProvider width={1080} height={1920}>
    <IntroScenes />
  </LayoutProvider>
);

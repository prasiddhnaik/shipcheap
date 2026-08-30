import "./index.css";
import { Composition, Folder } from "remotion";
import { IntroLandscape } from "./Composition";
import { IntroPortrait } from "./CompositionPortrait";
import { LayoutProvider } from "./LayoutContext";
import { Scene01Hook } from "./intro/Scene01Hook";
import { Scene02Bill } from "./intro/Scene02Bill";
import { Scene03Reveal } from "./intro/Scene03Reveal";
import { Scene04Constraints } from "./intro/Scene04Constraints";
import { Scene05Results } from "./intro/Scene05Results";
import { Scene06Duel } from "./intro/Scene06Duel";
import { Scene07Safe } from "./intro/Scene07Safe";
import { Scene08CTA } from "./intro/Scene08CTA";

const Landscape: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LayoutProvider width={1920} height={1080}>
    {children}
  </LayoutProvider>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Intro-Landscape"
        component={IntroLandscape}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Intro-Portrait"
        component={IntroPortrait}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />

      <Folder name="Intro-Scenes">
        <Composition
          id="Scene-01-Hook"
          component={() => (
            <Landscape>
              <Scene01Hook />
            </Landscape>
          )}
          durationInFrames={80}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene-02-Bill"
          component={() => (
            <Landscape>
              <Scene02Bill />
            </Landscape>
          )}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene-03-Reveal"
          component={() => (
            <Landscape>
              <Scene03Reveal />
            </Landscape>
          )}
          durationInFrames={105}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene-04-Constraints"
          component={() => (
            <Landscape>
              <Scene04Constraints />
            </Landscape>
          )}
          durationInFrames={125}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene-05-Results"
          component={() => (
            <Landscape>
              <Scene05Results />
            </Landscape>
          )}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene-06-Duel"
          component={() => (
            <Landscape>
              <Scene06Duel />
            </Landscape>
          )}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene-07-Safe"
          component={() => (
            <Landscape>
              <Scene07Safe />
            </Landscape>
          )}
          durationInFrames={124}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="Scene-08-CTA"
          component={() => (
            <Landscape>
              <Scene08CTA />
            </Landscape>
          )}
          durationInFrames={130}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};

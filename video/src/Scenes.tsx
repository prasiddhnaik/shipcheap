import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import React from "react";
import { AbsoluteFill, interpolate, staticFile } from "remotion";
import { Scene01Hook } from "./intro/Scene01Hook";
import { Scene02Bill } from "./intro/Scene02Bill";
import { Scene03Reveal } from "./intro/Scene03Reveal";
import { Scene04Constraints } from "./intro/Scene04Constraints";
import { Scene05Results } from "./intro/Scene05Results";
import { Scene06Duel } from "./intro/Scene06Duel";
import { Scene07Safe } from "./intro/Scene07Safe";
import { Scene08CTA } from "./intro/Scene08CTA";

/**
 * Shared scene timeline for both formats.
 * 984 scene frames - (7 transitions x 12) = 900 frames = 30.0s at 30fps.
 */
export const IntroScenes: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio
        name="Background music"
        src={staticFile("background-music.mp3")}
        trimBefore={0}
        durationInFrames={900}
        volume={(f) =>
          interpolate(f, [0, 45, 810, 899], [0, 0.11, 0.11, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={80} name="Hook">
        <Scene01Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />

      <TransitionSeries.Sequence durationInFrames={120} name="The bill">
        <Scene02Bill />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />

      <TransitionSeries.Sequence durationInFrames={105} name="ShipCheap reveal">
        <Scene03Reveal />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: 12 })}
      />

      <TransitionSeries.Sequence durationInFrames={125} name="Constraints">
        <Scene04Constraints />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 12 })}
      />

      <TransitionSeries.Sequence durationInFrames={150} name="Ranked results">
        <Scene05Results />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 12 })}
      />

      <TransitionSeries.Sequence durationInFrames={150} name="Bill duel">
        <Scene06Duel />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />

      <TransitionSeries.Sequence durationInFrames={124} name="Safe result">
        <Scene07Safe />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />

      <TransitionSeries.Sequence durationInFrames={130} name="Call to action">
          <Scene08CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

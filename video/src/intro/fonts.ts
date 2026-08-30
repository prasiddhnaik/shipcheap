import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";

export const geist = loadGeist("normal", {
  weights: ["400", "600", "800", "900"],
  subsets: ["latin"],
}).fontFamily;

export const geistMono = loadGeistMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
}).fontFamily;

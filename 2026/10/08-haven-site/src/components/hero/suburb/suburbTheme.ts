// Every colour in the v5 neighbourhood. Change a hex here and the scene picks it up; no geometry to touch.

export type SuburbTheme = {
  skyTop: string;
  skyMid: string;
  skyFog: string;
  horizon: string;
  /** How strongly `horizon` is added at the skyline, 0 = off. */
  skyGlow: number;
  lawn: string;
  road: string;
  pavement: string;
  driveway: string;
  /** Wall and roof colours; each house picks one by index. */
  walls: string[];
  roofs: string[];
  trim: string;
  focalWall: string;
  focalRoof: string;
  door: string;
  garage: string;
  /** Unlit window glass. */
  glass: string;
  windowLit: string;
  windowWarm: string;
  trunk: string;
  trees: string[];
  hedge: string;
  fence: string;
  cars: string[];
  /** Colour a house blends toward when hovered. */
  flash: string;
  fog: string;
};

export type SuburbThemeName = "dark" | "light";

export const suburbThemes: Record<SuburbThemeName, SuburbTheme> = {
  dark: {
    skyTop: "#1e0f26",
    skyMid: "#2a1534",
    skyFog: "#33193f",
    horizon: "#5740ef",
    skyGlow: 0.5,
    lawn: "#211029",
    road: "#170b1d",
    pavement: "#2e1a39",
    driveway: "#2a1633",
    walls: ["#4a2a5c", "#553269", "#41244f"],
    roofs: ["#2c1638", "#351b43", "#28132f"],
    trim: "#6a4a7e",
    focalWall: "#5740ef",
    focalRoof: "#3a28a6",
    door: "#24112d",
    garage: "#3a2148",
    glass: "#1a0c20",
    windowLit: "#c9b5da",
    windowWarm: "#f2d4b4",
    trunk: "#1e0f26",
    trees: ["#2d1a3b", "#36214a", "#2a1736"],
    hedge: "#2b1838",
    fence: "#5d4270",
    cars: ["#6b4a7d", "#4b3a8f"],
    flash: "#dccbea",
    fog: "#2f1839",
  },
  light: {
    skyTop: "#f7f4fa",
    skyMid: "#efe8f4",
    skyFog: "#e9e0f0",
    horizon: "#000000",
    skyGlow: 0,
    lawn: "#ebe3f1",
    road: "#d6c8e1",
    pavement: "#f7f4fa",
    driveway: "#e0d3e9",
    walls: ["#d9c9e6", "#cdb9de", "#e3d6ee"],
    roofs: ["#a58bbd", "#9378ad", "#b199c7"],
    trim: "#f7f4fa",
    focalWall: "#5740ef",
    focalRoof: "#3a28a6",
    door: "#7d62a0",
    garage: "#bba5cf",
    glass: "#8f78ad",
    windowLit: "#ffffff",
    windowWarm: "#fff1de",
    trunk: "#8d76a3",
    trees: ["#b8a2cc", "#a990c0", "#c4b0d6"],
    hedge: "#b49dc9",
    fence: "#ffffff",
    cars: ["#8b7bff", "#a58bbd"],
    flash: "#8b7bff",
    fog: "#efe8f4",
  },
};

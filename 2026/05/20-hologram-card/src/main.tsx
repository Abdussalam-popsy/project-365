import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { HologramCard } from "./hologram-card";

import image from "./assets/imgs/lady.png";
import depth from "./assets/imgs/lady-depth.png";
import shade from "./assets/imgs/lady-depth-shade.png";

function App() {
  return (
    <main className="app">
      <HologramCard images={{ image, depth, shade }} aspectRatio={6 / 4} />
    </main>
  );
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

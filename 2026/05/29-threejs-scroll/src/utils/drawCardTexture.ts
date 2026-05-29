import * as THREE from "three";
import type { CardData } from "../data/cards";

const TEXTURE_WIDTH = 512;
const TEXTURE_HEIGHT = 768;

export function drawCardTexture(card: CardData): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get 2D context for card texture");
  }

  const radius = 36;
  roundRect(ctx, 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT, radius);

  const gradient = ctx.createLinearGradient(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  gradient.addColorStop(0, card.gradient[0]);
  gradient.addColorStop(1, card.gradient[1]);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(TEXTURE_WIDTH * 0.75, TEXTURE_HEIGHT * 0.22, 120, 90, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "700 52px system-ui, -apple-system, sans-serif";
  ctx.textBaseline = "top";

  wrapText(ctx, card.title, 44, 520, TEXTURE_WIDTH - 88, 58);

  if (card.label) {
    ctx.save();
    ctx.translate(TEXTURE_WIDTH - 36, TEXTURE_HEIGHT - 80);
    ctx.rotate(-Math.PI / 2);
    ctx.font = "600 22px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText(card.label, 0, 0);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.clip();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;

  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = words[i] ?? "";
      cursorY += lineHeight;
    } else {
      line = test;
    }
  }

  if (line) ctx.fillText(line, x, cursorY);
}

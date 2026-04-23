import { useRef, useEffect, useCallback, useState } from "react";
import { Pane } from "tweakpane";
import { useDialKit } from "dialkit";

interface Bar {
  x: number;
  y: number;
  baseHeight: number;
  currentHeight: number;
  targetHeight: number;
}

type ShapeType =
  | "isometric-l"
  | "isometric-box"
  | "isometric-hex"
  | "isometric-triangle"
  | "isometric-diamond"
  | "isometric-cylinder"
  | "isometric-stairs"
  | "isometric-pyramid";

interface Parameters {
  fillColor: string;
  strokeColor: string;
  backgroundColor: string;
  shapeType: ShapeType;
  proximityRadius: number;
  barCount: number;
  barWidth: number;
  barDepth: number;
  spacing: number;
  maxHeight: number;
  baseHeight: number;
  easing: number;
  strokeWidth: number;
  fillOpacity: number;
  strokeOpacity: number;
}

export default function CursorProximityCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barsRef = useRef<Bar[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);
  const paneRef = useRef<Pane | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const p = useDialKit("Canvas", {
    barCount: {
      min: 3,
      max: 30,
      step: 1,
    },
  });

  const [params, setParams] = useState<Parameters>({
    fillColor: "#000000",
    strokeColor: "#ffffff",
    backgroundColor: "#000000",
    shapeType: "isometric-l",
    proximityRadius: 250,
    barCount: 12,
    barWidth: 60,
    barDepth: 20,
    spacing: 25,
    maxHeight: 180,
    baseHeight: 20,
    easing: 0.08,
    strokeWidth: 1,
    fillOpacity: 0,
    strokeOpacity: 0.8,
  });

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const initBars = useCallback((canvas: HTMLCanvasElement) => {
    const bars: Bar[] = [];
    const p = paramsRef.current;
    const totalWidth = p.barCount * p.spacing;
    const startX = canvas.width / 2 - totalWidth / 2;
    const startY = canvas.height / 2 + 50;

    for (let i = 0; i < p.barCount; i++) {
      bars.push({
        x: startX + i * p.spacing,
        y: startY + i * (p.barDepth * 0.5),
        baseHeight: p.baseHeight,
        currentHeight: p.baseHeight,
        targetHeight: p.baseHeight,
      });
    }
    barsRef.current = bars;
  }, []);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 255, g: 255, b: 255 };
  };

  const drawShape = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      height: number,
      shapeType: ShapeType,
    ) => {
      const p = paramsRef.current;
      const strokeRgb = hexToRgb(p.strokeColor);
      const fillRgb = hexToRgb(p.fillColor);

      ctx.strokeStyle = `rgba(${strokeRgb.r}, ${strokeRgb.g}, ${strokeRgb.b}, ${p.strokeOpacity})`;
      ctx.fillStyle = `rgba(${fillRgb.r}, ${fillRgb.g}, ${fillRgb.b}, ${p.fillOpacity})`;
      ctx.lineWidth = p.strokeWidth;

      const isoAngle = Math.PI / 6;
      const cos = Math.cos(isoAngle);
      const sin = Math.sin(isoAngle);

      switch (shapeType) {
        case "isometric-l":
          drawIsometricL(ctx, x, y, height, p, cos, sin);
          break;
        case "isometric-box":
          drawIsometricBox(ctx, x, y, height, p, cos, sin);
          break;
        case "isometric-hex":
          drawIsometricHex(ctx, x, y, height, p, cos, sin);
          break;
        case "isometric-triangle":
          drawIsometricTriangle(ctx, x, y, height, p, cos, sin);
          break;
        case "isometric-diamond":
          drawIsometricDiamond(ctx, x, y, height, p, cos, sin);
          break;
        case "isometric-cylinder":
          drawIsometricCylinder(ctx, x, y, height, p);
          break;
        case "isometric-stairs":
          drawIsometricStairs(ctx, x, y, height, p, cos, sin);
          break;
        case "isometric-pyramid":
          drawIsometricPyramid(ctx, x, y, height, p, cos, sin);
          break;
      }
    },
    [],
  );

  const drawIsometricL = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    height: number,
    p: Parameters,
    cos: number,
    sin: number,
  ) => {
    const topLeft = { x: x, y: y - height };
    const topRight = {
      x: x + p.barWidth * cos,
      y: y - height - p.barWidth * sin,
    };
    const bottomRight = { x: x + p.barWidth * cos, y: y - p.barWidth * sin };
    const bottomLeft = { x: x, y: y };

    const depthOffsetX = p.barDepth * cos;
    const depthOffsetY = p.barDepth * sin;

    const backTopLeft = {
      x: topLeft.x + depthOffsetX,
      y: topLeft.y - depthOffsetY,
    };
    const backTopRight = {
      x: topRight.x + depthOffsetX,
      y: topRight.y - depthOffsetY,
    };
    const backBottomLeft = {
      x: bottomLeft.x + depthOffsetX,
      y: bottomLeft.y - depthOffsetY,
    };
    const backBottomRight = {
      x: bottomRight.x + depthOffsetX,
      y: bottomRight.y - depthOffsetY,
    };

    // Front face
    ctx.beginPath();
    ctx.moveTo(bottomLeft.x, bottomLeft.y);
    ctx.lineTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top face
    ctx.beginPath();
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(backTopLeft.x, backTopLeft.y);
    ctx.lineTo(backTopRight.x, backTopRight.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right face
    ctx.beginPath();
    ctx.moveTo(topRight.x, topRight.y);
    ctx.lineTo(backTopRight.x, backTopRight.y);
    ctx.lineTo(backBottomRight.x, backBottomRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Back edges
    ctx.beginPath();
    ctx.moveTo(backBottomLeft.x, backBottomLeft.y);
    ctx.lineTo(backTopLeft.x, backTopLeft.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(backBottomLeft.x, backBottomLeft.y);
    ctx.lineTo(backBottomRight.x, backBottomRight.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bottomLeft.x, bottomLeft.y);
    ctx.lineTo(backBottomLeft.x, backBottomLeft.y);
    ctx.stroke();
  };

  const drawIsometricBox = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    height: number,
    p: Parameters,
    cos: number,
    sin: number,
  ) => {
    const w = p.barWidth * 0.4;
    const d = p.barDepth * 0.8;

    // Base corners
    const frontBottom = { x: x, y: y };
    const rightBottom = { x: x + w * cos, y: y - w * sin };
    const backBottom = { x: x + w * cos + d * cos, y: y - w * sin - d * sin };
    const leftBottom = { x: x + d * cos, y: y - d * sin };

    // Top corners
    const frontTop = { x: x, y: y - height };
    const rightTop = { x: x + w * cos, y: y - height - w * sin };
    const backTop = {
      x: x + w * cos + d * cos,
      y: y - height - w * sin - d * sin,
    };
    const leftTop = { x: x + d * cos, y: y - height - d * sin };

    // Left face
    ctx.beginPath();
    ctx.moveTo(frontBottom.x, frontBottom.y);
    ctx.lineTo(frontTop.x, frontTop.y);
    ctx.lineTo(leftTop.x, leftTop.y);
    ctx.lineTo(leftBottom.x, leftBottom.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right face
    ctx.beginPath();
    ctx.moveTo(frontBottom.x, frontBottom.y);
    ctx.lineTo(frontTop.x, frontTop.y);
    ctx.lineTo(rightTop.x, rightTop.y);
    ctx.lineTo(rightBottom.x, rightBottom.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top face
    ctx.beginPath();
    ctx.moveTo(frontTop.x, frontTop.y);
    ctx.lineTo(leftTop.x, leftTop.y);
    ctx.lineTo(backTop.x, backTop.y);
    ctx.lineTo(rightTop.x, rightTop.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Back edges
    ctx.beginPath();
    ctx.moveTo(leftBottom.x, leftBottom.y);
    ctx.lineTo(leftTop.x, leftTop.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightBottom.x, rightBottom.y);
    ctx.lineTo(rightTop.x, rightTop.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(leftBottom.x, leftBottom.y);
    ctx.lineTo(backBottom.x, backBottom.y);
    ctx.lineTo(rightBottom.x, rightBottom.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(backBottom.x, backBottom.y);
    ctx.lineTo(backTop.x, backTop.y);
    ctx.stroke();
  };

  const drawIsometricHex = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    height: number,
    p: Parameters,
    cos: number,
    sin: number,
  ) => {
    const size = p.barWidth * 0.25;
    const hexPoints: { x: number; y: number }[] = [];

    // Create hexagon points in isometric space
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const hx = Math.cos(angle) * size;
      const hy = Math.sin(angle) * size;
      // Convert to isometric
      hexPoints.push({
        x: x + hx * cos - hy * cos,
        y: y - hx * sin - hy * sin,
      });
    }

    // Top face
    ctx.beginPath();
    hexPoints.forEach((pt, i) => {
      const topPt = { x: pt.x, y: pt.y - height };
      if (i === 0) ctx.moveTo(topPt.x, topPt.y);
      else ctx.lineTo(topPt.x, topPt.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Side faces (only visible ones)
    for (let i = 0; i < 6; i++) {
      const next = (i + 1) % 6;
      // Draw sides that face the viewer
      if (i >= 2 && i <= 4) {
        ctx.beginPath();
        ctx.moveTo(hexPoints[i].x, hexPoints[i].y);
        ctx.lineTo(hexPoints[i].x, hexPoints[i].y - height);
        ctx.lineTo(hexPoints[next].x, hexPoints[next].y - height);
        ctx.lineTo(hexPoints[next].x, hexPoints[next].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Bottom edges
    ctx.beginPath();
    hexPoints.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.stroke();
  };

  const drawIsometricTriangle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    height: number,
    p: Parameters,
    cos: number,
    sin: number,
  ) => {
    const size = p.barWidth * 0.35;
    const d = p.barDepth * 0.6;

    // Triangle base points
    const front = { x: x, y: y };
    const left = { x: x - size * cos + d * cos, y: y + size * sin - d * sin };
    const right = { x: x + size * cos + d * cos, y: y + size * sin - d * sin };

    // Top points
    const frontTop = { x: front.x, y: front.y - height };
    const leftTop = { x: left.x, y: left.y - height };
    const rightTop = { x: right.x, y: right.y - height };

    // Front left face
    ctx.beginPath();
    ctx.moveTo(front.x, front.y);
    ctx.lineTo(frontTop.x, frontTop.y);
    ctx.lineTo(leftTop.x, leftTop.y);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Front right face
    ctx.beginPath();
    ctx.moveTo(front.x, front.y);
    ctx.lineTo(frontTop.x, frontTop.y);
    ctx.lineTo(rightTop.x, rightTop.y);
    ctx.lineTo(right.x, right.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top face
    ctx.beginPath();
    ctx.moveTo(frontTop.x, frontTop.y);
    ctx.lineTo(leftTop.x, leftTop.y);
    ctx.lineTo(rightTop.x, rightTop.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Back face
    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(leftTop.x, leftTop.y);
    ctx.lineTo(rightTop.x, rightTop.y);
    ctx.lineTo(right.x, right.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const drawIsometricDiamond = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    height: number,
    p: Parameters,
    cos: number,
    sin: number,
  ) => {
    const size = p.barWidth * 0.3;

    // Diamond base points
    const front = { x: x, y: y };
    const left = { x: x - size * cos, y: y - size * sin };
    const back = { x: x, y: y - size * sin * 2 };
    const right = { x: x + size * cos, y: y - size * sin };

    // Top points
    const frontTop = { x: front.x, y: front.y - height };
    const leftTop = { x: left.x, y: left.y - height };
    const backTop = { x: back.x, y: back.y - height };
    const rightTop = { x: right.x, y: right.y - height };

    // Left face
    ctx.beginPath();
    ctx.moveTo(front.x, front.y);
    ctx.lineTo(frontTop.x, frontTop.y);
    ctx.lineTo(leftTop.x, leftTop.y);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right face
    ctx.beginPath();
    ctx.moveTo(front.x, front.y);
    ctx.lineTo(frontTop.x, frontTop.y);
    ctx.lineTo(rightTop.x, rightTop.y);
    ctx.lineTo(right.x, right.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top face
    ctx.beginPath();
    ctx.moveTo(frontTop.x, frontTop.y);
    ctx.lineTo(leftTop.x, leftTop.y);
    ctx.lineTo(backTop.x, backTop.y);
    ctx.lineTo(rightTop.x, rightTop.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Back edges
    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(back.x, back.y);
    ctx.lineTo(right.x, right.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(leftTop.x, leftTop.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(right.x, right.y);
    ctx.lineTo(rightTop.x, rightTop.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(back.x, back.y);
    ctx.lineTo(backTop.x, backTop.y);
    ctx.stroke();
  };

  const drawIsometricCylinder = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    height: number,
    p: Parameters,
  ) => {
    const radiusX = p.barWidth * 0.25;
    const radiusY = radiusX * 0.5; // Isometric squish

    // Bottom ellipse
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Side walls
    ctx.beginPath();
    ctx.moveTo(x - radiusX, y);
    ctx.lineTo(x - radiusX, y - height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + radiusX, y);
    ctx.lineTo(x + radiusX, y - height);
    ctx.stroke();

    // Bottom arc (visible part)
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI);
    ctx.stroke();

    // Cylinder body
    ctx.beginPath();
    ctx.moveTo(x - radiusX, y);
    ctx.lineTo(x - radiusX, y - height);
    ctx.ellipse(x, y - height, radiusX, radiusY, 0, Math.PI, 0, true);
    ctx.lineTo(x + radiusX, y);
    ctx.fill();

    // Top ellipse
    ctx.beginPath();
    ctx.ellipse(x, y - height, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  const drawIsometricStairs = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    height: number,
    p: Parameters,
    cos: number,
    sin: number,
  ) => {
    const steps = 4;
    const stepHeight = height / steps;
    const stepWidth = p.barWidth * 0.15;
    const stepDepth = p.barDepth * 0.4;

    for (let i = 0; i < steps; i++) {
      const stepY = y - stepHeight * i;
      const offsetX = i * stepDepth * cos;
      const offsetY = i * stepDepth * sin;

      const front = { x: x + offsetX, y: stepY - offsetY };
      const right = {
        x: front.x + stepWidth * cos,
        y: front.y - stepWidth * sin,
      };
      const back = {
        x: right.x + stepDepth * cos,
        y: right.y - stepDepth * sin,
      };
      const left = {
        x: front.x + stepDepth * cos,
        y: front.y - stepDepth * sin,
      };

      const frontTop = { x: front.x, y: front.y - stepHeight };
      const rightTop = { x: right.x, y: right.y - stepHeight };
      const backTop = { x: back.x, y: back.y - stepHeight };
      const leftTop = { x: left.x, y: left.y - stepHeight };

      // Front face
      ctx.beginPath();
      ctx.moveTo(front.x, front.y);
      ctx.lineTo(frontTop.x, frontTop.y);
      ctx.lineTo(rightTop.x, rightTop.y);
      ctx.lineTo(right.x, right.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top face
      ctx.beginPath();
      ctx.moveTo(frontTop.x, frontTop.y);
      ctx.lineTo(leftTop.x, leftTop.y);
      ctx.lineTo(backTop.x, backTop.y);
      ctx.lineTo(rightTop.x, rightTop.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Left face
      ctx.beginPath();
      ctx.moveTo(front.x, front.y);
      ctx.lineTo(frontTop.x, frontTop.y);
      ctx.lineTo(leftTop.x, leftTop.y);
      ctx.lineTo(left.x, left.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  };

  const drawIsometricPyramid = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    height: number,
    p: Parameters,
    cos: number,
    sin: number,
  ) => {
    const size = p.barWidth * 0.3;

    // Base points
    const front = { x: x, y: y };
    const left = { x: x - size * cos, y: y - size * sin };
    const back = { x: x, y: y - size * sin * 2 };
    const right = { x: x + size * cos, y: y - size * sin };

    // Apex
    const apex = { x: x, y: y - height - size * sin };

    // Front left face
    ctx.beginPath();
    ctx.moveTo(front.x, front.y);
    ctx.lineTo(apex.x, apex.y);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Front right face
    ctx.beginPath();
    ctx.moveTo(front.x, front.y);
    ctx.lineTo(apex.x, apex.y);
    ctx.lineTo(right.x, right.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Back faces (edges only for wireframe look)
    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(apex.x, apex.y);
    ctx.lineTo(back.x, back.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(right.x, right.y);
    ctx.lineTo(apex.x, apex.y);
    ctx.lineTo(back.x, back.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Base
    ctx.beginPath();
    ctx.moveTo(front.x, front.y);
    ctx.lineTo(left.x, left.y);
    ctx.lineTo(back.x, back.y);
    ctx.lineTo(right.x, right.y);
    ctx.closePath();
    ctx.stroke();
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const p = paramsRef.current;

    ctx.fillStyle = p.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const mouse = mouseRef.current;

    barsRef.current.forEach((bar) => {
      const barCenterX = bar.x + p.barWidth / 2;
      const barCenterY = bar.y - bar.currentHeight / 2;
      const distance = Math.sqrt(
        Math.pow(mouse.x - barCenterX, 2) + Math.pow(mouse.y - barCenterY, 2),
      );

      if (distance < p.proximityRadius) {
        const proximity = 1 - distance / p.proximityRadius;
        const easedProximity = proximity * proximity * (3 - 2 * proximity);
        bar.targetHeight =
          p.baseHeight + (p.maxHeight - p.baseHeight) * easedProximity;
      } else {
        bar.targetHeight = p.baseHeight;
      }

      bar.currentHeight += (bar.targetHeight - bar.currentHeight) * p.easing;

      drawShape(ctx, bar.x, bar.y, bar.currentHeight, p.shapeType);
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [drawShape]);

  // Initialize Tweakpane
  useEffect(() => {
    if (!containerRef.current || paneRef.current) return;

    const pane = new Pane({
      container: containerRef.current,
      title: "Parameters",
    });
    paneRef.current = pane;

    const PARAMS = { ...params };

    // Colors folder
    const colorsFolder = pane.addFolder({ title: "Colors" });
    colorsFolder.addBinding(PARAMS, "backgroundColor", { label: "Background" });
    colorsFolder.addBinding(PARAMS, "strokeColor", { label: "Stroke" });
    colorsFolder.addBinding(PARAMS, "fillColor", { label: "Fill" });
    colorsFolder.addBinding(PARAMS, "strokeOpacity", {
      label: "Stroke Opacity",
      min: 0,
      max: 1,
      step: 0.01,
    });
    colorsFolder.addBinding(PARAMS, "fillOpacity", {
      label: "Fill Opacity",
      min: 0,
      max: 1,
      step: 0.01,
    });

    // Shape folder
    const shapeFolder = pane.addFolder({ title: "Shape" });
    shapeFolder.addBinding(PARAMS, "shapeType", {
      label: "Type",
      options: {
        "Isometric L": "isometric-l",
        "Isometric Box": "isometric-box",
        "Isometric Hex": "isometric-hex",
        "Isometric Triangle": "isometric-triangle",
        "Isometric Diamond": "isometric-diamond",
        "Isometric Cylinder": "isometric-cylinder",
        "Isometric Stairs": "isometric-stairs",
        "Isometric Pyramid": "isometric-pyramid",
      },
    });
    shapeFolder.addBinding(PARAMS, "barCount", {
      label: "Count",
      min: 3,
      max: 30,
      step: 1,
    });
    shapeFolder.addBinding(PARAMS, "barWidth", {
      label: "Width",
      min: 10,
      max: 120,
      step: 1,
    });
    shapeFolder.addBinding(PARAMS, "barDepth", {
      label: "Depth",
      min: 5,
      max: 60,
      step: 1,
    });
    shapeFolder.addBinding(PARAMS, "spacing", {
      label: "Spacing",
      min: 5,
      max: 80,
      step: 1,
    });
    shapeFolder.addBinding(PARAMS, "strokeWidth", {
      label: "Stroke Width",
      min: 0.5,
      max: 5,
      step: 0.1,
    });

    // Animation folder
    const animFolder = pane.addFolder({ title: "Animation" });
    animFolder.addBinding(PARAMS, "proximityRadius", {
      label: "Proximity Radius",
      min: 50,
      max: 600,
      step: 10,
    });
    animFolder.addBinding(PARAMS, "baseHeight", {
      label: "Base Height",
      min: 5,
      max: 100,
      step: 1,
    });
    animFolder.addBinding(PARAMS, "maxHeight", {
      label: "Max Height",
      min: 50,
      max: 400,
      step: 5,
    });
    animFolder.addBinding(PARAMS, "easing", {
      label: "Easing",
      min: 0.01,
      max: 0.3,
      step: 0.01,
    });

    pane.on("change", () => {
      setParams({ ...PARAMS });
    });

    return () => {
      pane.dispose();
      paneRef.current = null;
    };
  }, []);

  // Re-init bars when relevant params change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      initBars(canvas);
    }
  }, [
    params.barCount,
    params.spacing,
    params.barDepth,
    params.baseHeight,
    initBars,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initBars(canvas);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initBars, animate]);

  return (
    <div className="relative w-full h-screen">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 cursor-crosshair"
        style={{ background: params.backgroundColor }}
      />
      <div
        ref={containerRef}
        className="fixed top-4 right-4 z-10"
        style={{ width: 280 }}
      />
    </div>
  );
}

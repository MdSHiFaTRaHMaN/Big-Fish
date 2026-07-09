"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function useStyleDecals(colors) {
  return useMemo(() => {
    if (!colors?.collar || !colors?.collarType || colors.collarType === "None")
      return { collarDecal: null };

    const S = 1024;
    const cv = document.createElement("canvas");
    cv.width = S;
    cv.height = S;
    const ctx = cv.getContext("2d");
    if (!ctx) return { collarDecal: null };
    ctx.clearRect(0, 0, S, S);

    // Polyfill for roundRect (not in all TS lib versions)
    const drawRoundRect = (x, y, w, h, r) => {
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
    };

    const drawPlacket = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.closePath();
    };

    const drawRealisticButton = (cx, cy, r) => {
      ctx.save();

      // 1. Drop shadow (subtle dark glow under the button)
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      // 2. Outer button body (slight gradient for rounded 3D effect)
      const btnGrad = ctx.createRadialGradient(
        cx - r * 0.3,
        cy - r * 0.3,
        r * 0.1,
        cx,
        cy,
        r,
      );
      btnGrad.addColorStop(0, "#ffffff"); // Highlight
      btnGrad.addColorStop(0.7, "#eaeaea"); // Base cream/white
      btnGrad.addColorStop(1, "#c0c0c0"); // Outer shaded edge

      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadow so it doesn't apply to inner details
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // 3. Button Rim (thin outline on the very edge)
      ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Inner Recess (inner circle rim)
      const innerR = r * 0.6;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Four Button Holes in the center
      const holeOffset = r * 0.25;
      const holeR = r * 0.08;
      const holes = [
        { x: cx - holeOffset, y: cy - holeOffset },
        { x: cx + holeOffset, y: cy - holeOffset },
        { x: cx - holeOffset, y: cy + holeOffset },
        { x: cx + holeOffset, y: cy + holeOffset },
      ];

      ctx.fillStyle = "#333333"; // Dark holes
      holes.forEach((h) => {
        ctx.beginPath();
        ctx.arc(h.x, h.y, holeR, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6. Cross stitch threads (connecting the holes)
      ctx.strokeStyle = "#888888"; // Thread color
      ctx.lineWidth = 1.2;

      // Diagonal 1
      ctx.beginPath();
      ctx.moveTo(cx - holeOffset, cy - holeOffset);
      ctx.lineTo(cx + holeOffset, cy + holeOffset);
      ctx.stroke();

      // Diagonal 2
      ctx.beginPath();
      ctx.moveTo(cx + holeOffset, cy - holeOffset);
      ctx.lineTo(cx - holeOffset, cy + holeOffset);
      ctx.stroke();

      ctx.restore();
    };

    const trim = colors.designColor || colors.secondary || "#1A1A2E";
    const base = colors.primary || "#2196F3";

    // Helper: parse hex to rgb
    const hexRgb = (h) => {
      const c = parseInt(h.replace("#", ""), 16);
      return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    };
    const lighten = (h, amt) => {
      const [r, g, b] = hexRgb(h);
      return `rgba(${Math.min(255, r + amt)},${Math.min(255, g + amt)},${Math.min(255, b + amt)},1)`;
    };
    const darken = (h, amt) => {
      const [r, g, b] = hexRgb(h);
      return `rgba(${Math.max(0, r - amt)},${Math.max(0, g - amt)},${Math.max(0, b - amt)},1)`;
    };

    if (colors.collarType === "Round") {
      // Thick crew neck rib band — semi-circle at top
      const grad = ctx.createLinearGradient(0, 0, 0, S * 0.22);
      grad.addColorStop(0, lighten(trim, 40));
      grad.addColorStop(0.5, trim);
      grad.addColorStop(1, darken(trim, 30));
      ctx.strokeStyle = grad;
      ctx.lineWidth = S * 0.085;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(S / 2, 0, S * 0.38, 0.08, Math.PI - 0.08);
      ctx.stroke();
      // Rib stitch lines
      ctx.strokeStyle = darken(trim, 50);
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const r2 = S * 0.34 + i * S * 0.013;
        ctx.beginPath();
        ctx.arc(S / 2, 0, r2, 0.12, Math.PI - 0.12);
        ctx.stroke();
      }
    } else if (colors.collarType === "V-Neck") {
      // Left leg of V
      const makeVLeg = (x1, y1, x2, y2) => {
        const lg = ctx.createLinearGradient(x1, y1, x2, y2);
        lg.addColorStop(0, lighten(trim, 35));
        lg.addColorStop(0.45, trim);
        lg.addColorStop(1, darken(trim, 25));
        ctx.strokeStyle = lg;
        ctx.lineWidth = S * 0.075;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        // inner rib
        ctx.strokeStyle = darken(trim, 55);
        ctx.lineWidth = 2;
        ctx.stroke();
      };
      makeVLeg(S * 0.18, 0, S * 0.5, S * 0.52);
      makeVLeg(S * 0.82, 0, S * 0.5, S * 0.52);
    } else if (colors.collarType === "Polo") {
      // Collar band at top
      const band = ctx.createLinearGradient(0, 0, 0, S * 0.18);
      band.addColorStop(0, lighten(trim, 45));
      band.addColorStop(1, darken(trim, 20));
      ctx.fillStyle = band;
      drawRoundRect(S * 0.08, 0, S * 0.84, S * 0.18, 6);
      ctx.fill();

      // Left wing
      const leftGrad = ctx.createLinearGradient(S * 0.1, 0, S * 0.5, S * 0.5);
      leftGrad.addColorStop(0, lighten(trim, 30));
      leftGrad.addColorStop(1, darken(trim, 15));
      ctx.fillStyle = leftGrad;
      ctx.beginPath();
      ctx.moveTo(S * 0.08, S * 0.14);
      ctx.lineTo(S * 0.08, S * 0.56);
      ctx.lineTo(S * 0.5, S * 0.35);
      ctx.lineTo(S * 0.5, S * 0.14);
      ctx.closePath();
      ctx.fill();

      // Right wing
      const rightGrad = ctx.createLinearGradient(S * 0.5, 0, S * 0.9, S * 0.5);
      rightGrad.addColorStop(0, lighten(trim, 30));
      rightGrad.addColorStop(1, darken(trim, 15));
      ctx.fillStyle = rightGrad;
      ctx.beginPath();
      ctx.moveTo(S * 0.92, S * 0.14);
      ctx.lineTo(S * 0.92, S * 0.56);
      ctx.lineTo(S * 0.5, S * 0.35);
      ctx.lineTo(S * 0.5, S * 0.14);
      ctx.closePath();
      ctx.fill();

      // Placket strip
      const pkGrad = ctx.createLinearGradient(
        S * 0.45,
        S * 0.34,
        S * 0.55,
        S * 0.34,
      );
      pkGrad.addColorStop(0, lighten(trim, 20));
      pkGrad.addColorStop(1, darken(trim, 10));
      ctx.fillStyle = pkGrad;
      drawPlacket(S * 0.46, S * 0.34, S * 0.08, S * 0.34, S * 0.04);
      ctx.fill();
      ctx.strokeStyle = darken(trim, 40);
      ctx.lineWidth = 2;
      drawPlacket(S * 0.46, S * 0.34, S * 0.08, S * 0.34, S * 0.04);
      ctx.stroke();

      if (colors.zipper) {
        // 1. Draw clean zipper tape background (optional: dark border)
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(S * 0.492, S * 0.34);
        ctx.lineTo(S * 0.492, S * 0.68);
        ctx.moveTo(S * 0.508, S * 0.34);
        ctx.lineTo(S * 0.508, S * 0.68);
        ctx.stroke();

        // 3. Draw dark gunmetal grey slider (matha) and pull tab
        const sliderY = S * 0.41;

        // 2. Draw metallic silver zipper track/teeth (looks like a coil)
        ctx.strokeStyle = "#a0a0a0"; // Metallic grey
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(S * 0.5, sliderY);
        ctx.lineTo(S * 0.5, S * 0.68);
        ctx.stroke();

        // Draw horizontal silver teeth segments
        ctx.strokeStyle = "#d8d8d8"; // Silver shine
        ctx.lineWidth = 2;
        for (let y = sliderY + S * 0.01; y <= S * 0.68; y += 5) {
          // Left side tooth
          ctx.beginPath();
          ctx.moveTo(S * 0.493, y);
          ctx.lineTo(S * 0.5, y);
          ctx.stroke();

          // Right side tooth (interlocking offset)
          ctx.beginPath();
          ctx.moveTo(S * 0.5, y + 2.5);
          ctx.lineTo(S * 0.507, y + 2.5);
          ctx.stroke();
        }

        // Draw dark center line for the track separation
        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(S * 0.5, S * 0.34);
        ctx.lineTo(S * 0.5, S * 0.68);
        ctx.stroke();

        // Loop / cap at the top (silver metallic)
        ctx.fillStyle = "#a0a0a0";
        ctx.strokeStyle = "#666666";
        ctx.lineWidth = 1;
        drawRoundRect(S * 0.491, sliderY - S * 0.008, S * 0.018, S * 0.012, 1);
        ctx.fill();
        ctx.stroke();

        // Main dark gunmetal rectangular slider body
        ctx.fillStyle = "#2d2d2d";
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1.5;
        // Rectangular with slightly rounded corners
        drawRoundRect(S * 0.48, sliderY, S * 0.04, S * 0.05, 1.5);
        ctx.fill();
        ctx.stroke();

        // Inner vertical groove on slider (like in the image)
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(S * 0.495, sliderY + S * 0.008, S * 0.01, S * 0.034);

        // Puller attachment bracket on slider
        ctx.fillStyle = "#555555";
        drawRoundRect(S * 0.492, sliderY + S * 0.015, S * 0.016, S * 0.018, 1);
        ctx.fill();

        // Long rectangular pull tab hanging down (matching the image)
        ctx.fillStyle = "#333333";
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1.5;
        drawRoundRect(S * 0.487, sliderY + S * 0.042, S * 0.026, S * 0.065, 2);
        ctx.fill();
        ctx.stroke();

        // Embossed slot detail in the center of the tab
        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 2;
        drawRoundRect(S * 0.493, sliderY + S * 0.048, S * 0.014, S * 0.053, 1);
        ctx.stroke();
      } else {
        // 2 realistic buttons
        [0.45, 0.57].forEach((yf) => {
          drawRealisticButton(S * 0.5, S * yf, S * 0.02);
        });
      }
    } else if (colors.collarType === "Henley") {
      // Round neck band
      const hb = ctx.createLinearGradient(0, 0, 0, S * 0.14);
      hb.addColorStop(0, lighten(trim, 40));
      hb.addColorStop(1, darken(trim, 20));
      ctx.strokeStyle = hb;
      ctx.lineWidth = S * 0.07;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(S / 2, 0, S * 0.38, 0.08, Math.PI - 0.08);
      ctx.stroke();
      // Rib stitches on band
      ctx.strokeStyle = darken(trim, 50);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(S / 2, 0, S * 0.35, 0.1, Math.PI - 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(S / 2, 0, S * 0.37, 0.1, Math.PI - 0.1);
      ctx.stroke();

      // Placket
      const pg2 = ctx.createLinearGradient(S * 0.44, 0, S * 0.56, 0);
      pg2.addColorStop(0, lighten(base, 20));
      pg2.addColorStop(0.5, base);
      pg2.addColorStop(1, darken(base, 15));
      ctx.fillStyle = pg2;
      drawPlacket(S * 0.44, S * 0.28, S * 0.12, S * 0.42, S * 0.06);
      ctx.fill();
      ctx.strokeStyle = darken(trim, 35);
      ctx.lineWidth = 2;
      drawPlacket(S * 0.44, S * 0.28, S * 0.12, S * 0.42, S * 0.06);
      ctx.stroke();

      if (colors.zipper) {
        // 1. Draw clean zipper tape background
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(S * 0.492, S * 0.28);
        ctx.lineTo(S * 0.492, S * 0.7);
        ctx.moveTo(S * 0.508, S * 0.28);
        ctx.lineTo(S * 0.508, S * 0.7);
        ctx.stroke();

        // 3. Draw dark gunmetal grey slider and pull tab
        const sliderY = S * 0.43;

        // 2. Draw metallic silver zipper track/teeth
        ctx.strokeStyle = "#a0a0a0";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(S * 0.5, sliderY);
        ctx.lineTo(S * 0.5, S * 0.7);
        ctx.stroke();

        // Draw horizontal silver teeth segments
        ctx.strokeStyle = "#d8d8d8";
        ctx.lineWidth = 2;
        for (let y = sliderY + S * 0.01; y <= S * 0.7; y += 5) {
          ctx.beginPath();
          ctx.moveTo(S * 0.493, y);
          ctx.lineTo(S * 0.5, y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(S * 0.5, y + 2.5);
          ctx.lineTo(S * 0.507, y + 2.5);
          ctx.stroke();
        }

        // Draw dark center line
        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(S * 0.5, S * 0.28);
        ctx.lineTo(S * 0.5, S * 0.7);
        ctx.stroke();

        // Loop / cap at the top
        ctx.fillStyle = "#a0a0a0";
        ctx.strokeStyle = "#666666";
        ctx.lineWidth = 1;
        drawRoundRect(S * 0.491, sliderY - S * 0.008, S * 0.018, S * 0.012, 1);
        ctx.fill();
        ctx.stroke();

        // Main dark gunmetal rectangular slider body
        ctx.fillStyle = "#2d2d2d";
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1.5;
        drawRoundRect(S * 0.48, sliderY, S * 0.04, S * 0.05, 1.5);
        ctx.fill();
        ctx.stroke();

        // Inner vertical groove
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(S * 0.495, sliderY + S * 0.008, S * 0.01, S * 0.034);

        // Puller attachment bracket
        ctx.fillStyle = "#555555";
        drawRoundRect(S * 0.492, sliderY + S * 0.015, S * 0.016, S * 0.018, 1);
        ctx.fill();

        // Long rectangular pull tab
        ctx.fillStyle = "#333333";
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 1.5;
        drawRoundRect(S * 0.487, sliderY + S * 0.042, S * 0.026, S * 0.065, 2);
        ctx.fill();
        ctx.stroke();

        // Embossed slot detail
        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 2;
        drawRoundRect(S * 0.493, sliderY + S * 0.048, S * 0.014, S * 0.053, 1);
        ctx.stroke();
      } else {
        // 2 realistic buttons
        [0.48, 0.6].forEach((yf) => {
          drawRealisticButton(S * 0.5, S * yf, S * 0.02);
        });
      }
    }

    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 16;
    tex.needsUpdate = true;
    return { collarDecal: tex };
  }, [
    colors?.collar,
    colors?.collarType,
    colors?.zipper,
    colors?.designColor,
    colors?.secondary,
    colors?.primary,
  ]);
}

const PATTERN_DEFAULT_COLORS = {
  "/assets/images/patterns/pattern_1.png": { bg: "#FFFFFF", design: "#d73099" },
  "/assets/images/patterns/pattern_2.png": { bg: "#FFFFFF", design: "#5A6B7C" },
  "/assets/images/patterns/pattern_3.png": { bg: "#FFFFFF", design: "#0F7643" },
  "/assets/images/patterns/pattern_4.png": { bg: "#FFFFFF", design: "#8db97b" },
  "/assets/images/patterns/pattern_5.png": { bg: "#FFFFFF", design: "#E52E2E" },
};

export function useJerseyDecals(state) {
  return useMemo(() => {
    const size = 1024;

    // Use secondary color for text to respect user's color selection
    const textColor = state.secondary || "#ffffff";

    const makeCanvas = (drawFn) => {
      const cv = document.createElement("canvas");
      cv.width = size;
      cv.height = size;
      const ctx = cv.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Explicitly disable context border path stroke defaults
      ctx.strokeStyle = "transparent";
      ctx.lineWidth = 0;

      drawFn(ctx);

      const texture = new THREE.CanvasTexture(cv);
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // The 3D Decal box scale for the torso is [0.54, 0.7, 0.32]. This non-square projection
      // naturally squishes the 1024x1024 square canvas horizontally by a factor of 0.54 / 0.7.
      // We apply an inverse mathematical multiplier to stretch the texture back out dynamically,
      // creating a perfect 1:1 mirror of the 2D visual layout without squeezing the logo.
      const meshDecalAspectRatio = 0.54 / 0.7;
      texture.repeat.set(meshDecalAspectRatio, 1);
      texture.offset.set((1 - meshDecalAspectRatio) / 2, 0);

      texture.needsUpdate = true;
      return texture;
    };

    const drawLayerOnCtx = (ctx, layer) => {
      const img = state.loadedLogoImages[layer.src];
      if (!img) return;
      ctx.save();
      ctx.strokeStyle = "transparent";
      ctx.lineWidth = 0;
      ctx.shadowBlur = 0;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const opacity = typeof layer.opacity === "number" ? layer.opacity : 1.0;
      ctx.globalAlpha = opacity;
      ctx.translate(layer.x, layer.y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.scale, layer.scale);

      const imgWidth = img.naturalWidth || img.width || 200;
      const imgHeight = img.naturalHeight || img.height || 200;
      const drawWidth = imgWidth;
      const drawHeight = imgHeight;

      if (layer.eraserPaths && layer.eraserPaths.length > 0) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = drawWidth;
        tempCanvas.height = drawHeight;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0, drawWidth, drawHeight);
          tempCtx.globalCompositeOperation = "destination-out";
          tempCtx.lineCap = "round";
          tempCtx.lineJoin = "round";
          tempCtx.strokeStyle = "rgba(0,0,0,1)";
          layer.eraserPaths.forEach((path) => {
            tempCtx.lineWidth = path.size;
            tempCtx.beginPath();
            path.points.forEach((pt, idx) => {
              if (idx === 0) {
                tempCtx.moveTo(pt.x, pt.y);
              } else {
                tempCtx.lineTo(pt.x, pt.y);
              }
            });
            tempCtx.stroke();
          });
          ctx.drawImage(
            tempCanvas,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight,
          );
        } else {
          ctx.drawImage(
            img,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight,
          );
        }
      } else {
        ctx.drawImage(
          img,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight,
        );
      }
      ctx.restore();
    };

    const getFontString = (sizeStr, fontStyle, defaultSize) => {
      const sz = sizeStr || defaultSize;
      if (fontStyle === "Italic")
        return `italic 900 ${sz}px Impact, sans-serif`;
      if (fontStyle === "Script")
        return `bold ${sz}px "Brush Script MT", cursive`;
      if (fontStyle === "Block") return `900 ${sz}px "Courier New", monospace`;
      if (fontStyle === "Varsity")
        return `900 ${sz}px "Arial Black", sans-serif`;
      if (fontStyle === "Serif Athletic")
        return `900 ${sz}px "Alfa Slab One", serif`;
      if (fontStyle === "Cyberpunk")
        return `900 ${sz}px "Orbitron", sans-serif`;
      if (fontStyle === "Grunge") return `400 ${sz}px "Rubik Glitch", display`;
      if (fontStyle === "Neon Glow") return `400 ${sz}px "Monoton", sans-serif`;
      if (fontStyle === "Gothic")
        return `400 ${sz}px "UnifrakturMaguntia", serif`;
      // Default and Outline use Impact
      return `900 ${sz}px Impact, sans-serif`;
    };

    const drawTextWithSpacing = (
      ctx,
      text,
      x,
      y,
      fontStyle,
      textSize,
      color,
      isOutline,
      outlineColor,
      letterSpacingVal,
      lineSpacingVal,
      curveRadiusVal,
      shadowEnabled,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
      outlineEnabled,
      customOutlineColor,
      outlineWidth,
    ) => {
      ctx.save();
      ctx.translate(x, y);

      const lines = text.split("\n");
      const lineSpacingHeight = textSize * (lineSpacingVal || 1.15);
      const totalHeight = (lines.length - 1) * lineSpacingHeight;
      const verticalOffset = -totalHeight / 2;

      lines.forEach((line, lineIndex) => {
        const curY = verticalOffset + lineIndex * lineSpacingHeight;

        ctx.font = getFontString(textSize, fontStyle, 100);
        ctx.textBaseline = "middle";

        if (shadowEnabled) {
          ctx.shadowColor = shadowColor || "#000000";
          ctx.shadowBlur = typeof shadowBlur === "number" ? shadowBlur : 10;
          ctx.shadowOffsetX =
            typeof shadowOffsetX === "number" ? shadowOffsetX : 4;
          ctx.shadowOffsetY =
            typeof shadowOffsetY === "number" ? shadowOffsetY : 4;
        } else if (fontStyle === "Neon Glow") {
          ctx.shadowColor = color;
          ctx.shadowBlur = Math.max(10, textSize * 0.15);
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        } else {
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        const chars = Array.from(line);
        const charWidths = chars.map((c) => ctx.measureText(c).width);
        const totalWidth =
          charWidths.reduce((a, b) => a + b, 0) +
          (chars.length - 1) * letterSpacingVal;

        if (!curveRadiusVal || curveRadiusVal === 0) {
          if (!letterSpacingVal || letterSpacingVal === 0) {
            ctx.textAlign = "center";

            // Draw outline stroke first (underneath fill)
            if (outlineEnabled) {
              ctx.strokeStyle = customOutlineColor || "#FFFFFF";
              ctx.lineWidth =
                typeof outlineWidth === "number" ? outlineWidth : 4;
              ctx.strokeText(line, 0, curY);
            } else if (isOutline) {
              ctx.strokeStyle = color;
              ctx.lineWidth = Math.max(2, textSize * 0.04);
              ctx.strokeText(line, 0, curY);
            }

            // Draw filled text second
            if (!isOutline) {
              ctx.fillStyle = color;
              ctx.fillText(line, 0, curY);
            }
          } else {
            // Draw character by character for letter spacing support
            let curX = -totalWidth / 2;

            ctx.textAlign = "left";

            chars.forEach((char, charIdx) => {
              const charW = charWidths[charIdx];

              if (outlineEnabled) {
                ctx.strokeStyle = customOutlineColor || "#FFFFFF";
                ctx.lineWidth =
                  typeof outlineWidth === "number" ? outlineWidth : 4;
                ctx.strokeText(char, curX, curY);
              } else if (isOutline) {
                ctx.strokeStyle = color;
                ctx.lineWidth = Math.max(2, textSize * 0.04);
                ctx.strokeText(char, curX, curY);
              }

              if (!isOutline) {
                ctx.fillStyle = color;
                ctx.fillText(char, curX, curY);
              }
              curX += charW + letterSpacingVal;
            });
          }
        } else {
          // Curved rendering along an arc!
          // curveRadiusVal represents the angle in degrees, e.g. -120 to 120
          const totalAngle = (curveRadiusVal * Math.PI) / 180;
          const R = totalWidth / totalAngle;

          let currentS = 0;

          ctx.textAlign = "center";

          chars.forEach((char, charIdx) => {
            const charW = charWidths[charIdx];
            const charCenterS = currentS + charW / 2;
            const angle = (charCenterS - totalWidth / 2) / R;

            const cx = R * Math.sin(angle);
            const cy = curY + R * (1 - Math.cos(angle));

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);

            if (outlineEnabled) {
              ctx.strokeStyle = customOutlineColor || "#FFFFFF";
              ctx.lineWidth =
                typeof outlineWidth === "number" ? outlineWidth : 4;
              ctx.strokeText(char, 0, 0);
            } else if (isOutline) {
              ctx.strokeStyle = color;
              ctx.lineWidth = Math.max(2, textSize * 0.04);
              ctx.strokeText(char, 0, 0);
            }

            if (!isOutline) {
              ctx.fillStyle = color;
              ctx.fillText(char, 0, 0);
            }
            ctx.restore();

            currentS += charW + letterSpacingVal;
          });
        }
      });
      ctx.restore();
    };

    // ── Pattern drawing — mirrors every SVG pattern to Canvas 2D ──────────────
    const drawPattern = (ctx) => {
      const dp = state.designPattern;
      if (!dp || dp === "plain") return;
      const sc = size / 100; // SVG viewBox is 100×100, canvas is 1024×1024
      const sec = state.designColor || state.secondary || "#1A1A2E";
      const pri = state.primary || "#2196F3";
      ctx.save();
      ctx.fillStyle = sec;
      ctx.strokeStyle = sec;
      switch (dp) {
        case "strike":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(60 * sc, 10 * sc);
          ctx.lineTo(80 * sc, 10 * sc);
          ctx.lineTo(50 * sc, 90 * sc);
          ctx.lineTo(30 * sc, 90 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "save":
          ctx.globalAlpha = 1.0;
          ctx.fillRect(0, 0, 45 * sc, size);
          break;
        case "fastbreak":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(30 * sc, 0);
          ctx.lineTo(0, 50 * sc);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(100 * sc, 50 * sc);
          ctx.lineTo(100 * sc, 100 * sc);
          ctx.lineTo(70 * sc, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "final":
          ctx.globalAlpha = 1.0;
          ctx.fillRect(0, 0, 35 * sc, size);
          ctx.fillRect(65 * sc, 0, 35 * sc, size);
          break;
        case "victory":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(40 * sc, 0);
          ctx.lineTo(20 * sc, 100 * sc);
          ctx.lineTo(0, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "city":
          ctx.globalAlpha = 1.0;
          ctx.lineWidth = 4 * sc;
          [25, 50, 75].forEach((y) => {
            ctx.beginPath();
            ctx.moveTo(0, y * sc);
            ctx.lineTo(size, y * sc);
            ctx.stroke();
          });
          break;
        case "pure":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(70 * sc, 0);
          ctx.lineTo(100 * sc, 0);
          ctx.lineTo(100 * sc, 40 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "level":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(55 * sc, 0);
          ctx.lineTo(0, 70 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "vivo":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(60 * sc, 100 * sc);
          ctx.lineTo(100 * sc, 0);
          ctx.lineTo(100 * sc, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "orion":
          ctx.globalAlpha = 0.18;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          [
            [30, 20],
            [70, 20],
            [90, 60],
            [50, 90],
            [10, 60],
          ].forEach(([x, y], i) => {
            i === 0 ? ctx.moveTo(x * sc, y * sc) : ctx.lineTo(x * sc, y * sc);
          });
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = sec;
          ctx.beginPath();
          [
            [40, 30],
            [60, 30],
            [70, 55],
            [50, 72],
            [30, 55],
          ].forEach(([x, y], i) => {
            i === 0 ? ctx.moveTo(x * sc, y * sc) : ctx.lineTo(x * sc, y * sc);
          });
          ctx.closePath();
          ctx.fill();
          break;
        case "animal":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(25 * sc, 40 * sc, 50 * sc, 10 * sc);
          ctx.quadraticCurveTo(75 * sc, 40 * sc, 100 * sc, 0);
          ctx.lineTo(100 * sc, 50 * sc);
          ctx.quadraticCurveTo(75 * sc, 80 * sc, 50 * sc, 55 * sc);
          ctx.quadraticCurveTo(25 * sc, 80 * sc, 0, 50 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "avatar":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 100 * sc);
          ctx.lineTo(45 * sc, 0);
          ctx.lineTo(55 * sc, 0);
          ctx.lineTo(0, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "league":
          ctx.globalAlpha = 1.0;
          ctx.fillRect(0, 0, 50 * sc, size);
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = pri;
          ctx.fillRect(50 * sc, 0, 50 * sc, size);
          break;
        case "magic": {
          const grad = ctx.createRadialGradient(
            50 * sc,
            40 * sc,
            0,
            50 * sc,
            40 * sc,
            80 * sc,
          );
          grad.addColorStop(0, sec);
          grad.addColorStop(1, "transparent");
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, size, size);
          break;
        }
        case "raid":
          ctx.globalAlpha = 1.0;
          ctx.fillRect(0, 0, size, 50 * sc);
          break;
        case "rush":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 100 * sc);
          ctx.lineTo(40 * sc, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        case "score":
          ctx.globalAlpha = 1.0;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(100 * sc, 0);
          ctx.lineTo(100 * sc, 100 * sc);
          ctx.closePath();
          ctx.fill();
          break;
        default:
          break;
      }
      ctx.restore();
    };

    // ── Fabric Pattern Canvas Drawer ──────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _drawFabricPatternOld = (
      ctx,
      patternName,
      primaryColor = "#E63946",
    ) => {
      if (!patternName || patternName === "None") return;
      ctx.save();

      switch (patternName) {
        case "Street Shard": {
          // 1. Draw Abstract Grunge Shards (Graffiti Style) on the left and right sides
          // We divide the canvas vertically into 3 sections: Left (0 to 35%), Center (35% to 65%), Right (65% to 100%)

          // Seeded/deterministic random helper so the pattern looks consistent on redraws
          let seed = 12345;
          const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
          };

          const drawShard = (x, y, rSize, color) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(
              x + (random() - 0.5) * rSize,
              y + (random() - 0.5) * rSize,
            );
            const points = 3 + Math.floor(random() * 4); // 3 to 6 points
            for (let p = 0; p < points; p++) {
              const angle = (p / points) * Math.PI * 2 + random() * 0.5;
              const px = x + Math.cos(angle) * rSize * (0.6 + random() * 0.6);
              const py = y + Math.sin(angle) * rSize * (0.6 + random() * 0.6);
              ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
          };

          // Draw dark/light shards on the left side
          for (let i = 0; i < 20; i++) {
            const rx = random() * (size * 0.33);
            const ry = random() * size;
            const rS = 30 + random() * 50;
            const isDark = random() > 0.3;
            drawShard(
              rx,
              ry,
              rS,
              isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.12)",
            );
            // wrap-around for tileability
            if (rx < rS)
              drawShard(
                rx + size,
                ry,
                rS,
                isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.12)",
              );
          }

          // Draw dark/light shards on the right side
          for (let i = 0; i < 20; i++) {
            const rx = size * 0.67 + random() * (size * 0.33);
            const ry = random() * size;
            const rS = 30 + random() * 50;
            const isDark = random() > 0.3;
            drawShard(
              rx,
              ry,
              rS,
              isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.12)",
            );
            // wrap-around for tileability
            if (rx + rS > size)
              drawShard(
                rx - size,
                ry,
                rS,
                isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.12)",
              );
          }

          // Add some fine lines / scratches for the grunge look
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.lineWidth = 2;
          for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            const sx = random() * size;
            const sy = random() * size;
            ctx.moveTo(sx, sy);
            ctx.lineTo(
              sx + (random() - 0.5) * 120,
              sy + (random() - 0.5) * 120,
            );
            ctx.stroke();
          }

          // 2. Draw Center Band
          const bandStart = size * 0.36;
          const bandEnd = size * 0.64;
          const bandWidth = bandEnd - bandStart;

          // Draw solid background center band with dark overlay
          ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
          ctx.fillRect(bandStart, 0, bandWidth, size);

          // Center band subtle marble/brush overlay
          ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 3;
          for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            const sx = bandStart + random() * bandWidth;
            const sy = random() * size;
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo(
              sx + (random() - 0.5) * 30,
              sy + 50,
              sx + (random() - 0.5) * 30,
              sy + 100,
            );
            ctx.stroke();
          }

          // 3. Draw Halftone Dots Gradient fading into center
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
          const dotSpacing = 10;

          // Left Halftone (fades as it goes left, i.e., x decreases from bandStart)
          for (let x = bandStart - 40; x <= bandStart; x += dotSpacing) {
            const distance = bandStart - x; // 0 to 40
            const maxRadius = 3.5;
            // Radius is largest at bandStart, smallest at bandStart - 40
            const radius = Math.max(0.5, maxRadius * (1 - distance / 40));
            for (let y = 0; y < size; y += dotSpacing) {
              ctx.beginPath();
              // Offset alternating rows to create a hex/halftone grid look
              const offset =
                (Math.round(y / dotSpacing) % 2) * (dotSpacing / 2);
              ctx.arc(x, y + offset, radius, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Right Halftone (fades as it goes right, i.e., x increases from bandEnd)
          for (let x = bandEnd; x <= bandEnd + 40; x += dotSpacing) {
            const distance = x - bandEnd; // 0 to 40
            const maxRadius = 3.5;
            // Radius is largest at bandEnd, smallest at bandEnd + 40
            const radius = Math.max(0.5, maxRadius * (1 - distance / 40));
            for (let y = 0; y < size; y += dotSpacing) {
              ctx.beginPath();
              // Offset alternating rows
              const offset =
                (Math.round(y / dotSpacing) % 2) * (dotSpacing / 2);
              ctx.arc(x, y + offset, radius, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          break;
        }
        case "JerseyHexDot": {
          const size = ctx.canvas.width; // assumes square canvas; adjust as needed

          // 1. Base color — uses the user's chosen primary color
          ctx.fillStyle = primaryColor;
          ctx.fillRect(0, 0, size, size);

          // 2. Hex + halftone dot sublimation pattern
          const hexSize = 48;
          const cols = Math.ceil(size / (hexSize * 1.6)) + 2;
          const rows = Math.ceil(size / (hexSize * 1.4)) + 2;

          for (let row = -1; row < rows; row++) {
            for (let col = -1; col < cols; col++) {
              const offsetX = row % 2 === 0 ? 0 : hexSize * 0.9;
              const cx = col * hexSize * 1.7 + offsetX;
              const cy = row * hexSize * 1.35;

              // Subtle hex outline
              ctx.beginPath();
              for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 180) * (60 * i - 30);
                const x = cx + hexSize * 0.82 * Math.cos(angle);
                const y = cy + hexSize * 0.82 * Math.sin(angle);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
              }
              ctx.closePath();
              // Derive a darkened variant of primary for the hex outline
              const hexR = parseInt(primaryColor.slice(1, 3), 16);
              const hexG = parseInt(primaryColor.slice(3, 5), 16);
              const hexB = parseInt(primaryColor.slice(5, 7), 16);
              const dr2 = Math.round(hexR * 0.65);
              const dg2 = Math.round(hexG * 0.65);
              const db2 = Math.round(hexB * 0.65);
              ctx.strokeStyle = `rgba(${dr2}, ${dg2}, ${db2}, 0.5)`;
              ctx.lineWidth = 1.2;
              ctx.stroke();

              // Halftone dots inside each hex cell
              const dotRows = 5;
              const dotCols = 5;
              const dotSpacing = hexSize * 0.32;

              for (let dr = 0; dr < dotRows; dr++) {
                for (let dc = 0; dc < dotCols; dc++) {
                  const dx =
                    cx - ((dotCols - 1) * dotSpacing) / 2 + dc * dotSpacing;
                  const dy =
                    cy - ((dotRows - 1) * dotSpacing) / 2 + dr * dotSpacing;

                  const dist = Math.sqrt((dx - cx) ** 2 + (dy - cy) ** 2);
                  const maxDist = hexSize * 0.75;
                  if (dist > maxDist) continue; // clip to hex boundary

                  const fade = 1 - dist / maxDist;
                  const r = 1.6 * fade + 0.4;

                  ctx.beginPath();
                  ctx.arc(dx, dy, r, 0, Math.PI * 2);
                  // Derive dot color from primary (darkened)
                  const pr = parseInt(primaryColor.slice(1, 3), 16);
                  const pg = parseInt(primaryColor.slice(3, 5), 16);
                  const pb = parseInt(primaryColor.slice(5, 7), 16);
                  const dr3 = Math.round(pr * 0.7);
                  const dg3 = Math.round(pg * 0.7);
                  const db3 = Math.round(pb * 0.7);
                  ctx.fillStyle = `rgba(${dr3}, ${dg3}, ${db3}, ${0.55 * fade + 0.15})`;
                  ctx.fill();
                }
              }
            }
          }

          // 3. Optional radial vignette overlay
          const vignette = ctx.createRadialGradient(
            size / 2,
            size / 2,
            size * 0.2,
            size / 2,
            size / 2,
            size * 0.85,
          );
          vignette.addColorStop(0, "rgba(0,0,0,0)");
          vignette.addColorStop(1, "rgba(0,0,0,0.22)");
          ctx.fillStyle = vignette;
          ctx.fillRect(0, 0, size, size);

          break;
        }

        case "BlueGrungeJersey": {
          const W = ctx.canvas.width;
          const H = ctx.canvas.height;

          // ── Parse primaryColor into RGB components ──────────────────
          const pr = parseInt(primaryColor.slice(1, 3), 16);
          const pg = parseInt(primaryColor.slice(3, 5), 16);
          const pb = parseInt(primaryColor.slice(5, 7), 16);

          // Light side color: blend primary with white (60% white)
          const lr = Math.round(pr * 0.4 + 255 * 0.6);
          const lg = Math.round(pg * 0.4 + 255 * 0.6);
          const lb = Math.round(pb * 0.4 + 255 * 0.6);
          const lightSide = `rgb(${lr}, ${lg}, ${lb})`;

          // Dark center stripe: 45% of primary
          const darkR = Math.round(pr * 0.45);
          const darkG = Math.round(pg * 0.45);
          const darkB = Math.round(pb * 0.45);
          const darkStripe = `rgb(${darkR}, ${darkG}, ${darkB})`;

          // Deep dark: 35% of primary — for triangles, dots, scratches
          const deepR = Math.round(pr * 0.35);
          const deepG = Math.round(pg * 0.35);
          const deepB = Math.round(pb * 0.35);

          // ── 1. BASE BACKGROUND ──────────────────────────────────────
          ctx.fillStyle = primaryColor;
          ctx.fillRect(0, 0, W, H);

          // ── 2. LIGHT SIDE PANELS ─────────────────────────────────────
          ctx.fillStyle = lightSide;
          ctx.fillRect(0, 0, W * 0.38, H);
          ctx.fillRect(W * 0.62, 0, W * 0.38, H);

          // ── 3. RANDOM GRUNGE TRIANGLES (left & right panels) ────────
          const bgjSeed = (s) => {
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
          };

          const drawGrungeTriangles = (areaX, areaW, count, seedOffset) => {
            for (let i = 0; i < count; i++) {
              const r1 = bgjSeed(i * 3 + seedOffset);
              const r2 = bgjSeed(i * 3 + 1 + seedOffset);
              const r3 = bgjSeed(i * 3 + 2 + seedOffset);
              const r4 = bgjSeed(i * 3 + 3 + seedOffset);
              const r5 = bgjSeed(i * 3 + 4 + seedOffset);
              const r6 = bgjSeed(i * 3 + 5 + seedOffset);

              const x1 = areaX + r1 * areaW;
              const y1 = r2 * H;
              const triSize = 40 + r3 * 120;
              const angle = r4 * Math.PI * 2;

              const x2 = x1 + Math.cos(angle) * triSize;
              const y2 = y1 + Math.sin(angle) * triSize;
              const x3 = x1 + Math.cos(angle + 2.3) * triSize * 0.7;
              const y3 = y1 + Math.sin(angle + 2.3) * triSize * 0.7;

              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.lineTo(x3, y3);
              ctx.closePath();

              if (r5 > 0.5) {
                ctx.fillStyle = `rgba(${deepR}, ${deepG}, ${deepB}, 0.75)`;
                ctx.fill();
              } else {
                ctx.strokeStyle = `rgba(${deepR}, ${deepG}, ${deepB}, 0.85)`;
                ctx.lineWidth = 2 + r6 * 4;
                ctx.stroke();
              }

              if (r5 > 0.3) {
                ctx.save();
                ctx.strokeStyle = `rgba(${deepR}, ${deepG}, ${deepB}, 0.5)`;
                ctx.lineWidth = 0.8;
                for (let sc = 0; sc < 5; sc++) {
                  const sx = x1 + (bgjSeed(i * 10 + sc) - 0.5) * triSize;
                  const sy = y1 + (bgjSeed(i * 10 + sc + 1) - 0.5) * triSize;
                  const ex = sx + (bgjSeed(i * 10 + sc + 2) - 0.5) * 30;
                  const ey = sy + (bgjSeed(i * 10 + sc + 3) - 0.5) * 30;
                  ctx.beginPath();
                  ctx.moveTo(sx, sy);
                  ctx.lineTo(ex, ey);
                  ctx.stroke();
                }
                ctx.restore();
              }
            }
          };

          drawGrungeTriangles(0, W * 0.4, 60, 1);
          drawGrungeTriangles(W * 0.6, W * 0.4, 60, 99);

          // ── 4. HALFTONE DOTS (transition zones near center) ─────────
          const drawHalftone = (startX, endX, startY, endY, invertFade) => {
            const spacing = 18;
            for (let hy = startY; hy < endY; hy += spacing) {
              for (let hx = startX; hx < endX; hx += spacing) {
                const distFromCenter = Math.abs(hx - W / 2) / (W / 2);
                const fade = invertFade ? 1 - distFromCenter : distFromCenter;
                const dotR = 6 * fade;
                if (dotR < 0.5) continue;
                ctx.beginPath();
                ctx.arc(hx, hy, dotR, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${deepR}, ${deepG}, ${deepB}, ${0.5 * fade + 0.1})`;
                ctx.fill();
              }
            }
          };

          drawHalftone(0, W, 0, H * 0.15, false);
          drawHalftone(0, W, H * 0.82, H, false);
          drawHalftone(W * 0.3, W * 0.7, 0, H, true);

          // ── 5. CENTER DARK STRIPE ────────────────────────────────────
          const stripeX = W * 0.33;
          const stripeW = W * 0.34;

          ctx.fillStyle = darkStripe;
          ctx.fillRect(stripeX, 0, stripeW, H);

          ctx.save();
          ctx.strokeStyle = `rgba(${darkR}, ${darkG}, ${darkB}, 0.6)`;
          for (let i = 0; i < 120; i++) {
            const sx = stripeX + bgjSeed(i * 2) * stripeW;
            const sy = bgjSeed(i * 2 + 1) * H;
            const len = 40 + bgjSeed(i * 3) * 100;
            const ang = -0.2 + bgjSeed(i * 4) * 0.4;
            ctx.lineWidth = 0.5 + bgjSeed(i * 5) * 1.5;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
            ctx.stroke();
          }
          ctx.restore();

          const leftEdge = ctx.createLinearGradient(
            stripeX - 10,
            0,
            stripeX + 20,
            0,
          );
          leftEdge.addColorStop(0, `rgba(${lr}, ${lg}, ${lb}, 0.0)`);
          leftEdge.addColorStop(1, `rgba(${darkR}, ${darkG}, ${darkB}, 0.9)`);
          ctx.fillStyle = leftEdge;
          ctx.fillRect(stripeX - 10, 0, 30, H);

          const rightEdge = ctx.createLinearGradient(
            stripeX + stripeW - 20,
            0,
            stripeX + stripeW + 10,
            0,
          );
          rightEdge.addColorStop(0, `rgba(${darkR}, ${darkG}, ${darkB}, 0.9)`);
          rightEdge.addColorStop(1, `rgba(${lr}, ${lg}, ${lb}, 0.0)`);
          ctx.fillStyle = rightEdge;
          ctx.fillRect(stripeX + stripeW - 20, 0, 30, H);

          // ── 6. VIGNETTE ───────────────────────────────────────────
          const vig = ctx.createRadialGradient(
            W / 2,
            H / 2,
            H * 0.2,
            W / 2,
            H / 2,
            H * 0.9,
          );
          vig.addColorStop(0, "rgba(0,0,0,0)");
          vig.addColorStop(1, "rgba(0,0,0,0.25)");
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, W, H);

          break;
        }

        case "GreenChevronJersey": {
          const W = ctx.canvas.width;
          const H = ctx.canvas.height;

          // ── Parse primaryColor into RGB for dynamic shades ──────────
          const gcR = parseInt(primaryColor.slice(1, 3), 16);
          const gcG = parseInt(primaryColor.slice(3, 5), 16);
          const gcB = parseInt(primaryColor.slice(5, 7), 16);

          // Dark chevron outline: 40% of primary
          const dkR = Math.round(gcR * 0.4);
          const dkG = Math.round(gcG * 0.4);
          const dkB = Math.round(gcB * 0.4);

          // Deeper dark for halftone / small chevrons: 30%
          const dpR = Math.round(gcR * 0.3);
          const dpG = Math.round(gcG * 0.3);
          const dpB = Math.round(gcB * 0.3);

          // ── 1. BASE BACKGROUND ──────────────────────────────────────
          ctx.fillStyle = primaryColor;
          ctx.fillRect(0, 0, W, H);

          // ── 2. CHEVRON / ZIGZAG PATTERN ─────────────────────────────
          const chevW = 48;
          const chevH = 28;
          const cols = Math.ceil(W / chevW) + 2;
          const rows = Math.ceil(H / chevH) + 2;

          for (let row = 0; row < rows; row++) {
            for (let col = -1; col < cols; col++) {
              const cx = col * chevW;
              const cy = row * chevH;

              ctx.beginPath();
              ctx.moveTo(cx, cy + chevH);
              ctx.lineTo(cx + chevW / 2, cy);
              ctx.lineTo(cx + chevW, cy + chevH);
              ctx.strokeStyle = `rgba(${dkR}, ${dkG}, ${dkB}, 0.55)`;
              ctx.lineWidth = 2.2;
              ctx.lineJoin = "round";
              ctx.stroke();

              const tickCount = 6;
              for (let t = 1; t <= tickCount; t++) {
                const frac = t / (tickCount + 1);
                const tx = cx + frac * (chevW / 2);
                const ty = cy + chevH - frac * chevH;
                const tickLen = (1 - frac) * (chevH * 0.55) + 2;
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(tx, ty + tickLen);
                ctx.strokeStyle = `rgba(${dkR}, ${dkG}, ${dkB}, ${0.25 + frac * 0.2})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
              }
              for (let t = 1; t <= tickCount; t++) {
                const frac = t / (tickCount + 1);
                const tx = cx + chevW / 2 + frac * (chevW / 2);
                const ty = cy + frac * chevH;
                const tickLen = frac * (chevH * 0.55) + 2;
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(tx, ty + tickLen);
                ctx.strokeStyle = `rgba(${dkR}, ${dkG}, ${dkB}, ${0.45 - frac * 0.2})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
              }
            }
          }

          // ── 3. SECONDARY SMALLER CHEVRON LAYER (depth effect) ───────
          const sChevW = 24;
          const sChevH = 14;
          const sCols = Math.ceil(W / sChevW) + 2;
          const sRows = Math.ceil(H / sChevH) + 2;

          for (let sRow = 0; sRow < sRows; sRow++) {
            for (let sCol = -1; sCol < sCols; sCol++) {
              const sx = sCol * sChevW + (sRow % 2 === 0 ? 0 : sChevW / 2);
              const sy = sRow * sChevH;
              ctx.beginPath();
              ctx.moveTo(sx, sy + sChevH);
              ctx.lineTo(sx + sChevW / 2, sy);
              ctx.lineTo(sx + sChevW, sy + sChevH);
              ctx.strokeStyle = `rgba(${dpR}, ${dpG}, ${dpB}, 0.18)`;
              ctx.lineWidth = 1.0;
              ctx.lineJoin = "round";
              ctx.stroke();
            }
          }

          // ── 4. HALFTONE FADE OVERLAY (bottom corners) ───────────────
          const dotSpacing = 14;
          for (let hy = 0; hy < H; hy += dotSpacing) {
            for (let hx = 0; hx < W; hx += dotSpacing) {
              const distLeft = Math.sqrt(hx ** 2 + (H - hy) ** 2);
              const distRight = Math.sqrt((W - hx) ** 2 + (H - hy) ** 2);
              const minDist = Math.min(distLeft, distRight);
              const maxDist = Math.sqrt((W / 2) ** 2 + H ** 2);
              const fade = 1 - Math.min(minDist / (maxDist * 0.65), 1);
              if (fade < 0.05) continue;
              const dotR = 3.5 * fade;
              ctx.beginPath();
              ctx.arc(hx, hy, dotR, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${dpR}, ${dpG}, ${dpB}, ${fade * 0.35})`;
              ctx.fill();
            }
          }

          // ── 5. CENTER VERTICAL SUBTLE LIGHTER STRIP ─────────────────
          const centerGrad = ctx.createLinearGradient(W * 0.35, 0, W * 0.65, 0);
          centerGrad.addColorStop(0, "rgba(255,255,255,0)");
          centerGrad.addColorStop(0.5, "rgba(255,255,255,0.08)");
          centerGrad.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = centerGrad;
          ctx.fillRect(0, 0, W, H);

          // ── 6. VIGNETTE ──────────────────────────────────────────────
          const gcVig = ctx.createRadialGradient(
            W / 2,
            H / 2,
            H * 0.25,
            W / 2,
            H / 2,
            H * 0.85,
          );
          gcVig.addColorStop(0, "rgba(0,0,0,0)");
          gcVig.addColorStop(1, "rgba(0,0,0,0.15)");
          ctx.fillStyle = gcVig;
          ctx.fillRect(0, 0, W, H);

          break;
        }

        case "RedCarbonJersey": {
          const W = ctx.canvas.width;
          const H = ctx.canvas.height;

          // Parse primaryColor
          const rcR = parseInt(primaryColor.slice(1, 3), 16) || 0;
          const rcG = parseInt(primaryColor.slice(3, 5), 16) || 0;
          const rcB = parseInt(primaryColor.slice(5, 7), 16) || 0;

          // Dark base (10% of primary)
          const baseR = Math.round(rcR * 0.1);
          const baseG = Math.round(rcG * 0.1);
          const baseB = Math.round(rcB * 0.1);
          ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
          ctx.fillRect(0, 0, W, H);

          // Carbon fiber weave
          const tileSize = 16;
          for (let y = 0; y < H; y += tileSize) {
            for (let x = 0; x < W; x += tileSize) {
              const isEven = (x / tileSize + y / tileSize) % 2 === 0;

              // Horizontal fiber
              const hGrad = ctx.createLinearGradient(x, y, x, y + tileSize / 2);
              const h0 = isEven ? 0.7 : 0.45;
              const h1 = isEven ? 0.85 : 0.6;
              const h2 = isEven ? 0.6 : 0.4;

              hGrad.addColorStop(
                0,
                `rgba(${Math.round(rcR * h0)}, ${Math.round(rcG * h0)}, ${Math.round(rcB * h0)}, 0.9)`,
              );
              hGrad.addColorStop(
                0.5,
                `rgba(${Math.round(rcR * h1)}, ${Math.round(rcG * h1)}, ${Math.round(rcB * h1)}, 1)`,
              );
              hGrad.addColorStop(
                1,
                `rgba(${Math.round(rcR * h2)}, ${Math.round(rcG * h2)}, ${Math.round(rcB * h2)}, 0.8)`,
              );
              ctx.fillStyle = hGrad;
              ctx.fillRect(x, y, tileSize, tileSize / 2);

              // Vertical fiber
              const vGrad = ctx.createLinearGradient(
                x,
                y + tileSize / 2,
                x,
                y + tileSize,
              );
              const v0 = isEven ? 0.45 : 0.7;
              const v1 = isEven ? 0.6 : 0.85;
              const v2 = isEven ? 0.4 : 0.6;

              vGrad.addColorStop(
                0,
                `rgba(${Math.round(rcR * v0)}, ${Math.round(rcG * v0)}, ${Math.round(rcB * v0)}, 0.9)`,
              );
              vGrad.addColorStop(
                0.5,
                `rgba(${Math.round(rcR * v1)}, ${Math.round(rcG * v1)}, ${Math.round(rcB * v1)}, 1)`,
              );
              vGrad.addColorStop(
                1,
                `rgba(${Math.round(rcR * v2)}, ${Math.round(rcG * v2)}, ${Math.round(rcB * v2)}, 0.8)`,
              );
              ctx.fillStyle = vGrad;
              ctx.fillRect(x, y + tileSize / 2, tileSize, tileSize / 2);

              // Grid lines
              ctx.strokeStyle = "rgba(0,0,0,0.8)";
              ctx.lineWidth = 0.8;
              ctx.strokeRect(x, y, tileSize, tileSize / 2);
              ctx.strokeRect(x, y + tileSize / 2, tileSize, tileSize / 2);
            }
          }

          // Diagonal speed slash — left
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, H * 0.3);
          ctx.lineTo(W * 0.45, 0);
          ctx.lineTo(W * 0.55, 0);
          ctx.lineTo(W * 0.1, H);
          ctx.lineTo(0, H);
          ctx.closePath();
          const slashL = ctx.createLinearGradient(0, 0, W * 0.5, 0);
          slashL.addColorStop(0, `rgba(${rcR}, ${rcG}, ${rcB}, 0.22)`);
          slashL.addColorStop(1, `rgba(${rcR}, ${rcG}, ${rcB}, 0)`);
          ctx.fillStyle = slashL;
          ctx.fill();
          ctx.restore();

          // Diagonal speed slash — right
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(W, H * 0.3);
          ctx.lineTo(W * 0.55, 0);
          ctx.lineTo(W * 0.45, 0);
          ctx.lineTo(W * 0.9, H);
          ctx.lineTo(W, H);
          ctx.closePath();
          const slashR = ctx.createLinearGradient(W, 0, W * 0.5, 0);
          slashR.addColorStop(0, `rgba(${rcR}, ${rcG}, ${rcB}, 0.22)`);
          slashR.addColorStop(1, `rgba(${rcR}, ${rcG}, ${rcB}, 0)`);
          ctx.fillStyle = slashR;
          ctx.fill();
          ctx.restore();

          // Horizontal scan lines
          for (let y = 0; y < H; y += 3) {
            ctx.fillStyle = "rgba(0,0,0,0.12)";
            ctx.fillRect(0, y, W, 1);
          }

          // Center bright stripe
          const centerGlow = ctx.createLinearGradient(W * 0.42, 0, W * 0.58, 0);
          const glowColorStr = `rgba(${Math.min(255, rcR + 30)}, ${Math.min(255, rcG + 30)}, ${Math.min(255, rcB + 30)}, 0.12)`;
          centerGlow.addColorStop(0, "rgba(255,255,255,0)");
          centerGlow.addColorStop(0.5, glowColorStr);
          centerGlow.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = centerGlow;
          ctx.fillRect(0, 0, W, H);

          // Vignette
          const vig = ctx.createRadialGradient(
            W / 2,
            H / 2,
            H * 0.15,
            W / 2,
            H / 2,
            H * 0.9,
          );
          vig.addColorStop(0, "rgba(0,0,0,0)");
          vig.addColorStop(1, "rgba(0,0,0,0.55)");
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, W, H);

          break;
        }

        case "GoldDiamondJersey": {
          const W = ctx.canvas.width;
          const H = ctx.canvas.height;

          // Parse primaryColor
          const gdR = parseInt(primaryColor.slice(1, 3), 16) || 0;
          const gdG = parseInt(primaryColor.slice(3, 5), 16) || 0;
          const gdB = parseInt(primaryColor.slice(5, 7), 16) || 0;

          const gdSeed = (s) => {
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
          };

          // Deep base (10% of primary)
          ctx.fillStyle = `rgb(${Math.round(gdR * 0.1)}, ${Math.round(gdG * 0.1)}, ${Math.round(gdB * 0.1)})`;
          ctx.fillRect(0, 0, W, H);

          // Diamond grid (accent colors derived from primary)
          const dSize = 36;
          const cols = Math.ceil(W / dSize) + 2;
          const rows = Math.ceil(H / (dSize * 0.5)) + 2;

          for (let row = -1; row < rows; row++) {
            for (let col = -1; col < cols; col++) {
              const cx = col * dSize + (row % 2 === 0 ? 0 : dSize / 2);
              const cy = row * dSize * 0.5;

              // Diamond shape
              ctx.beginPath();
              ctx.moveTo(cx, cy - dSize * 0.45); // top
              ctx.lineTo(cx + dSize * 0.45, cy); // right
              ctx.lineTo(cx, cy + dSize * 0.45); // bottom
              ctx.lineTo(cx - dSize * 0.45, cy); // left
              ctx.closePath();

              const dGrad = ctx.createRadialGradient(
                cx,
                cy,
                0,
                cx,
                cy,
                dSize * 0.45,
              );
              dGrad.addColorStop(0, `rgba(${gdR}, ${gdG}, ${gdB}, 0.18)`);
              dGrad.addColorStop(
                0.6,
                `rgba(${Math.round(gdR * 0.8)}, ${Math.round(gdG * 0.8)}, ${Math.round(gdB * 0.8)}, 0.10)`,
              );
              dGrad.addColorStop(
                1,
                `rgba(${Math.round(gdR * 0.6)}, ${Math.round(gdG * 0.6)}, ${Math.round(gdB * 0.6)}, 0.05)`,
              );
              ctx.fillStyle = dGrad;
              ctx.fill();

              ctx.strokeStyle = `rgba(${gdR}, ${gdG}, ${gdB}, 0.40)`;
              ctx.lineWidth = 0.9;
              ctx.stroke();

              // Inner small diamond
              ctx.beginPath();
              ctx.moveTo(cx, cy - dSize * 0.18);
              ctx.lineTo(cx + dSize * 0.18, cy);
              ctx.lineTo(cx, cy + dSize * 0.18);
              ctx.lineTo(cx - dSize * 0.18, cy);
              ctx.closePath();
              ctx.strokeStyle = `rgba(${gdR}, ${gdG}, ${gdB}, 0.25)`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }

          // Scattered flare dots
          for (let i = 0; i < 200; i++) {
            const x = gdSeed(i * 7) * W;
            const y = gdSeed(i * 7 + 1) * H;
            const r = gdSeed(i * 7 + 2) * 1.8 + 0.3;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${gdR}, ${gdG}, ${gdB}, ${0.1 + gdSeed(i * 7 + 3) * 0.35})`;
            ctx.fill();
          }

          // Left diagonal band
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(W * 0.18, 0);
          ctx.lineTo(0, H * 0.35);
          ctx.closePath();
          const bandL = ctx.createLinearGradient(0, 0, W * 0.18, H * 0.35);
          bandL.addColorStop(0, `rgba(${gdR}, ${gdG}, ${gdB}, 0.35)`);
          bandL.addColorStop(1, `rgba(${gdR}, ${gdG}, ${gdB}, 0)`);
          ctx.fillStyle = bandL;
          ctx.fill();
          ctx.restore();

          // Right diagonal band
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(W, 0);
          ctx.lineTo(W * 0.82, 0);
          ctx.lineTo(W, H * 0.35);
          ctx.closePath();
          const bandR = ctx.createLinearGradient(W, 0, W * 0.82, H * 0.35);
          bandR.addColorStop(0, `rgba(${gdR}, ${gdG}, ${gdB}, 0.35)`);
          bandR.addColorStop(1, `rgba(${gdR}, ${gdG}, ${gdB}, 0)`);
          ctx.fillStyle = bandR;
          ctx.fill();
          ctx.restore();

          // Bottom shimmer
          const bottomShimmer = ctx.createLinearGradient(0, H * 0.7, 0, H);
          bottomShimmer.addColorStop(0, `rgba(${gdR}, ${gdG}, ${gdB}, 0)`);
          bottomShimmer.addColorStop(1, `rgba(${gdR}, ${gdG}, ${gdB}, 0.12)`);
          ctx.fillStyle = bottomShimmer;
          ctx.fillRect(0, H * 0.7, W, H * 0.3);

          // Vignette
          const vig = ctx.createRadialGradient(
            W / 2,
            H * 0.4,
            H * 0.1,
            W / 2,
            H / 2,
            H * 0.9,
          );
          vig.addColorStop(0, "rgba(0,0,0,0)");
          vig.addColorStop(1, "rgba(0,0,0,0.6)");
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, W, H);

          break;
        }

        case "PurpleHexTechJersey": {
          const W = ctx.canvas.width;
          const H = ctx.canvas.height;

          // Parse primaryColor
          const phR = parseInt(primaryColor.slice(1, 3), 16) || 0;
          const phG = parseInt(primaryColor.slice(3, 5), 16) || 0;
          const phB = parseInt(primaryColor.slice(5, 7), 16) || 0;

          const phSeed = (s) => {
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
          };

          // Dark base (10% of primary)
          ctx.fillStyle = `rgb(${Math.round(phR * 0.1)}, ${Math.round(phG * 0.1)}, ${Math.round(phB * 0.1)})`;
          ctx.fillRect(0, 0, W, H);

          // Hex grid
          const hexR = 28;
          const hexW = hexR * 2;
          const hexH = Math.sqrt(3) * hexR;
          const cols = Math.ceil(W / (hexW * 0.75)) + 2;
          const rows = Math.ceil(H / hexH) + 2;

          const hexPath = (cx, cy, r) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i - Math.PI / 6;
              const px = cx + r * Math.cos(angle);
              const py = cy + r * Math.sin(angle);
              if (i === 0) {
                ctx.moveTo(px, py);
              } else {
                ctx.lineTo(px, py);
              }
            }
            ctx.closePath();
          };

          for (let row = -1; row < rows; row++) {
            for (let col = -1; col < cols; col++) {
              const cx = col * hexW * 0.75;
              const cy = row * hexH + (col % 2 === 0 ? 0 : hexH / 2);

              // Outer hex
              hexPath(cx, cy, hexR * 0.92);
              const hGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, hexR);
              hGrad.addColorStop(0, `rgba(${phR}, ${phG}, ${phB}, 0.12)`);
              hGrad.addColorStop(
                1,
                `rgba(${Math.round(phR * 0.5)}, ${Math.round(phG * 0.5)}, ${Math.round(phB * 0.5)}, 0.04)`,
              );
              ctx.fillStyle = hGrad;
              ctx.fill();
              ctx.strokeStyle = `rgba(${phR}, ${phG}, ${phB}, 0.45)`;
              ctx.lineWidth = 0.9;
              ctx.stroke();

              // Inner hex
              hexPath(cx, cy, hexR * 0.55);
              ctx.strokeStyle = `rgba(${phR}, ${phG}, ${phB}, 0.20)`;
              ctx.lineWidth = 0.5;
              ctx.stroke();

              // Center dot — random intensity
              const intensity = phSeed(row * 100 + col);
              if (intensity > 0.6) {
                ctx.beginPath();
                ctx.arc(
                  cx,
                  cy,
                  2.5 * (intensity - 0.6) * 2.5 + 0.5,
                  0,
                  Math.PI * 2,
                );
                ctx.fillStyle = `rgba(${phR}, ${phG}, ${phB}, ${(intensity - 0.6) * 1.5})`;
                ctx.fill();
              }
            }
          }

          // Diagonal light streaks
          for (let i = 0; i < 8; i++) {
            const sx = phSeed(i * 4) * W;
            const angle = -0.6 + phSeed(i * 4 + 1) * 0.3;
            const len = H * 1.5;
            const thick = 1 + phSeed(i * 4 + 2) * 3;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx + Math.tan(angle) * len, len);
            ctx.strokeStyle = `rgba(${phR}, ${phG}, ${phB}, ${0.05 + phSeed(i * 4 + 3) * 0.12})`;
            ctx.lineWidth = thick;
            ctx.stroke();
            ctx.restore();
          }

          // Bottom to top gradient glow
          const glow = ctx.createLinearGradient(0, H, 0, 0);
          glow.addColorStop(0, `rgba(${phR}, ${phG}, ${phB}, 0.30)`);
          glow.addColorStop(0.5, `rgba(${phR}, ${phG}, ${phB}, 0.08)`);
          glow.addColorStop(1, `rgba(${phR}, ${phG}, ${phB}, 0.0)`);
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, W, H);

          // Horizontal scan lines
          for (let y = 0; y < H; y += 4) {
            ctx.fillStyle = "rgba(0,0,0,0.08)";
            ctx.fillRect(0, y, W, 1.5);
          }

          // Vignette
          const vig = ctx.createRadialGradient(
            W / 2,
            H / 2,
            H * 0.1,
            W / 2,
            H / 2,
            H * 0.85,
          );
          vig.addColorStop(0, "rgba(0,0,0,0)");
          vig.addColorStop(1, "rgba(0,0,0,0.65)");
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, W, H);

          break;
        }

        case "OrangeCamoWaveJersey": {
          const W = ctx.canvas.width;
          const H = ctx.canvas.height;

          // Parse primaryColor
          const ocR = parseInt(primaryColor.slice(1, 3), 16) || 0;
          const ocG = parseInt(primaryColor.slice(3, 5), 16) || 0;
          const ocB = parseInt(primaryColor.slice(5, 7), 16) || 0;

          const ocSeed = (s) => {
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
          };

          // Deep base (15% of primary)
          ctx.fillStyle = `rgb(${Math.round(ocR * 0.15)}, ${Math.round(ocG * 0.15)}, ${Math.round(ocB * 0.15)})`;
          ctx.fillRect(0, 0, W, H);

          // Wavy camo blobs
          const camoColors = [
            `rgba(${ocR}, ${ocG}, ${ocB}, 0.55)`,
            `rgba(${Math.round(ocR * 0.85)}, ${Math.round(ocG * 0.85)}, ${Math.round(ocB * 0.85)}, 0.45)`,
            `rgba(${Math.min(255, Math.round(ocR * 1.15))}, ${Math.min(255, Math.round(ocG * 1.15))}, ${Math.min(255, Math.round(ocB * 1.15))}, 0.35)`,
            `rgba(${Math.round(ocR * 0.7)}, ${Math.round(ocG * 0.7)}, ${Math.round(ocB * 0.7)}, 0.50)`,
            `rgba(${Math.min(255, Math.round(ocR * 1.05))}, ${Math.min(255, Math.round(ocG * 1.05))}, ${Math.min(255, Math.round(ocB * 1.05))}, 0.40)`,
          ];

          for (let i = 0; i < 55; i++) {
            const cx = ocSeed(i * 5) * W;
            const cy = ocSeed(i * 5 + 1) * H;
            const rx = 30 + ocSeed(i * 5 + 2) * 100;
            const ry = 20 + ocSeed(i * 5 + 3) * 70;
            const rot = ocSeed(i * 5 + 4) * Math.PI;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rot);

            ctx.beginPath();
            const pts = 7;
            for (let p = 0; p < pts; p++) {
              const a = (p / pts) * Math.PI * 2;
              const jitter = 0.6 + ocSeed(i * 20 + p) * 0.8;
              const bx = Math.cos(a) * rx * jitter;
              const by = Math.sin(a) * ry * jitter;
              const cpx = Math.cos(a - 0.4) * rx * (jitter + 0.2);
              const cpy = Math.sin(a - 0.4) * ry * (jitter + 0.2);
              if (p === 0) {
                ctx.moveTo(bx, by);
              } else {
                ctx.quadraticCurveTo(cpx, cpy, bx, by);
              }
            }
            ctx.closePath();
            ctx.fillStyle = camoColors[i % camoColors.length];
            ctx.fill();
            ctx.restore();
          }

          // Horizontal wave lines
          for (let y = 0; y < H; y += 10) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x <= W; x += 8) {
              const waveY = y + Math.sin((x / W) * Math.PI * 6 + y * 0.05) * 3;
              ctx.lineTo(x, waveY);
            }
            ctx.strokeStyle = `rgba(${ocR}, ${ocG}, ${ocB}, ${0.04 + (y / H) * 0.06})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }

          // Scattered pixel noise
          for (let i = 0; i < 800; i++) {
            const px = ocSeed(i * 3) * W;
            const py = ocSeed(i * 3 + 1) * H;
            const ps = ocSeed(i * 3 + 2) * 2.5 + 0.5;
            ctx.fillStyle = `rgba(${ocR}, ${ocG}, ${ocB}, ${ocSeed(i * 3 + 3) * 0.3})`;
            ctx.fillRect(px, py, ps, ps);
          }

          // Two diagonal dark slash bands
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(W * 0.25, 0);
          ctx.lineTo(W * 0.35, 0);
          ctx.lineTo(W * 0.1, H);
          ctx.lineTo(0, H);
          ctx.closePath();
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fill();
          ctx.restore();

          // Another diagonal dark slash band
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(W * 0.65, 0);
          ctx.lineTo(W * 0.75, 0);
          ctx.lineTo(W * 0.9, H);
          ctx.lineTo(W * 1.0, H);
          ctx.closePath();
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fill();
          ctx.restore();

          // Glow center
          const glowCenter = ctx.createRadialGradient(
            W / 2,
            H * 0.45,
            0,
            W / 2,
            H * 0.45,
            W * 0.55,
          );
          glowCenter.addColorStop(0, `rgba(${ocR}, ${ocG}, ${ocB}, 0.18)`);
          glowCenter.addColorStop(1, `rgba(${ocR}, ${ocG}, ${ocB}, 0)`);
          ctx.fillStyle = glowCenter;
          ctx.fillRect(0, 0, W, H);

          // Vignette
          const vig = ctx.createRadialGradient(
            W / 2,
            H / 2,
            H * 0.15,
            W / 2,
            H / 2,
            H * 0.9,
          );
          vig.addColorStop(0, "rgba(0,0,0,0)");
          vig.addColorStop(1, "rgba(0,0,0,0.60)");
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, W, H);

          break;
        }

        // ============================================================
        // 1. RED SHARD ENERGY JERSEY
        // ============================================================

        case "RedShardEnergy": {
          const W = ctx.canvas.width;
          const H = ctx.canvas.height;

          // Parse primaryColor
          const rcR = parseInt(primaryColor.slice(1, 3), 16) || 0;
          const rcG = parseInt(primaryColor.slice(3, 5), 16) || 0;
          const rcB = parseInt(primaryColor.slice(5, 7), 16) || 0;

          // Base (20% of primary)
          ctx.fillStyle = `rgb(${Math.round(rcR * 0.2)}, ${Math.round(rcG * 0.2)}, ${Math.round(rcB * 0.2)})`;
          ctx.fillRect(0, 0, W, H);

          // Side panels
          const sideGrad = ctx.createLinearGradient(0, 0, W, 0);
          sideGrad.addColorStop(0, `rgb(${rcR}, ${rcG}, ${rcB})`);
          sideGrad.addColorStop(
            0.5,
            `rgb(${Math.round(rcR * 0.35)}, ${Math.round(rcG * 0.35)}, ${Math.round(rcB * 0.35)})`,
          );
          sideGrad.addColorStop(1, `rgb(${rcR}, ${rcG}, ${rcB})`);
          ctx.fillStyle = sideGrad;
          ctx.fillRect(0, 0, W, H);

          // Central dark strip
          ctx.fillStyle = `rgb(${Math.round(rcR * 0.12)}, ${Math.round(rcG * 0.12)}, ${Math.round(rcB * 0.12)})`;
          ctx.fillRect(W * 0.32, 0, W * 0.36, H);

          // Random angular shards
          for (let i = 0; i < 120; i++) {
            const x = Math.random() * W;
            const y = Math.random() * H;
            const size = 20 + Math.random() * 120;
            const angle = Math.random() * Math.PI * 2;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
            ctx.lineTo(
              x + Math.cos(angle + 0.8) * size * 0.5,
              y + Math.sin(angle + 0.8) * size * 0.5,
            );
            ctx.closePath();

            if (Math.random() > 0.5) {
              ctx.fillStyle = "rgba(255,255,255,0.08)";
              ctx.fill();
            } else {
              ctx.strokeStyle = "rgba(255,255,255,0.12)";
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }

          // Energy streaks
          ctx.save();
          ctx.strokeStyle = `rgba(${Math.min(255, rcR + 50)}, ${Math.min(255, rcG + 50)}, ${Math.min(255, rcB + 50)}, 0.18)`;
          for (let i = 0; i < 80; i++) {
            const x = Math.random() * W;
            ctx.lineWidth = 1 + Math.random() * 2;

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + 100, H);
            ctx.stroke();
          }
          ctx.restore();

          // Vignette
          const vg = ctx.createRadialGradient(
            W / 2,
            H / 2,
            H * 0.2,
            W / 2,
            H / 2,
            H,
          );
          vg.addColorStop(0, "rgba(0,0,0,0)");
          vg.addColorStop(1, "rgba(0,0,0,0.4)");

          ctx.fillStyle = vg;
          ctx.fillRect(0, 0, W, H);

          break;
        }

        // ============================================================
        // 2. NEON CYBER GRID JERSEY
        // ============================================================

        case "NeonCyberGrid": {
          const W = ctx.canvas.width;
          const H = ctx.canvas.height;

          // Parse primaryColor
          const ncR = parseInt(primaryColor.slice(1, 3), 16) || 0;
          const ncG = parseInt(primaryColor.slice(3, 5), 16) || 0;
          const ncB = parseInt(primaryColor.slice(5, 7), 16) || 0;

          // Background (extremely dark primary blend)
          ctx.fillStyle = `rgb(${Math.round(ncR * 0.05 + 5)}, ${Math.round(ncG * 0.05 + 10)}, ${Math.round(ncB * 0.05 + 20)})`;
          ctx.fillRect(0, 0, W, H);

          // Neon side glow
          const glow = ctx.createLinearGradient(0, 0, W, 0);
          glow.addColorStop(0, `rgb(${ncR}, ${ncG}, ${ncB})`);
          glow.addColorStop(
            0.5,
            `rgb(${Math.round(ncR * 0.05 + 5)}, ${Math.round(ncG * 0.05 + 10)}, ${Math.round(ncB * 0.05 + 20)})`,
          );
          glow.addColorStop(
            1,
            `rgb(${Math.min(255, ncR + 80)}, ${Math.min(255, ncG + 80)}, ${Math.min(255, ncB + 80)})`,
          ); // Lighter tint of primary

          ctx.fillStyle = glow;
          ctx.globalAlpha = 0.18;
          ctx.fillRect(0, 0, W, H);
          ctx.globalAlpha = 1;

          // Grid lines
          ctx.strokeStyle = `rgba(${ncR}, ${ncG}, ${ncB}, 0.08)`;
          ctx.lineWidth = 1;

          for (let x = 0; x < W; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
          }

          for (let y = 0; y < H; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
          }

          // Hexagon pattern helper
          const drawHex = (hx, hy, hr) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const a = (Math.PI / 3) * i;
              const px = hx + Math.cos(a) * hr;
              const py = hy + Math.sin(a) * hr;
              if (i === 0) {
                ctx.moveTo(px, py);
              } else {
                ctx.lineTo(px, py);
              }
            }
            ctx.closePath();
          };

          for (let y = 0; y < H; y += 70) {
            for (let x = 0; x < W; x += 70) {
              drawHex(x, y, 24);

              ctx.strokeStyle =
                Math.random() > 0.5
                  ? `rgba(${ncR}, ${ncG}, ${ncB}, 0.14)`
                  : `rgba(${Math.min(255, ncR + 80)}, ${Math.min(255, ncG + 80)}, ${Math.min(255, ncB + 80)}, 0.14)`;

              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }

          // Center stripe
          ctx.fillStyle = "rgba(255,255,255,0.04)";
          ctx.fillRect(W * 0.42, 0, W * 0.16, H);

          break;
        }

        // ============================================================
        // 3. GREEN TOXIC SMOKE JERSEY
        // ============================================================

        case "GreenToxicSmoke": {
          const W = ctx.canvas.width;
          const H = ctx.canvas.height;

          // Parse primaryColor
          const tsR = parseInt(primaryColor.slice(1, 3), 16) || 0;
          const tsG = parseInt(primaryColor.slice(3, 5), 16) || 0;
          const tsB = parseInt(primaryColor.slice(5, 7), 16) || 0;

          // Base (10% of primary)
          ctx.fillStyle = `rgb(${Math.round(tsR * 0.1)}, ${Math.round(tsG * 0.1)}, ${Math.round(tsB * 0.1)})`;
          ctx.fillRect(0, 0, W, H);

          // Toxic gradients
          const grad = ctx.createLinearGradient(0, 0, W, H);
          grad.addColorStop(
            0,
            `rgb(${Math.min(255, Math.round(tsR * 1.3))}, ${Math.min(255, Math.round(tsG * 1.3))}, ${Math.min(255, Math.round(tsB * 1.3))})`,
          );
          grad.addColorStop(
            0.5,
            `rgb(${Math.round(tsR * 0.18)}, ${Math.round(tsG * 0.18)}, ${Math.round(tsB * 0.18)})`,
          );
          grad.addColorStop(
            1,
            `rgb(${Math.min(255, Math.round(tsR * 1.1))}, ${Math.min(255, Math.round(tsG * 1.1))}, ${Math.min(255, Math.round(tsB * 1.1))})`,
          );

          ctx.globalAlpha = 0.25;
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
          ctx.globalAlpha = 1;

          // Smoke blobs
          for (let i = 0; i < 80; i++) {
            const x = Math.random() * W;
            const y = Math.random() * H;
            const r = 40 + Math.random() * 140;

            const smoke = ctx.createRadialGradient(x, y, 0, x, y, r);
            smoke.addColorStop(0, `rgba(${tsR}, ${tsG}, ${tsB}, 0.18)`);
            smoke.addColorStop(1, `rgba(${tsR}, ${tsG}, ${tsB}, 0)`);

            ctx.fillStyle = smoke;

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          }

          // Acid scratches
          ctx.strokeStyle = `rgba(${Math.min(255, tsR + 80)}, ${Math.min(255, tsG + 80)}, ${Math.min(255, tsB + 80)}, 0.15)`;

          for (let i = 0; i < 150; i++) {
            const x = Math.random() * W;
            const y = Math.random() * H;

            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(
              x + (Math.random() - 0.5) * 120,
              y + (Math.random() - 0.5) * 120,
            );
            ctx.stroke();
          }

          // Dark center panel
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fillRect(W * 0.3, 0, W * 0.4, H);

          break;
        }

        // ============================================================
        // 4. PURPLE WAVE MOTION JERSEY
        // ============================================================

        case "PurpleWaveMotion": {
          const W = ctx.canvas.width;
          const H = ctx.canvas.height;

          // Parse primaryColor
          const wmR = parseInt(primaryColor.slice(1, 3), 16) || 0;
          const wmG = parseInt(primaryColor.slice(3, 5), 16) || 0;
          const wmB = parseInt(primaryColor.slice(5, 7), 16) || 0;

          // Background (8% of primary)
          ctx.fillStyle = `rgb(${Math.round(wmR * 0.08)}, ${Math.round(wmG * 0.08)}, ${Math.round(wmB * 0.08)})`;
          ctx.fillRect(0, 0, W, H);

          // Side lighting
          const lg = ctx.createLinearGradient(0, 0, W, 0);
          lg.addColorStop(0, `rgb(${wmR}, ${wmG}, ${wmB})`);
          lg.addColorStop(
            0.5,
            `rgb(${Math.round(wmR * 0.08)}, ${Math.round(wmG * 0.08)}, ${Math.round(wmB * 0.08)})`,
          );
          lg.addColorStop(
            1,
            `rgb(${Math.min(255, wmR + 80)}, ${Math.min(255, wmG + 80)}, ${Math.min(255, wmB + 80)})`,
          ); // Lighter tint of primary

          ctx.globalAlpha = 0.3;
          ctx.fillStyle = lg;
          ctx.fillRect(0, 0, W, H);
          ctx.globalAlpha = 1;

          // Flowing waves
          for (let i = 0; i < 18; i++) {
            const offset = i * 40;

            ctx.beginPath();

            for (let x = 0; x <= W; x += 10) {
              const y = H / 2 + Math.sin((x + offset) * 0.015) * 40 + i * 18;

              if (x === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }

            ctx.strokeStyle =
              i % 2 === 0
                ? "rgba(255,255,255,0.08)"
                : `rgba(${Math.min(255, wmR + 80)}, ${Math.min(255, wmG + 80)}, ${Math.min(255, wmB + 80)}, 0.12)`;

            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Dots overlay
          for (let i = 0; i < 500; i++) {
            const x = Math.random() * W;
            const y = Math.random() * H;

            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);

            ctx.fillStyle = "rgba(255,255,255,0.12)";
            ctx.fill();
          }

          // Vertical center fade
          const center = ctx.createLinearGradient(W * 0.3, 0, W * 0.7, 0);

          center.addColorStop(0, "rgba(0,0,0,0)");
          center.addColorStop(0.5, "rgba(255,255,255,0.05)");
          center.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = center;
          ctx.fillRect(0, 0, W, H);

          break;
        }

        case "FlameStripeJersey": {
          const W = ctx.canvas.width;
          const H = ctx.canvas.height;

          // Parse primaryColor
          const fsR = parseInt(primaryColor.slice(1, 3), 16) || 0;
          const fsG = parseInt(primaryColor.slice(3, 5), 16) || 0;
          const fsB = parseInt(primaryColor.slice(5, 7), 16) || 0;

          // Derived colors
          const lightBase = `rgb(${Math.min(255, Math.round(fsR * 0.12 + 230))}, ${Math.min(255, Math.round(fsG * 0.12 + 235))}, ${Math.min(255, Math.round(fsB * 0.12 + 240))})`;
          const spikeColor = `rgb(${fsR}, ${fsG}, ${fsB})`; // primary color spikes
          const darkColor = `rgb(${Math.round(fsR * 0.15)}, ${Math.round(fsG * 0.15)}, ${Math.round(fsB * 0.15)})`; // very dark accent spikes

          // Light base
          ctx.fillStyle = lightBase;
          ctx.fillRect(0, 0, W, H);

          // Flame / Spike generator (arrow function — valid inside case block)
          const drawSpike = (cx, topY, botY, maxW, color, pointUp) => {
            const midY = topY + (botY - topY) * 0.35;

            ctx.beginPath();
            if (!pointUp) {
              // Wide at top, tapers to point at bottom
              ctx.moveTo(cx, botY);
              ctx.bezierCurveTo(
                cx - maxW * 0.3,
                botY - (botY - topY) * 0.3,
                cx - maxW,
                midY,
                cx - maxW * 0.8,
                topY,
              );
              ctx.bezierCurveTo(
                cx - maxW * 0.3,
                topY,
                cx + maxW * 0.3,
                topY,
                cx + maxW * 0.8,
                topY,
              );
              ctx.bezierCurveTo(
                cx + maxW,
                midY,
                cx + maxW * 0.3,
                botY - (botY - topY) * 0.3,
                cx,
                botY,
              );
            } else {
              // Wide at bottom, tapers to point at top
              const midY2 = topY + (botY - topY) * 0.65;
              ctx.moveTo(cx, topY);
              ctx.bezierCurveTo(
                cx - maxW * 0.3,
                topY + (botY - topY) * 0.3,
                cx - maxW,
                midY2,
                cx - maxW * 0.8,
                botY,
              );
              ctx.bezierCurveTo(
                cx - maxW * 0.3,
                botY,
                cx + maxW * 0.3,
                botY,
                cx + maxW * 0.8,
                botY,
              );
              ctx.bezierCurveTo(
                cx + maxW,
                midY2,
                cx + maxW * 0.3,
                topY + (botY - topY) * 0.3,
                cx,
                topY,
              );
            }
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
          };

          // Column layout: primary | dark | primary | primary | dark | ...
          const colW = W / 11;

          const colPattern = [
            spikeColor, // primary
            darkColor, // dark accent
            spikeColor,
            spikeColor,
            darkColor,
            spikeColor,
            spikeColor,
            darkColor,
            spikeColor,
            spikeColor,
            darkColor,
          ];

          const fsSeed = (s) => {
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
          };

          // Downward spikes (tip points down)
          for (let col = 0; col < colPattern.length; col++) {
            const cx = (col + 0.5) * colW;
            const color = colPattern[col];
            const spikeCount = 4 + Math.floor(fsSeed(col * 3) * 3);

            for (let s = 0; s < spikeCount; s++) {
              const topY = -20 + fsSeed(col * 10 + s) * H * 0.15;
              const height = H * 0.45 + fsSeed(col * 10 + s + 1) * H * 0.45;
              const botY = topY + height;
              const maxW = colW * (0.35 + fsSeed(col * 10 + s + 2) * 0.3);

              drawSpike(cx, topY, Math.min(botY, H + 20), maxW, color, false);
            }
          }

          // Upward spikes (tip points up)
          for (let col = 0; col < colPattern.length; col++) {
            const cx = (col + 0.5) * colW;
            const color = colPattern[col];
            const spikeCount = 3 + Math.floor(fsSeed(col * 7 + 50) * 3);

            for (let s = 0; s < spikeCount; s++) {
              const botY = H + 20 - fsSeed(col * 10 + s + 30) * H * 0.15;
              const height = H * 0.35 + fsSeed(col * 10 + s + 31) * H * 0.4;
              const topY = botY - height;
              const maxW = colW * (0.3 + fsSeed(col * 10 + s + 32) * 0.28);

              drawSpike(cx, Math.max(topY, -20), botY, maxW, color, true);
            }
          }

          // Half-column offset layer (fills gaps)
          for (let col = 0; col < colPattern.length - 1; col++) {
            const cx = (col + 1.0) * colW;
            const color = colPattern[(col + 1) % colPattern.length];
            const spikeCount = 2 + Math.floor(fsSeed(col * 13 + 200) * 2);

            for (let s = 0; s < spikeCount; s++) {
              const topY = -10 + fsSeed(col * 13 + s + 200) * H * 0.2;
              const height = H * 0.3 + fsSeed(col * 13 + s + 201) * H * 0.35;
              const botY = topY + height;
              const maxW = colW * (0.18 + fsSeed(col * 13 + s + 202) * 0.15);
              drawSpike(cx, topY, Math.min(botY, H + 10), maxW, color, false);
            }

            for (let s = 0; s < spikeCount; s++) {
              const botY = H + 10 - fsSeed(col * 13 + s + 210) * H * 0.15;
              const height = H * 0.25 + fsSeed(col * 13 + s + 211) * H * 0.3;
              const topY = botY - height;
              const maxW = colW * (0.18 + fsSeed(col * 13 + s + 212) * 0.15);
              drawSpike(cx, Math.max(topY, -10), botY, maxW, color, true);
            }
          }

          // Thin vertical base lines (between spikes)
          for (let col = 0; col < colPattern.length; col++) {
            const cx = (col + 0.5) * colW;
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(cx, H);
            ctx.strokeStyle =
              colPattern[col] === darkColor
                ? `rgba(${Math.round(fsR * 0.15)}, ${Math.round(fsG * 0.15)}, ${Math.round(fsB * 0.15)}, 0.15)`
                : `rgba(${fsR}, ${fsG}, ${fsB}, 0.12)`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }

          break;
        }

        case "GrungeTriangleJersey": {
          const W = ctx.canvas.width;
          const H = ctx.canvas.height;

          // ── Parse primaryColor into RGB ──────────────────────────────
          const pr = parseInt(primaryColor.slice(1, 3), 16);
          const pg = parseInt(primaryColor.slice(3, 5), 16);
          const pb = parseInt(primaryColor.slice(5, 7), 16);

          // Light side: 60% white blend
          const lr = Math.round(pr * 0.4 + 255 * 0.6);
          const lg = Math.round(pg * 0.4 + 255 * 0.6);
          const lb = Math.round(pb * 0.4 + 255 * 0.6);

          // Dark stripe: 40% of primary
          const darkR = Math.round(pr * 0.4);
          const darkG = Math.round(pg * 0.4);
          const darkB = Math.round(pb * 0.4);

          // Deep dark: 28% — triangles, dots, scratches
          const deepR = Math.round(pr * 0.28);
          const deepG = Math.round(pg * 0.28);
          const deepB = Math.round(pb * 0.28);

          const gtSeed = (s) => {
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
          };

          // ── 1. BASE BACKGROUND ───────────────────────────────────────
          ctx.fillStyle = `rgb(${lr}, ${lg}, ${lb})`;
          ctx.fillRect(0, 0, W, H);

          // ── 2. SHARP TRIANGLE + GRUNGE SHAPES (full canvas) ─────────
          const drawSharpTriangles = (areaX, areaW, count, seedOffset) => {
            for (let i = 0; i < count; i++) {
              const r1 = gtSeed(i * 7 + seedOffset);
              const r2 = gtSeed(i * 7 + 1 + seedOffset);
              const r3 = gtSeed(i * 7 + 2 + seedOffset);
              const r4 = gtSeed(i * 7 + 3 + seedOffset);
              const r5 = gtSeed(i * 7 + 4 + seedOffset);
              const r6 = gtSeed(i * 7 + 5 + seedOffset);
              const r7 = gtSeed(i * 7 + 6 + seedOffset);

              const x1 = areaX + r1 * areaW;
              const y1 = r2 * H;

              // Sharp elongated triangles — like shattered glass
              const longSide = 30 + r3 * 130;
              const shortSide = 8 + r4 * 35;
              const angle = r5 * Math.PI * 2;

              const x2 = x1 + Math.cos(angle) * longSide;
              const y2 = y1 + Math.sin(angle) * longSide;
              const x3 = x1 + Math.cos(angle + 0.25) * shortSide;
              const y3 = y1 + Math.sin(angle + 0.25) * shortSide;

              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.lineTo(x3, y3);
              ctx.closePath();

              if (r6 > 0.45) {
                // Filled triangle
                ctx.fillStyle = `rgba(${deepR}, ${deepG}, ${deepB}, ${0.55 + r7 * 0.3})`;
                ctx.fill();
              } else {
                // Outlined triangle
                ctx.strokeStyle = `rgba(${deepR}, ${deepG}, ${deepB}, ${0.7 + r7 * 0.25})`;
                ctx.lineWidth = 1.0 + r6 * 2.5;
                ctx.stroke();
              }

              // Extra sharp shard lines radiating from triangle
              if (r6 > 0.2) {
                ctx.save();
                ctx.strokeStyle = `rgba(${deepR}, ${deepG}, ${deepB}, ${0.35 + r7 * 0.25})`;
                for (let sc = 0; sc < 4; sc++) {
                  const sx = x1 + (gtSeed(i * 15 + sc) - 0.5) * longSide * 0.8;
                  const sy =
                    y1 + (gtSeed(i * 15 + sc + 1) - 0.5) * longSide * 0.8;
                  const ex = sx + (gtSeed(i * 15 + sc + 2) - 0.5) * 45;
                  const ey = sy + (gtSeed(i * 15 + sc + 3) - 0.5) * 45;
                  ctx.lineWidth = 0.6 + gtSeed(i * 15 + sc + 4) * 1.2;
                  ctx.beginPath();
                  ctx.moveTo(sx, sy);
                  ctx.lineTo(ex, ey);
                  ctx.stroke();
                }
                ctx.restore();
              }

              // Grunge brush stroke blobs
              if (r7 > 0.55) {
                ctx.save();
                ctx.globalAlpha = 0.18 + r6 * 0.22;
                ctx.fillStyle = `rgb(${deepR}, ${deepG}, ${deepB})`;
                const blobX = x1 + (gtSeed(i * 9 + 1) - 0.5) * longSide;
                const blobY = y1 + (gtSeed(i * 9 + 2) - 0.5) * longSide;
                const blobW = 10 + gtSeed(i * 9 + 3) * 40;
                const blobH = 4 + gtSeed(i * 9 + 4) * 15;
                const blobA = gtSeed(i * 9 + 5) * Math.PI;
                ctx.translate(blobX, blobY);
                ctx.rotate(blobA);
                ctx.beginPath();
                ctx.ellipse(0, 0, blobW, blobH, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            }
          };

          // Draw triangles all over — dense coverage like image
          drawSharpTriangles(0, W * 0.42, 80, 1);
          drawSharpTriangles(W * 0.58, W * 0.42, 80, 77);
          // Extra layer for density
          drawSharpTriangles(0, W * 0.42, 40, 200);
          drawSharpTriangles(W * 0.58, W * 0.42, 40, 300);

          // ── 3. HALFTONE DOTS — transition into center stripe ─────────
          const drawHalftone = (startX, endX, startY, endY, fadeToCenter) => {
            const spacing = 16;
            for (let hy = startY; hy < endY; hy += spacing) {
              for (let hx = startX; hx < endX; hx += spacing) {
                const distFromCenter = Math.abs(hx - W / 2) / (W / 2);
                const fade = fadeToCenter ? 1 - distFromCenter : distFromCenter;
                const dotR = 5.5 * fade;
                if (dotR < 0.4) continue;
                ctx.beginPath();
                ctx.arc(hx, hy, dotR, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${deepR}, ${deepG}, ${deepB}, ${0.45 * fade + 0.08})`;
                ctx.fill();
              }
            }
          };

          // Top halftone band
          drawHalftone(0, W, 0, H * 0.12, false);
          // Bottom halftone band
          drawHalftone(0, W, H * 0.8, H, false);
          // Flanking the center stripe
          drawHalftone(W * 0.28, W * 0.72, 0, H, true);

          // ── 4. CENTER DARK STRIPE ────────────────────────────────────
          const stripeX = W * 0.32;
          const stripeW = W * 0.36;

          ctx.fillStyle = `rgb(${darkR}, ${darkG}, ${darkB})`;
          ctx.fillRect(stripeX, 0, stripeW, H);

          // Grunge scratch lines on stripe — near-vertical
          ctx.save();
          for (let i = 0; i < 150; i++) {
            const sx = stripeX + gtSeed(i * 2) * stripeW;
            const sy = gtSeed(i * 2 + 1) * H;
            const len = 30 + gtSeed(i * 3) * 110;
            const ang = -0.15 + gtSeed(i * 4) * 0.3;
            ctx.strokeStyle = `rgba(${(darkR * 0.6) | 0}, ${(darkG * 0.6) | 0}, ${(darkB * 0.6) | 0}, 0.55)`;
            ctx.lineWidth = 0.4 + gtSeed(i * 5) * 1.8;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
            ctx.stroke();
          }
          ctx.restore();

          // Stripe soft left edge
          const leftEdge = ctx.createLinearGradient(
            stripeX - 12,
            0,
            stripeX + 18,
            0,
          );
          leftEdge.addColorStop(0, `rgba(${lr}, ${lg}, ${lb}, 0.0)`);
          leftEdge.addColorStop(1, `rgba(${darkR}, ${darkG}, ${darkB}, 1.0)`);
          ctx.fillStyle = leftEdge;
          ctx.fillRect(stripeX - 12, 0, 30, H);

          // Stripe soft right edge
          const rightEdge = ctx.createLinearGradient(
            stripeX + stripeW - 18,
            0,
            stripeX + stripeW + 12,
            0,
          );
          rightEdge.addColorStop(0, `rgba(${darkR}, ${darkG}, ${darkB}, 1.0)`);
          rightEdge.addColorStop(1, `rgba(${lr}, ${lg}, ${lb}, 0.0)`);
          ctx.fillStyle = rightEdge;
          ctx.fillRect(stripeX + stripeW - 18, 0, 30, H);

          // ── 5. HALFTONE DOTS ON STRIPE (top & bottom) ────────────────
          drawHalftone(stripeX, stripeX + stripeW, 0, H * 0.14, false);
          drawHalftone(stripeX, stripeX + stripeW, H * 0.78, H, false);

          // ── 6. VIGNETTE ──────────────────────────────────────────────
          const vig = ctx.createRadialGradient(
            W / 2,
            H / 2,
            H * 0.18,
            W / 2,
            H / 2,
            H * 0.92,
          );
          vig.addColorStop(0, "rgba(0,0,0,0)");
          vig.addColorStop(1, "rgba(0,0,0,0.30)");
          ctx.fillStyle = vig;
          ctx.fillRect(0, 0, W, H);

          break;
        }

        case "Stripes": {
          ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
          for (let i = 0; i < size; i += 64) {
            ctx.fillRect(i, 0, 24, size);
            ctx.fillRect(i + 36, 0, 4, size);
          }
          ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
          for (let i = 24; i < size; i += 64) {
            ctx.fillRect(i, 0, 8, size);
          }
          break;
        }
        case "Diagonal": {
          ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
          ctx.lineWidth = 14;
          for (let i = -size; i < size * 2; i += 80) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + size, size);
            ctx.stroke();
          }
          ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
          ctx.lineWidth = 5;
          for (let i = -size + 20; i < size * 2; i += 80) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + size, size);
            ctx.stroke();
          }
          break;
        }
        case "Lightning": {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
          ctx.lineWidth = 4;
          for (let x = -50; x < size; x += 120) {
            ctx.beginPath();
            let curX = x;
            let curY = -20;
            ctx.moveTo(curX, curY);
            while (curY < size + 50) {
              const nextX = curX + (Math.random() > 0.5 ? 35 : -35);
              const nextY = curY + 45;
              ctx.lineTo(nextX, nextY);
              curX = nextX;
              curY = nextY;
            }
            ctx.stroke();
          }
          break;
        }
        case "Abstract": {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
          ctx.lineWidth = 4;
          for (let i = 0; i < size + 100; i += 40) {
            ctx.beginPath();
            for (let x = 0; x <= size; x += 10) {
              const y = i - 50 + Math.sin(x * 0.025 + i * 0.06) * 25;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
          break;
        }
        case "Geometric": {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
          ctx.lineWidth = 2.5;
          const hexRadius = 24;
          const h = hexRadius * Math.sqrt(3);
          for (let y = -h; y < size + h; y += h) {
            for (
              let x = -hexRadius;
              x < size + hexRadius * 3;
              x += hexRadius * 3
            ) {
              ctx.beginPath();
              for (let angle = 0; angle < 360; angle += 60) {
                const rad = (angle * Math.PI) / 180;
                const px =
                  x +
                  hexRadius * Math.cos(rad) +
                  (y % (2 * h) === 0 ? 0 : hexRadius * 1.5);
                const py = y + hexRadius * Math.sin(rad);
                if (angle === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.stroke();
            }
          }
          break;
        }
        case "Camouflage": {
          ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
          for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            const cx = Math.random() * size;
            const cy = Math.random() * size;
            ctx.arc(cx, cy, 35, 0, Math.PI * 2);
            ctx.arc(cx + 20, cy + 10, 25, 0, Math.PI * 2);
            ctx.arc(cx - 15, cy + 20, 30, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
          for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            const cx = Math.random() * size;
            const cy = Math.random() * size;
            ctx.arc(cx, cy, 25, 0, Math.PI * 2);
            ctx.arc(cx - 15, cy - 10, 20, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case "Minimal": {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
          ctx.lineWidth = 1.5;
          for (let x = 32; x < size; x += 64) {
            for (let y = 32; y < size; y += 64) {
              ctx.beginPath();
              ctx.moveTo(x - 6, y);
              ctx.lineTo(x + 6, y);
              ctx.moveTo(x, y - 6);
              ctx.lineTo(x, y + 6);
              ctx.stroke();
            }
          }
          break;
        }
        case "Gradient": {
          const grad = ctx.createLinearGradient(0, 0, size, size);
          grad.addColorStop(0, "rgba(255, 255, 255, 0.25)");
          grad.addColorStop(0.5, "rgba(0, 0, 0, 0.0)");
          grad.addColorStop(1, "rgba(0, 0, 0, 0.35)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, size, size);
          break;
        }
        case "Diamond": {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
          ctx.lineWidth = 2.5;
          const w = 40;
          const h = 60;
          for (let x = 0; x < size + w; x += w) {
            for (let y = 0; y < size + h; y += h) {
              ctx.beginPath();
              ctx.moveTo(x, y - h / 2);
              ctx.lineTo(x + w / 2, y);
              ctx.lineTo(x, y + h / 2);
              ctx.lineTo(x - w / 2, y);
              ctx.closePath();
              ctx.stroke();
            }
          }
          break;
        }
        default:
          break;
      }
      ctx.restore();
    };

    const drawFabricPattern = (ctx, patternName, isFront) => {
      if (!patternName || patternName === "None") return;
      const loadedImg = state.loadedPatterns?.[patternName];
      if (loadedImg) {
        const customize = isFront
          ? state.fabricPatternCustomizeFront
          : state.fabricPatternCustomizeBack;

        if (!customize) {
          ctx.save();
          ctx.drawImage(loadedImg, 0, 0, size, size);
          ctx.restore();
          return;
        }

        const fgColor = isFront
          ? state.fabricPatternColorFront
          : state.fabricPatternColorBack;
        const bgColor = isFront
          ? state.fabricPatternBgFront
          : state.fabricPatternBgBack;

        const hexToRgb = (hex) => {
          const cleanHex = hex.replace("#", "");
          const num = parseInt(cleanHex, 16);
          return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255,
          };
        };

        const bgIsTransparent =
          bgColor.toLowerCase() === "transparent" || bgColor === "";
        const fgRgb = hexToRgb(fgColor);

        // Process pixel data to extract foreground shapes with transparency
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) return;

        tempCtx.drawImage(loadedImg, 0, 0, size, size);
        const imgData = tempCtx.getImageData(0, 0, size, size);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Calculate distance from white (255, 255, 255)
          const dist = Math.sqrt(
            (255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2,
          );

          // Interpolation factor t:
          // dist < 30 -> background
          // dist > 90 -> foreground
          const t = Math.max(0, Math.min(1, (dist - 30) / 60));

          data[i] = fgRgb.r;
          data[i + 1] = fgRgb.g;
          data[i + 2] = fgRgb.b;
          data[i + 3] = Math.round(a * t);
        }

        tempCtx.putImageData(imgData, 0, 0);

        ctx.save();
        if (!bgIsTransparent) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, size, size);
        }
        ctx.drawImage(tempCanvas, 0, 0, size, size);
        ctx.restore();
      }
    };

    // ── Separate full-body pattern canvases (large decals) ─────────────────
    const isSplit = state.primaryColorSide && state.primaryColorSide !== "Both";

    const showFrontDecal =
      isSplit ||
      (state.designPattern &&
        state.designPattern !== "plain" &&
        (state.designSide === "Front" ||
          state.designSide === "Both" ||
          !state.designSide)) ||
      (state.fabricPatternFront && state.fabricPatternFront !== "None");

    const showBackDecal =
      isSplit ||
      (state.designPattern &&
        state.designPattern !== "plain" &&
        (state.designSide === "Back" ||
          state.designSide === "Both" ||
          !state.designSide)) ||
      (state.fabricPatternBack && state.fabricPatternBack !== "None");

    const patternFront = showFrontDecal
      ? makeCanvas((ctx) => {
          // 1. Draw base color / fabric pattern first
          if (state.fabricPatternFront && state.fabricPatternFront !== "None") {
            drawFabricPattern(ctx, state.fabricPatternFront, true);
          } else {
            // Fill with front primary color
            ctx.fillStyle = state.primaryFront || state.primary;
            ctx.fillRect(0, 0, size, size);
          }
          // 2. Draw design pattern on top
          if (
            state.designPattern &&
            state.designPattern !== "plain" &&
            (state.designSide === "Front" ||
              state.designSide === "Both" ||
              !state.designSide)
          ) {
            drawPattern(ctx);
          }
        })
      : null;

    const patternBack = showBackDecal
      ? makeCanvas((ctx) => {
          // 1. Draw base color / fabric pattern first
          if (state.fabricPatternBack && state.fabricPatternBack !== "None") {
            drawFabricPattern(ctx, state.fabricPatternBack, false);
          } else {
            // Fill with back primary color
            ctx.fillStyle = state.primaryBack || state.primary;
            ctx.fillRect(0, 0, size, size);
          }
          // 2. Draw design pattern on top
          if (
            state.designPattern &&
            state.designPattern !== "plain" &&
            (state.designSide === "Back" ||
              state.designSide === "Both" ||
              !state.designSide)
          ) {
            drawPattern(ctx);
          }
        })
      : null;

    if (patternFront) patternFront.anisotropy = 16;
    if (patternBack) patternBack.anisotropy = 16;

    // ── Text / number canvases (smaller decals, on top) ───────────────────────
    const drawSideLayers = (ctx, side) => {
      const sideTextLayers = (state.textLayers || []).filter(
        (l) => l.side === side,
      );
      // Logos (type === "logo" or unset) are rendered as separate 3D decals — exclude from flat canvas
      // Images (type === "image") stay on the flat canvas texture as before
      const sideLogoLayers = (state.logoLayers || []).filter(
        (l) => l.side === side && l.type === "image",
      );

      const allSideLayers = [
        ...sideTextLayers.map((l) => ({ ...l, layerType: "text" })),
        ...sideLogoLayers.map((l) => ({ ...l, layerType: "logo" })),
      ];

      const order = state.layersOrder || [];

      allSideLayers.sort((a, b) => {
        const indexA = order.indexOf(a.id);
        const indexB = order.indexOf(b.id);

        const getPriority = (l) => {
          if (l.layerType === "text") return 1;
          if (l.type === "image") {
            return l.zOrder === "above-text" ? 2 : 0;
          }
          return 3;
        };

        const valA = indexA !== -1 ? indexA : getPriority(a) * 1000;
        const valB = indexB !== -1 ? indexB : getPriority(b) * 1000;
        return valA - valB;
      });

      allSideLayers.forEach((layer) => {
        if (layer.layerType === "text") {
          ctx.save();
          ctx.translate(layer.x, layer.y);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.scale(layer.scale, layer.scale);

          const isOutline = layer.font === "Outline";
          const strokeColor =
            side === "Front"
              ? state.primaryFront || state.primary
              : state.primaryBack || state.primary;

          drawTextWithSpacing(
            ctx,
            layer.text,
            0,
            0,
            layer.font,
            layer.textSize || 80,
            layer.color,
            isOutline,
            strokeColor,
            layer.letterSpacing || 0,
            layer.lineSpacing || 1.15,
            layer.curveRadius || 0,
            layer.shadowEnabled,
            layer.shadowColor,
            layer.shadowBlur,
            layer.shadowOffsetX,
            layer.shadowOffsetY,
            layer.outlineEnabled,
            layer.outlineColor,
            layer.outlineWidth,
          );
          ctx.restore();
        } else {
          drawLayerOnCtx(ctx, layer);
        }
      });
    };

    const front = makeCanvas((ctx) => {
      drawSideLayers(ctx, "Front");
    });

    const back = makeCanvas((ctx) => {
      drawSideLayers(ctx, "Back");
    });

    if (front) front.anisotropy = 16;
    if (back) back.anisotropy = 16;

    return { front, back, patternFront, patternBack };
  }, [state]);
}

const ERASER_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 20H7L3 16c-1-1-1-3 0-4L12 3c1-1 3-1 4 0l5 5c1 1 1 3 0 4l-5 5z' fill='%23fca5a5'/><path d='M12 3l4 4'/></svg>") 3 17, auto`;

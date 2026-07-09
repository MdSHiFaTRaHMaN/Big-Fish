import React from "react";
import {
  LayoutTemplate,
  Palette,
  Grid,
  Type,
  Image as ImageIcon,
  Scissors,
  Box,
} from "lucide-react";

export function LogoCanvasPreview({ layer, editorScale, preloadedImage }) {
  const canvasRef = React.useRef(null);

  const imgWidth = preloadedImage?.naturalWidth || preloadedImage?.width || 200;
  const imgHeight =
    preloadedImage?.naturalHeight || preloadedImage?.height || 200;
  const drawWidth = imgWidth * layer.scale * editorScale;
  const drawHeight = imgHeight * layer.scale * editorScale;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = drawWidth;
    canvas.height = drawHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = (img) => {
      ctx.clearRect(0, 0, drawWidth, drawHeight);
      ctx.save();

      // Draw the logo image
      ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

      // Apply eraser strokes
      if (layer.eraserPaths && layer.eraserPaths.length > 0) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(0,0,0,1)";

        layer.eraserPaths.forEach((path) => {
          ctx.lineWidth = path.size * layer.scale * editorScale;
          ctx.beginPath();
          path.points.forEach((pt, index) => {
            const x = pt.x * layer.scale * editorScale;
            const y = pt.y * layer.scale * editorScale;
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
        });
      }
      ctx.restore();
    };

    if (preloadedImage) {
      draw(preloadedImage);
    } else {
      const img = new Image();
      img.src = layer.src;
      img.crossOrigin = "anonymous";
      img.onload = () => draw(img);
    }
  }, [layer, editorScale, preloadedImage, drawWidth, drawHeight]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${drawWidth}px`,
        height: `${drawHeight}px`,
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}

// ─── Design Templates ───────────────────────────────────────────────────────
export const JERSEY_DESIGNS = [
  { id: "throw", label: "Throw", pattern: "plain" },
  { id: "strike", label: "Strike", pattern: "strike" },
  { id: "save", label: "Save", pattern: "save" },
  { id: "fastbreak", label: "Fast Break", pattern: "fastbreak" },
  { id: "final", label: "Final", pattern: "final" },
  { id: "victory", label: "Victory", pattern: "victory" },
  { id: "city", label: "City", pattern: "city" },
  { id: "pure", label: "Pure", pattern: "pure" },
  { id: "level", label: "Level", pattern: "level" },
  { id: "vivo", label: "Vivo", pattern: "vivo" },
  { id: "orion", label: "Orion", pattern: "orion" },
  { id: "animal", label: "Animal", pattern: "animal" },
  { id: "avatar", label: "Avatar", pattern: "avatar" },
  { id: "league", label: "League", pattern: "league" },
  { id: "magic", label: "Magic", pattern: "magic" },
  { id: "raid", label: "Raid", pattern: "raid" },
  { id: "rush", label: "Rush", pattern: "rush" },
  { id: "score", label: "Score", pattern: "score" },
];

// ─── Pattern Colors Defaults ────────────────────────────────────────────────
export const PATTERN_DEFAULT_COLORS = {
  "/assets/images/patterns/pattern_1.png": { bg: "#FFFFFF", design: "#d73099" },
  "/assets/images/patterns/pattern_2.png": { bg: "#FFFFFF", design: "#5A6B7C" },
  "/assets/images/patterns/pattern_3.png": { bg: "#FFFFFF", design: "#0F7643" },
  "/assets/images/patterns/pattern_4.png": { bg: "#FFFFFF", design: "#8db97b" },
  "/assets/images/patterns/pattern_5.png": { bg: "#FFFFFF", design: "#E52E2E" },
};

// ─── Font Mapping Helpers ───────────────────────────────────────────────────
export const getFontFamily = (font) => {
  if (font === "Script") return '"Brush Script MT", cursive';
  if (font === "Block") return '"Courier New", monospace';
  if (font === "Varsity") return '"Arial Black", sans-serif';
  if (font === "Serif Athletic") return '"Alfa Slab One", serif';
  if (font === "Cyberpunk") return '"Orbitron", sans-serif';
  if (font === "Grunge") return '"Rubik Glitch", display';
  if (font === "Neon Glow") return '"Monoton", sans-serif';
  if (font === "Gothic") return '"UnifrakturMaguntia", serif';
  return "Impact, sans-serif";
};

export const getFontWeight = (font) => {
  if (font === "Grunge" || font === "Neon Glow" || font === "Gothic")
    return "400";
  return "900";
};

export const getFontStyle = (font) => {
  return font === "Italic" ? "italic" : "normal";
};

// ─── Toggle Switch ──────────────────────────────────────────────────────────
export function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${value ? "bg-zinc-900" : "bg-zinc-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${value ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

// ─── Sidebar Tabs ───────────────────────────────────────────────────────────
export const TABS = [
  { id: "designs", icon: LayoutTemplate, label: "Designs" },
  { id: "colors", icon: Palette, label: "Colors" },
  { id: "patterns", icon: Grid, label: "Patterns" },
  { id: "text", icon: Type, label: "Text" },
  { id: "logos", icon: ImageIcon, label: "Uploads" },
  { id: "style", icon: Scissors, label: "Style" },
  { id: "fabric", icon: Box, label: "Fabric" },
];

// ─── Jersey SVG Thumbnails ──────────────────────────────────────────────────
export function JerseySVG({
  primary = "#2196F3",
  secondary = "#1A1A2E",
  pattern = "plain",
  selected = false,
}) {
  const patterns = {
    plain: <></>,
    strike: (
      <>
        <polygon points="60,10 80,10 50,90 30,90" fill={secondary} />
      </>
    ),
    save: (
      <>
        <rect x="0" y="0" width="45" height="100" fill={secondary} />
      </>
    ),
    fastbreak: (
      <>
        <polygon points="0,0 30,0 0,50" fill={secondary} />
        <polygon points="100,50 100,100 70,100" fill={secondary} />
      </>
    ),
    final: (
      <>
        <rect x="0" y="0" width="35" height="100" fill={secondary} />
        <rect x="65" y="0" width="35" height="100" fill={secondary} />
      </>
    ),
    victory: (
      <>
        <polygon points="0,0 40,0 20,100 0,100" fill={secondary} />
      </>
    ),
    city: (
      <>
        <line
          x1="0"
          y1="25"
          x2="100"
          y2="25"
          stroke={secondary}
          strokeWidth="4"
        />

        <line
          x1="0"
          y1="50"
          x2="100"
          y2="50"
          stroke={secondary}
          strokeWidth="4"
        />

        <line
          x1="0"
          y1="75"
          x2="100"
          y2="75"
          stroke={secondary}
          strokeWidth="4"
        />
      </>
    ),
    pure: (
      <>
        <polygon points="70,0 100,0 100,40" fill={secondary} />
      </>
    ),
    level: (
      <>
        <polygon points="0,0 55,0 0,70" fill={secondary} />
      </>
    ),
    vivo: (
      <>
        <polygon points="60,100 100,0 100,100" fill={secondary} />
      </>
    ),
    orion: (
      <>
        <polygon
          points="30,20 70,20 90,60 50,90 10,60"
          fill="white"
          opacity="0.18"
        />

        <polygon points="40,30 60,30 70,55 50,72 30,55" fill={secondary} />
      </>
    ),
    animal: (
      <>
        <path
          d="M0,0 Q25,40 50,10 Q75,40 100,0 L100,50 Q75,80 50,55 Q25,80 0,50 Z"
          fill={secondary}
        />
      </>
    ),
    avatar: (
      <>
        <polygon points="0,100 45,0 55,0 0,100" fill={secondary} />
      </>
    ),
    league: (
      <>
        <rect x="0" y="0" width="50" height="100" fill={secondary} />
        <rect
          x="50"
          y="0"
          width="50"
          height="100"
          fill={primary}
          opacity="0.3"
        />
      </>
    ),
    magic: (
      <>
        <radialGradient id="mg" cx="50%" cy="40%">
          <stop offset="0%" stopColor={secondary} stopOpacity="1" />
          <stop offset="100%" stopColor={secondary} stopOpacity="0" />
        </radialGradient>
        <rect x="0" y="0" width="100" height="100" fill="url(#mg)" />
      </>
    ),
    raid: (
      <>
        <rect x="0" y="0" width="100" height="50" fill={secondary} />
      </>
    ),
    rush: (
      <>
        <polygon points="0,0 0,100 40,100" fill={secondary} />
      </>
    ),
    score: (
      <>
        <polygon points="0,0 100,0 100,100" fill={secondary} />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* jersey body */}
      <path
        d="M20,8 L0,28 L18,35 L18,90 L82,90 L82,35 L100,28 L80,8 L65,18 Q50,24 35,18 Z"
        fill={primary}
      />

      {/* pattern overlay */}
      <clipPath id="jerseyClip">
        <path d="M20,8 L0,28 L18,35 L18,90 L82,90 L82,35 L100,28 L80,8 L65,18 Q50,24 35,18 Z" />
      </clipPath>
      <g clipPath="url(#jerseyClip)">{patterns[pattern] ?? <></>}</g>
      {/* collar */}
      <path
        d="M38,18 Q50,30 62,18"
        fill="none"
        stroke={secondary}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* outline */}
      <path
        d="M20,8 L0,28 L18,35 L18,90 L82,90 L82,35 L100,28 L80,8 L65,18 Q50,24 35,18 Z"
        fill="none"
        stroke={selected ? "#00263C" : "rgba(0,0,0,0.18)"}
        strokeWidth={selected ? 3 : 1.5}
      />
    </svg>
  );
}

// ─── Mini Pattern Preview SVG Component ─────────────────────────────────────
export function MiniPatternSVG({ pattern, primary }) {
  const secondary = "rgba(0,0,0,0.15)";
  const white = "rgba(255,255,255,0.2)";

  const getPatternContent = () => {
    switch (pattern) {
      case "BlueGrungeJersey":
        return (
          <>
            {/* Left/right side panels */}
            <rect
              x="0"
              y="0"
              width="32"
              height="100"
              fill="rgba(26,179,232,0.5)"
            />

            <rect
              x="68"
              y="0"
              width="32"
              height="100"
              fill="rgba(26,179,232,0.5)"
            />

            {/* Center dark stripe */}
            <rect x="33" y="0" width="34" height="100" fill={secondary} />
            {/* Grunge triangle hints */}
            <polygon points="5,10 20,5 18,22" fill="rgba(0,0,0,0.25)" />
            <polygon points="8,55 22,48 20,68" fill="rgba(0,0,0,0.18)" />
            <polygon points="75,20 90,12 88,32" fill="rgba(0,0,0,0.25)" />
            <polygon points="80,65 95,58 93,78" fill="rgba(0,0,0,0.18)" />
            {/* Halftone dot hints */}
            <circle cx="30" cy="25" r="1.5" fill={white} />
            <circle cx="30" cy="50" r="2" fill={white} />
            <circle cx="30" cy="75" r="1.5" fill={white} />
            <circle cx="70" cy="25" r="1.5" fill={white} />
            <circle cx="70" cy="50" r="2" fill={white} />
            <circle cx="70" cy="75" r="1.5" fill={white} />
          </>
        );
      case "GreenChevronJersey":
        return (
          <>
            {/* Chevron path hints */}
            <path
              d="M 10,30 L 30,15 L 50,30 L 70,15 L 90,30"
              fill="none"
              stroke={white}
              strokeWidth="3"
              strokeLinejoin="round"
            />

            <path
              d="M 10,55 L 30,40 L 50,55 L 70,40 L 90,55"
              fill="none"
              stroke={secondary}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            <path
              d="M 10,80 L 30,65 L 50,80 L 70,65 L 90,80"
              fill="none"
              stroke={white}
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* Dots fading in bottom corners */}
            <circle cx="15" cy="85" r="2.5" fill={secondary} />
            <circle cx="28" cy="85" r="1.5" fill={secondary} />
            <circle cx="15" cy="72" r="1.5" fill={secondary} />
            <circle cx="85" cy="85" r="2.5" fill={secondary} />
            <circle cx="72" cy="85" r="1.5" fill={secondary} />
            <circle cx="85" cy="72" r="1.5" fill={secondary} />
          </>
        );
      case "RedCarbonJersey":
        return (
          <>
            {/* Carbon weave tile previews */}
            <rect
              x="10"
              y="20"
              width="35"
              height="25"
              fill={secondary}
              stroke={white}
              strokeWidth="1"
            />

            <rect
              x="55"
              y="20"
              width="35"
              height="25"
              fill={secondary}
              stroke={white}
              strokeWidth="1"
            />

            <rect
              x="10"
              y="55"
              width="35"
              height="25"
              fill={secondary}
              stroke={white}
              strokeWidth="1"
            />

            <rect
              x="55"
              y="55"
              width="35"
              height="25"
              fill={secondary}
              stroke={white}
              strokeWidth="1"
            />

            {/* Diagonal slashes */}
            <line
              x1="0"
              y1="30"
              x2="40"
              y2="0"
              stroke={white}
              strokeWidth="3"
              opacity="0.6"
            />

            <line
              x1="60"
              y1="100"
              x2="100"
              y2="70"
              stroke={white}
              strokeWidth="3"
              opacity="0.6"
            />
          </>
        );
      case "GoldDiamondJersey":
        return (
          <>
            <polygon
              points="50,15 75,50 50,85 25,50"
              fill="none"
              stroke={white}
              strokeWidth="2.5"
            />

            <polygon
              points="50,30 63,50 50,70 37,50"
              fill="none"
              stroke={white}
              strokeWidth="1.2"
              opacity="0.7"
            />

            {/* Some flare dots */}
            <circle cx="20" cy="20" r="1.5" fill={white} />
            <circle cx="80" cy="20" r="1.5" fill={white} />
            <circle cx="20" cy="80" r="2" fill={white} />
            <circle cx="80" cy="80" r="1.5" fill={white} />
            {/* Corner triangles */}
            <polygon points="0,0 25,0 0,25" fill={secondary} />
            <polygon points="100,0 75,0 100,25" fill={secondary} />
          </>
        );
      case "PurpleHexTechJersey":
        return (
          <>
            {/* Multiple hexagons */}
            <path
              d="M 50,25 L 72,37 L 72,63 L 50,75 L 28,63 L 28,37 Z"
              fill="none"
              stroke={white}
              strokeWidth="2.2"
            />

            <path
              d="M 50,35 L 63,42 L 63,58 L 50,65 L 37,58 L 37,42 Z"
              fill="none"
              stroke={secondary}
              strokeWidth="1"
            />

            <circle cx="50" cy="50" r="3.5" fill={white} />
            {/* Streaks */}
            <line
              x1="10"
              y1="10"
              x2="25"
              y2="90"
              stroke={secondary}
              strokeWidth="1.5"
            />

            <line
              x1="90"
              y1="10"
              x2="75"
              y2="90"
              stroke={secondary}
              strokeWidth="1.5"
            />
          </>
        );
      case "OrangeCamoWaveJersey":
        return (
          <>
            {/* Camo blobs */}
            <path d="M 15,20 Q 30,10 40,25 T 25,50 Z" fill={secondary} />
            <path d="M 60,60 Q 80,45 90,65 T 75,85 Z" fill={secondary} />
            <path
              d="M 70,20 Q 85,15 80,35 T 55,30 Z"
              fill={white}
              opacity="0.6"
            />

            {/* Waves */}
            <path
              d="M 0,35 Q 25,30 50,35 T 100,35"
              fill="none"
              stroke={white}
              strokeWidth="1"
            />

            <path
              d="M 0,65 Q 25,60 50,65 T 100,65"
              fill="none"
              stroke={white}
              strokeWidth="1"
            />
          </>
        );
      case "RedShardEnergy":
        return (
          <>
            {/* Side panels */}
            <rect x="0" y="0" width="28" height="100" fill={secondary} />
            <rect x="72" y="0" width="28" height="100" fill={secondary} />
            {/* Shard hints */}
            <polygon points="35,20 45,15 48,25 38,30" fill={white} />
            <polygon points="55,50 68,45 62,60 52,65" fill={white} />
            {/* Streaks */}
            <line
              x1="30"
              y1="0"
              x2="60"
              y2="100"
              stroke={white}
              strokeWidth="1"
              opacity="0.4"
            />

            <line
              x1="50"
              y1="0"
              x2="80"
              y2="100"
              stroke={white}
              strokeWidth="1.5"
              opacity="0.4"
            />
          </>
        );
      case "NeonCyberGrid":
        return (
          <>
            {/* Grid */}
            <line
              x1="25"
              y1="0"
              x2="25"
              y2="100"
              stroke={white}
              strokeWidth="0.8"
              opacity="0.25"
            />

            <line
              x1="50"
              y1="0"
              x2="50"
              y2="100"
              stroke={white}
              strokeWidth="0.8"
              opacity="0.25"
            />

            <line
              x1="75"
              y1="0"
              x2="75"
              y2="100"
              stroke={white}
              strokeWidth="0.8"
              opacity="0.25"
            />

            <line
              x1="0"
              y1="30"
              x2="100"
              y2="30"
              stroke={white}
              strokeWidth="0.8"
              opacity="0.25"
            />

            <line
              x1="0"
              y1="65"
              x2="100"
              y2="65"
              stroke={white}
              strokeWidth="0.8"
              opacity="0.25"
            />

            {/* Hexagons */}
            <path
              d="M 50,35 L 63,42 L 63,58 L 50,65 L 37,58 L 37,42 Z"
              fill="none"
              stroke={white}
              strokeWidth="1.5"
            />

            <path
              d="M 15,10 L 25,16 L 25,28 L 15,34 L 5,28 L 5,16 Z"
              fill="none"
              stroke={secondary}
              strokeWidth="1"
            />

            <path
              d="M 85,70 L 95,76 L 95,88 L 85,94 L 75,88 L 75,76 Z"
              fill="none"
              stroke={secondary}
              strokeWidth="1"
            />
          </>
        );
      case "GreenToxicSmoke":
        return (
          <>
            {/* Smoke circles */}
            <circle cx="25" cy="30" r="18" fill={white} opacity="0.25" />
            <circle cx="75" cy="40" r="22" fill={white} opacity="0.2" />
            <circle cx="45" cy="70" r="25" fill={secondary} opacity="0.5" />
            {/* Acid scratches */}
            <line
              x1="15"
              y1="15"
              x2="35"
              y2="25"
              stroke={white}
              strokeWidth="1"
            />

            <line
              x1="65"
              y1="75"
              x2="85"
              y2="65"
              stroke={white}
              strokeWidth="1"
            />

            {/* Dark center panel */}
            <rect
              x="35"
              y="0"
              width="30"
              height="100"
              fill={secondary}
              opacity="0.4"
            />
          </>
        );
      case "PurpleWaveMotion":
        return (
          <>
            {/* Waves */}
            <path
              d="M 0,25 Q 25,10 50,25 T 100,25"
              fill="none"
              stroke={white}
              strokeWidth="2"
            />

            <path
              d="M 0,50 Q 25,35 50,50 T 100,50"
              fill="none"
              stroke={secondary}
              strokeWidth="1.5"
            />

            <path
              d="M 0,75 Q 25,60 50,75 T 100,75"
              fill="none"
              stroke={white}
              strokeWidth="2"
            />

            {/* Scattered dots */}
            <circle cx="20" cy="15" r="1" fill={white} />
            <circle cx="80" cy="15" r="1" fill={white} />
            <circle cx="45" cy="35" r="1.5" fill={white} />
            <circle cx="15" cy="65" r="1.5" fill={white} />
            <circle cx="85" cy="65" r="1" fill={white} />
            {/* Center glow hint */}
            <rect
              x="30"
              y="0"
              width="40"
              height="100"
              fill={white}
              opacity="0.08"
            />
          </>
        );
      case "FlameStripeJersey":
        return (
          <>
            {/* Vertical spike columns */}
            <rect
              x="0"
              y="0"
              width="8"
              height="55"
              rx="2"
              fill={white}
              opacity="0.8"
            />

            <rect
              x="0"
              y="45"
              width="8"
              height="55"
              rx="2"
              fill={white}
              opacity="0.8"
            />

            <rect
              x="18"
              y="0"
              width="6"
              height="40"
              rx="2"
              fill={secondary}
              opacity="0.7"
            />

            <rect
              x="18"
              y="60"
              width="6"
              height="40"
              rx="2"
              fill={secondary}
              opacity="0.7"
            />

            <rect
              x="32"
              y="0"
              width="8"
              height="60"
              rx="2"
              fill={white}
              opacity="0.8"
            />

            <rect
              x="32"
              y="50"
              width="8"
              height="50"
              rx="2"
              fill={white}
              opacity="0.8"
            />

            <rect
              x="48"
              y="0"
              width="8"
              height="50"
              rx="2"
              fill={white}
              opacity="0.8"
            />

            <rect
              x="48"
              y="55"
              width="8"
              height="45"
              rx="2"
              fill={white}
              opacity="0.8"
            />

            <rect
              x="64"
              y="0"
              width="6"
              height="40"
              rx="2"
              fill={secondary}
              opacity="0.7"
            />

            <rect
              x="64"
              y="62"
              width="6"
              height="38"
              rx="2"
              fill={secondary}
              opacity="0.7"
            />

            <rect
              x="78"
              y="0"
              width="8"
              height="65"
              rx="2"
              fill={white}
              opacity="0.8"
            />

            <rect
              x="78"
              y="52"
              width="8"
              height="48"
              rx="2"
              fill={white}
              opacity="0.8"
            />

            <rect
              x="92"
              y="0"
              width="8"
              height="50"
              rx="2"
              fill={white}
              opacity="0.8"
            />

            <rect
              x="92"
              y="60"
              width="8"
              height="40"
              rx="2"
              fill={white}
              opacity="0.8"
            />
          </>
        );

      case "GrungeTriangleJersey":
        return (
          <>
            {/* ── SIDE GRUNGE TRIANGLES ───────────────────────── */}

            {/* Left Side */}
            <polygon
              points="8,10 42,70 20,78"
              fill={secondary}
              opacity="0.45"
            />

            <polygon
              points="20,120 78,190 32,198"
              fill={secondary}
              opacity="0.38"
            />

            <polygon
              points="55,40 120,92 72,102"
              fill="none"
              stroke={secondary}
              strokeWidth="2"
              opacity="0.55"
            />

            <polygon
              points="70,230 132,310 88,320"
              fill={secondary}
              opacity="0.42"
            />

            <polygon
              points="28,340 82,410 38,422"
              fill="none"
              stroke={secondary}
              strokeWidth="2"
              opacity="0.5"
            />

            {/* Extra shard scratches */}
            <path
              d="M18 65 L52 32"
              stroke={secondary}
              strokeWidth="1.5"
              opacity="0.35"
            />

            <path
              d="M36 160 L74 118"
              stroke={secondary}
              strokeWidth="1"
              opacity="0.28"
            />

            <path
              d="M58 285 L108 248"
              stroke={secondary}
              strokeWidth="1.3"
              opacity="0.32"
            />

            {/* Grunge blobs */}
            <ellipse
              cx="42"
              cy="95"
              rx="18"
              ry="6"
              fill={secondary}
              opacity="0.18"
              transform="rotate(-18 42 95)"
            />

            <ellipse
              cx="82"
              cy="355"
              rx="26"
              ry="8"
              fill={secondary}
              opacity="0.14"
              transform="rotate(24 82 355)"
            />

            {/* ── RIGHT SIDE ─────────────────────────────────── */}

            <polygon
              points="930,20 980,88 946,98"
              fill={secondary}
              opacity="0.45"
            />

            <polygon
              points="870,130 960,210 902,218"
              fill={secondary}
              opacity="0.38"
            />

            <polygon
              points="845,52 928,112 872,122"
              fill="none"
              stroke={secondary}
              strokeWidth="2"
              opacity="0.55"
            />

            <polygon
              points="882,260 962,340 912,352"
              fill={secondary}
              opacity="0.42"
            />

            <polygon
              points="918,370 982,438 944,448"
              fill="none"
              stroke={secondary}
              strokeWidth="2"
              opacity="0.5"
            />

            {/* Scratch lines */}
            <path
              d="M948 72 L982 38"
              stroke={secondary}
              strokeWidth="1.5"
              opacity="0.35"
            />

            <path
              d="M902 192 L958 148"
              stroke={secondary}
              strokeWidth="1"
              opacity="0.28"
            />

            <path
              d="M914 312 L968 276"
              stroke={secondary}
              strokeWidth="1.3"
              opacity="0.32"
            />

            {/* Blob textures */}
            <ellipse
              cx="930"
              cy="120"
              rx="22"
              ry="7"
              fill={secondary}
              opacity="0.18"
              transform="rotate(16 930 120)"
            />

            <ellipse
              cx="888"
              cy="388"
              rx="28"
              ry="9"
              fill={secondary}
              opacity="0.14"
              transform="rotate(-22 888 388)"
            />

            {/* ── CENTER STRIPE ──────────────────────────────── */}
            <rect
              x="320"
              y="0"
              width="360"
              height="500"
              fill={primary}
              opacity="0.88"
            />

            {/* Stripe edge fades */}
            <rect
              x="305"
              y="0"
              width="18"
              height="500"
              fill={white}
              opacity="0.08"
            />

            <rect
              x="677"
              y="0"
              width="18"
              height="500"
              fill={white}
              opacity="0.08"
            />

            {/* Vertical grunge scratches */}
            <path
              d="M362 20 L378 168"
              stroke={white}
              strokeWidth="1"
              opacity="0.12"
            />

            <path
              d="M418 60 L440 242"
              stroke={white}
              strokeWidth="1.5"
              opacity="0.1"
            />

            <path
              d="M520 10 L548 212"
              stroke={white}
              strokeWidth="1.2"
              opacity="0.11"
            />

            <path
              d="M610 80 L632 282"
              stroke={white}
              strokeWidth="1.4"
              opacity="0.1"
            />

            {/* ── HALFTONE DOTS ─────────────────────────────── */}

            {/* Top */}
            <circle cx="250" cy="22" r="5" fill={secondary} opacity="0.22" />
            <circle cx="320" cy="32" r="4" fill={secondary} opacity="0.18" />
            <circle cx="420" cy="18" r="6" fill={secondary} opacity="0.24" />
            <circle cx="520" cy="28" r="5" fill={secondary} opacity="0.2" />
            <circle cx="650" cy="20" r="6" fill={secondary} opacity="0.24" />
            <circle cx="760" cy="34" r="4" fill={secondary} opacity="0.18" />

            {/* Bottom */}
            <circle cx="240" cy="462" r="5" fill={secondary} opacity="0.22" />
            <circle cx="352" cy="478" r="4" fill={secondary} opacity="0.18" />
            <circle cx="448" cy="468" r="6" fill={secondary} opacity="0.24" />
            <circle cx="548" cy="482" r="5" fill={secondary} opacity="0.2" />
            <circle cx="662" cy="472" r="6" fill={secondary} opacity="0.24" />
            <circle cx="742" cy="486" r="4" fill={secondary} opacity="0.18" />

            {/* ── VIGNETTE OVERLAY ───────────────────────────── */}
            <rect
              x="0"
              y="0"
              width="1000"
              height="500"
              fill="url(#grungeVignette)"
              opacity="0.22"
            />
          </>
        );
      case "JerseyHexDot":
        return (
          <>
            <path
              d="M 50,15 L 80,32 L 80,67 L 50,85 L 20,67 L 20,32 Z"
              stroke={white}
              strokeWidth="2"
              fill="none"
            />

            <circle cx="50" cy="35" r="2" fill={white} />
            <circle cx="50" cy="50" r="3" fill={white} />
            <circle cx="50" cy="65" r="2" fill={white} />
            <circle cx="35" cy="42" r="2.5" fill={white} />
            <circle cx="35" cy="58" r="2.5" fill={white} />
            <circle cx="65" cy="42" r="2.5" fill={white} />
            <circle cx="65" cy="58" r="2.5" fill={white} />
          </>
        );
      case "Street Shard":
        return (
          <>
            {/* Shard shapes */}
            <polygon points="10,15 25,5 30,25 15,30" fill={secondary} />
            <polygon points="5,55 20,45 28,60 10,70" fill={white} />
            <polygon points="8,15 95,5 98,25 75,30" fill={secondary} />
            <polygon points="70,55 90,45 95,65 80,75" fill={white} />

            {/* Center Band */}
            <rect
              x="36"
              y="0"
              width="28"
              height="100"
              fill={secondary}
              opacity="0.6"
            />

            {/* Halftone dots indicators */}
            <circle cx="33" cy="20" r="1.5" fill={white} />
            <circle cx="33" cy="40" r="1.5" fill={white} />
            <circle cx="33" cy="60" r="1.5" fill={white} />
            <circle cx="33" cy="80" r="1.5" fill={white} />
            <circle cx="67" cy="20" r="1.5" fill={white} />
            <circle cx="67" cy="40" r="1.5" fill={white} />
            <circle cx="67" cy="60" r="1.5" fill={white} />
            <circle cx="67" cy="80" r="1.5" fill={white} />
          </>
        );
      case "Stripes":
        return (
          <>
            <rect x="15" y="0" width="8" height="100" fill={white} />
            <rect x="27" y="0" width="2" height="100" fill={white} />
            <rect x="45" y="0" width="8" height="100" fill={white} />
            <rect x="57" y="0" width="2" height="100" fill={white} />
            <rect x="75" y="0" width="8" height="100" fill={white} />
            <rect x="87" y="0" width="2" height="100" fill={white} />
          </>
        );
      case "Diagonal":
        return (
          <>
            <line
              x1="-20"
              y1="20"
              x2="40"
              y2="-40"
              stroke={secondary}
              strokeWidth="6"
            />

            <line
              x1="10"
              y1="50"
              x2="70"
              y2="-10"
              stroke={secondary}
              strokeWidth="6"
            />

            <line
              x1="40"
              y1="80"
              x2="100"
              y2="20"
              stroke={secondary}
              strokeWidth="6"
            />

            <line
              x1="70"
              y1="110"
              x2="130"
              y2="50"
              stroke={secondary}
              strokeWidth="6"
            />

            <line
              x1="-15"
              y1="25"
              x2="45"
              y2="-35"
              stroke={white}
              strokeWidth="2"
            />

            <line
              x1="15"
              y1="55"
              x2="75"
              y2="-5"
              stroke={white}
              strokeWidth="2"
            />

            <line
              x1="45"
              y1="85"
              x2="105"
              y2="25"
              stroke={white}
              strokeWidth="2"
            />

            <line
              x1="75"
              y1="115"
              x2="135"
              y2="55"
              stroke={white}
              strokeWidth="2"
            />
          </>
        );
      case "Lightning":
        return (
          <path
            d="M20,10 L10,50 L25,50 L12,90 M50,10 L40,50 L55,50 L42,90 M80,10 L70,50 L85,50 L72,90"
            stroke={white}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      case "Abstract":
        return (
          <path
            d="M-10,30 Q20,10 50,30 T110,30 M-10,50 Q20,30 50,50 T110,50 M-10,70 Q20,50 50,70 T110,70"
            stroke={white}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "Geometric":
        return (
          <path
            d="M 0,0 L 20,20 L 40,0 L 60,20 L 80,0 L 100,20 M 0,20 L 20,40 L 40,20 L 60,40 L 80,20 L 100,40 M 0,40 L 20,60 L 40,40 L 60,60 L 80,40 L 100,60 M 0,60 L 20,80 L 40,60 L 60,80 L 80,60 L 100,80"
            stroke={white}
            strokeWidth="1.5"
            fill="none"
          />
        );
      case "Camouflage":
        return (
          <>
            <path
              d="M 10,20 Q 20,5 35,15 T 60,10 T 80,30 T 40,45 Z"
              fill={secondary}
            />

            <path
              d="M 20,60 Q 40,45 55,65 T 80,50 T 90,80 T 50,90 Z"
              fill={white}
            />
          </>
        );
      case "Minimal":
        return (
          <>
            <circle cx="20" cy="20" r="2.5" fill={white} />
            <circle cx="50" cy="20" r="2.5" fill={white} />
            <circle cx="80" cy="20" r="2.5" fill={white} />
            <circle cx="20" cy="50" r="2.5" fill={white} />
            <circle cx="50" cy="50" r="2.5" fill={white} />
            <circle cx="80" cy="50" r="2.5" fill={white} />
            <circle cx="20" cy="80" r="2.5" fill={white} />
            <circle cx="50" cy="80" r="2.5" fill={white} />
            <circle cx="80" cy="80" r="2.5" fill={white} />
          </>
        );
      case "Gradient":
        return (
          <defs>
            <linearGradient id="miniGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primary} />
              <stop offset="100%" stopColor="#111111" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        );
      case "Diamond":
        return (
          <path
            d="M 50,10 L 70,30 L 50,50 L 30,30 Z M 20,40 L 40,60 L 20,80 L 0,60 Z M 80,40 L 100,60 L 80,80 L 60,60 Z"
            stroke={white}
            strokeWidth="1.5"
            fill="none"
          />
        );
      default:
        return null;
    }
  };

  const isGradient = pattern === "Gradient";

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full bg-zinc-200"
      style={{ backgroundColor: isGradient ? undefined : primary }}
    >
      {getPatternContent()}
      {isGradient && <rect width="100" height="100" fill="url(#miniGrad)" />}
      {pattern === "None" && (
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fill="rgba(0,0,0,0.3)"
          fontSize="14"
          fontWeight="bold"
        >
          Solid
        </text>
      )}
    </svg>
  );
}

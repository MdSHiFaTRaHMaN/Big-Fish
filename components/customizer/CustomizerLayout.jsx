"use client";

import React, { useState, useRef, useEffect } from "react";
import LogoImg from "@/assets/images/logo.png";
import { useCustomizerStore } from "./useCustomizerStore";
import DesignsTab from "./tabs/DesignsTab";
import ColorsTab from "./tabs/ColorsTab";
import PatternsTab from "./tabs/PatternsTab";
import TextTab from "./tabs/TextTab";
import LogosTab from "./tabs/LogosTab";
import StyleTab from "./tabs/StyleTab";
import FabricTab from "./tabs/FabricTab";
import {
  ChevronLeft,
  Save,
  Share2,
  Download,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  JerseySVG,
  TABS,
  JERSEY_DESIGNS,
  getFontFamily,
  getFontWeight,
  getFontStyle,
  LogoCanvasPreview,
} from "./JerseyPresets";
import Jersey3DViewer from "./Jersey3DViewer";

// Canvas helpers, drawing hooks, and Three.js sub-components extracted to separate modules
const ERASER_CURSOR = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 20H7L3 16c-1-1-1-3 0-4L12 3c1-1 3-1 4 0l5 5c1 1 1 3 0 4l-5 5z' fill='%23fca5a5'/><path d='M12 3l4 4'/></svg>") 3 17, auto`;

// ─── Main Component ─────────────────────────────────────────────────────────
export default function CustomizerLayout() {
  const activeTab = useCustomizerStore((s) => s.activeTab);
  const setActiveTab = useCustomizerStore((s) => s.setActiveTab);
  const qty = useCustomizerStore((s) => s.qty);
  const setQty = useCustomizerStore((s) => s.setQty);
  const selectedDesign = useCustomizerStore((s) => s.selectedDesign);
  const setSelectedDesign = useCustomizerStore((s) => s.setSelectedDesign);
  const currentView = useCustomizerStore((s) => s.currentView);
  const setCurrentView = useCustomizerStore((s) => s.setCurrentView);
  const uploadedLogos = useCustomizerStore((s) => s.uploadedLogos);
  const setUploadedLogos = useCustomizerStore((s) => s.setUploadedLogos);
  const uploadedImages = useCustomizerStore((s) => s.uploadedImages);
  const setUploadedImages = useCustomizerStore((s) => s.setUploadedImages);
  const uploadSubTab = useCustomizerStore((s) => s.uploadSubTab);
  const setUploadSubTab = useCustomizerStore((s) => s.setUploadSubTab);
  const setSnapX = useCustomizerStore((s) => s.setSnapX);
  const setSnapY = useCustomizerStore((s) => s.setSnapY);
  const setSnapType = useCustomizerStore((s) => s.setSnapType);

  const [queryParams, setQueryParams] = useState({ quinckId: "", shopifyBaseUrl: "" });
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);

  console.log("checkoutResult", checkoutResult)

  // Holds the generated PDF blob in memory — used by the Download button directly
  const pdfBlobRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setQueryParams({
        quinckId: params.get("quinckId") || "",
        shopifyBaseUrl: params.get("shopifyBaseUrl") || "",
      });
    }
  }, []);

  const threeRef = useRef(null);

  const texturesRef = useRef({
    front: null,
    back: null,
    patternFront: null,
    patternBack: null,
  });

  const editorWidth = 280;
  const canvasSize = 1024;
  const editorScale = editorWidth / canvasSize; // 0.2734 — used for text layers
  // Logo editor shows only the jersey front zone (~512px of canvas), so 2× zoom
  const logoEditorScale = editorWidth / (canvasSize / 2); // ≈0.547
  const logoEditorOffsetY = 60; // inner workspace top offset inside the 400px container

  const getSnapValue = (val, threshold = 35) => {
    if (Math.abs(val - 512) < threshold) {
      return { value: 512, type: "CENTER" };
    }
    if (Math.abs(val - 120) < threshold) {
      return { value: 120, type: "SAFE AREA" };
    }
    if (Math.abs(val - 904) < threshold) {
      return { value: 904, type: "SAFE AREA" };
    }
    if (Math.abs(val - 0) < threshold) {
      return { value: 0, type: "EDGE" };
    }
    if (Math.abs(val - 1024) < threshold) {
      return { value: 1024, type: "EDGE" };
    }
    return { value: val, type: null };
  };

  const renderTextLayer = (layer, isHidden = false, children) => {
    const isOutline = layer.font === "Outline";
    const letterSpacing = layer.letterSpacing || 0;
    const lineSpacing = layer.lineSpacing || 1.15;
    const curveVal = layer.curveRadius || 0;
    const fontSize = layer.textSize * layer.scale * editorScale;

    // Standard styling for both straight & curved text containers
    const baseStyle = {
      position: "relative",
      padding: "6px 10px",
      fontFamily: getFontFamily(layer.font),
      fontWeight: getFontWeight(layer.font),
      fontStyle: getFontStyle(layer.font),
      userSelect: "none",
      visibility: isHidden ? "hidden" : "visible",
    };

    if (curveVal === 0) {
      return (
        <div
          style={{
            ...baseStyle,
            fontSize: `${fontSize}px`,
            whiteSpace: "pre-line",
            textAlign: "center",
            letterSpacing: `${letterSpacing * editorScale}px`,
            lineHeight: lineSpacing,
            WebkitTextStroke:
              layer.outlineEnabled && layer.outlineWidth
                ? `${layer.outlineWidth * editorScale}px ${layer.outlineColor || "#FFFFFF"}`
                : isOutline
                  ? `1px ${layer.color}`
                  : "none",
            color: isOutline ? "transparent" : layer.color,
            textShadow: layer.shadowEnabled
              ? `${(layer.shadowOffsetX ?? 4) * editorScale}px ${(layer.shadowOffsetY ?? 4) * editorScale}px ${(layer.shadowBlur ?? 10) * editorScale}px ${layer.shadowColor || "#000000"}`
              : undefined,
          }}
        >
          {layer.text}
          {children}
        </div>
      );
    }

    // Curved text rendering
    const lines = layer.text.split("\n");
    const lineSpacingHeight = fontSize * lineSpacing;
    const totalHeight = (lines.length - 1) * lineSpacingHeight;
    const verticalOffset = -totalHeight / 2;

    // Estimate character widths for each line to find the max width
    const lineTotalWidths = lines.map((line) => {
      const chars = Array.from(line);
      const charWidths = chars.map((c) => {
        if (c === "I" || c === "i" || c === "l" || c === "1" || c === " ")
          return fontSize * 0.25;
        if (c === "M" || c === "W" || c === "m" || c === "w")
          return fontSize * 0.8;
        return fontSize * 0.55;
      });
      return (
        charWidths.reduce((a, b) => a + b, 0) +
        (chars.length - 1) * letterSpacing * editorScale
      );
    });

    const maxLineWidth = Math.max(...lineTotalWidths);

    return (
      <div
        style={{
          ...baseStyle,
          position: "relative",
          width: `${maxLineWidth}px`,
          height: `${totalHeight + fontSize}px`,
        }}
      >
        {lines.map((line, lineIndex) => {
          const curY = verticalOffset + lineIndex * lineSpacingHeight;
          const chars = Array.from(line);

          // Estimate character widths for the 2D layout.
          const charWidths = chars.map((c) => {
            if (c === "I" || c === "i" || c === "l" || c === "1" || c === " ")
              return fontSize * 0.25;
            if (c === "M" || c === "W" || c === "m" || c === "w")
              return fontSize * 0.8;
            return fontSize * 0.55;
          });

          const lineTotalWidth =
            charWidths.reduce((a, b) => a + b, 0) +
            (chars.length - 1) * letterSpacing * editorScale;

          const totalAngle = (curveVal * Math.PI) / 180;
          const R = lineTotalWidth / totalAngle;

          let currentS = 0;

          return (
            <div
              key={lineIndex}
              style={{
                position: "absolute",
                width: "100%",
                height: `${fontSize}px`,
                top: `calc(50% + ${curY}px)`,
                left: 0,
              }}
            >
              {chars.map((char, charIdx) => {
                const charW = charWidths[charIdx];
                const charCenterS = currentS + charW / 2;
                const angle = (charCenterS - lineTotalWidth / 2) / R;

                const cx = R * Math.sin(angle);
                const cy = R * (1 - Math.cos(angle));

                currentS += charW + letterSpacing * editorScale;

                return (
                  <span
                    key={charIdx}
                    style={{
                      position: "absolute",
                      left: `calc(50% + ${cx}px)`,
                      top: `calc(50% + ${cy}px)`,
                      transform: `translate(-50%, -50%) rotate(${angle}rad)`,
                      fontSize: `${fontSize}px`,
                      fontFamily: getFontFamily(layer.font),
                      fontWeight: getFontWeight(layer.font),
                      fontStyle: getFontStyle(layer.font),
                      whiteSpace: "nowrap",
                      WebkitTextStroke:
                        layer.outlineEnabled && layer.outlineWidth
                          ? `${layer.outlineWidth * editorScale}px ${layer.outlineColor || "#FFFFFF"}`
                          : isOutline
                            ? `1px ${layer.color}`
                            : "none",
                      color: isOutline ? "transparent" : layer.color,
                      textShadow: layer.shadowEnabled
                        ? `${(layer.shadowOffsetX ?? 4) * editorScale}px ${(layer.shadowOffsetY ?? 4) * editorScale}px ${(layer.shadowBlur ?? 10) * editorScale}px ${layer.shadowColor || "#000000"}`
                        : undefined,
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          );
        })}
        {children}
      </div>
    );
  };

  const renderLogoLayer = (layer, isHidden = false, children) => {
    const img = loadedLogoImages[layer.src];
    const imgWidth = img ? img.naturalWidth || img.width || 200 : 200;
    const imgHeight = img ? img.naturalHeight || img.height || 200 : 200;
    const drawWidth = imgWidth * layer.scale * logoEditorScale;
    const drawHeight = imgHeight * layer.scale * logoEditorScale;

    return (
      <div
        style={{
          position: "relative",
          width: `${drawWidth}px`,
          height: `${drawHeight}px`,
          visibility: isHidden ? "hidden" : "visible",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!isHidden && (
          <div
            style={{
              opacity: typeof layer.opacity === "number" ? layer.opacity : 1.0,
              width: "100%",
              height: "100%",
            }}
          >
            <LogoCanvasPreview
              layer={layer}
              editorScale={logoEditorScale}
              preloadedImage={img}
            />
          </div>
        )}
        {children}
      </div>
    );
  };

  const textLayers = useCustomizerStore((s) => s.textLayers);
  const setTextLayers = useCustomizerStore((s) => s.setTextLayers);
  const selectedLayerId = useCustomizerStore((s) => s.selectedLayerId);
  const setSelectedLayerId = useCustomizerStore((s) => s.setSelectedLayerId);

  const logoLayers = useCustomizerStore((s) => s.logoLayers);
  const setLogoLayers = useCustomizerStore((s) => s.setLogoLayers);
  const selectedLogoId = useCustomizerStore((s) => s.selectedLogoId);
  const setSelectedLogoId = useCustomizerStore((s) => s.setSelectedLogoId);
  const loadedLogoImages = useCustomizerStore((s) => s.loadedLogoImages);
  const setLoadedLogoImages = useCustomizerStore((s) => s.setLoadedLogoImages);
  const isEraserMode = useCustomizerStore((s) => s.isEraserMode);
  const setIsEraserMode = useCustomizerStore((s) => s.setIsEraserMode);
  const eraserBrushSize = useCustomizerStore((s) => s.eraserBrushSize);
  const setEraserBrushSize = useCustomizerStore((s) => s.setEraserBrushSize);

  const layersOrder = useCustomizerStore((s) => s.layersOrder);
  const setLayersOrder = useCustomizerStore((s) => s.setLayersOrder);
  const draggedIdx = useCustomizerStore((s) => s.draggedIdx);
  const setDraggedIdx = useCustomizerStore((s) => s.setDraggedIdx);
  const dragOverIdx = useCustomizerStore((s) => s.dragOverIdx);
  const setDragOverIdx = useCustomizerStore((s) => s.setDragOverIdx);

  // Keep layersOrder in sync with all active layers (Text layers + Logo/Image layers)
  useEffect(() => {
    const textIds = textLayers.map((l) => l.id);
    const logoIds = logoLayers.map((l) => l.id);
    const allIds = [...textIds, ...logoIds];

    setLayersOrder((prev) => {
      // Filter out any IDs that no longer exist
      const existing = prev.filter((id) => allIds.includes(id));
      // Add any new IDs that are not yet in the order list
      const newIds = allIds.filter((id) => !existing.includes(id));

      if (existing.length === prev.length && newIds.length === 0) {
        return prev;
      }

      // Default priority sorting for new layers
      const sortedNew = [...newIds].sort((a, b) => {
        const getPriority = (id) => {
          if (id.includes("text") || id.includes("number")) return 1;
          const logo = logoLayers.find((l) => l.id === id);
          if (logo) {
            if (logo.type === "image") {
              return logo.zOrder === "above-text" ? 2 : 0;
            }
            return 3;
          }
          return 3;
        };
        return getPriority(a) - getPriority(b);
      });

      return [...existing, ...sortedNew];
    });
  }, [textLayers, logoLayers]);

  const reorderLayers = (fromUIIndex, toUIIndex) => {
    const sideTextLayers = textLayers.filter((l) => l.side === activeSide);
    const sideLogoLayers = logoLayers.filter((l) => l.side === activeSide);
    const activeSideLayers = [
      ...sideTextLayers.map((l) => ({ ...l, layerType: "text" })),
      ...sideLogoLayers.map((l) => ({ ...l, layerType: "logo" })),
    ];

    const sortedActiveSideLayers = [...activeSideLayers].sort((a, b) => {
      const idxA = layersOrder.indexOf(a.id);
      const idxB = layersOrder.indexOf(b.id);
      const getPriority = (l) => {
        if (l.layerType === "text") return 1;
        if (l.type === "image") {
          return l.zOrder === "above-text" ? 2 : 0;
        }
        return 3;
      };
      const valA = idxA !== -1 ? idxA : getPriority(a) * 1000;
      const valB = idxB !== -1 ? idxB : getPriority(b) * 1000;
      // DESCENDING order for UI list (highest draw index = top of list)
      return valB - valA;
    });

    const reorderedSideLayers = [...sortedActiveSideLayers];
    const [movedItem] = reorderedSideLayers.splice(fromUIIndex, 1);
    reorderedSideLayers.splice(toUIIndex, 0, movedItem);

    // Map new UI order back into layersOrder
    setLayersOrder((prev) => {
      const newOrder = [...prev];
      const sideLayerIds = sortedActiveSideLayers.map((l) => l.id);
      const newDrawOrderSideIds = [...reorderedSideLayers]
        .reverse()
        .map((l) => l.id);

      const indices = newOrder
        .map((id, index) => (sideLayerIds.includes(id) ? index : -1))
        .filter((index) => index !== -1);

      indices.forEach((indexInOrder, idx) => {
        newOrder[indexInOrder] = newDrawOrderSideIds[idx];
      });

      return newOrder;
    });
  };

  useEffect(() => {
    logoLayers.forEach((layer) => {
      if (loadedLogoImages[layer.src]) return;
      const img = new Image();
      img.src = layer.src;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setLoadedLogoImages((prev) => ({
          ...prev,
          [layer.src]: img,
        }));
      };
    });
  }, [logoLayers, loadedLogoImages]);

  useEffect(() => {
    if (!selectedLogoId) {
      setIsEraserMode(false);
    }
  }, [selectedLogoId]);

  const handleDragStart = (e, id) => {
    e.preventDefault();
    setSelectedLayerId(id);

    const layer = textLayers.find((l) => l.id === id);
    if (!layer) return;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startX = layer.x;
    const startY = layer.y;

    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startMouseX) / editorScale;
      const deltaY = (moveEvent.clientY - startMouseY) / editorScale;

      const snapResultX = getSnapValue(startX + deltaX);
      const snapResultY = getSnapValue(startY + deltaY);

      setSnapX(snapResultX.type ? snapResultX.value : null);
      setSnapY(snapResultY.type ? snapResultY.value : null);

      const snapType = snapResultX.type || snapResultY.type || null;
      setSnapType(snapType);

      setTextLayers((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
              ...l,
              x: snapResultX.value,
              y: snapResultY.value,
            }
            : l,
        ),
      );
    };

    const handleMouseUp = () => {
      setSnapX(null);
      setSnapY(null);
      setSnapType(null);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleRotateStart = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const layer = textLayers.find((l) => l.id === id);
    if (!layer) return;

    const target = e.currentTarget.parentElement?.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startAngle = Math.atan2(startMouseY - centerY, startMouseX - centerX);
    const startRotation = layer.rotation;

    const handleMouseMove = (moveEvent) => {
      const currentAngle = Math.atan2(
        moveEvent.clientY - centerY,
        moveEvent.clientX - centerX,
      );
      const angleDiff = currentAngle - startAngle;
      let newRotation = startRotation + angleDiff * (180 / Math.PI);

      newRotation = ((newRotation % 360) + 360) % 360;

      setTextLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, rotation: newRotation } : l)),
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleScaleStart = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const layer = textLayers.find((l) => l.id === id);
    if (!layer) return;

    const target = e.currentTarget.parentElement?.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startDist = Math.sqrt(
      Math.pow(startMouseX - centerX, 2) + Math.pow(startMouseY - centerY, 2),
    );
    const startScale = layer.scale;

    const handleMouseMove = (moveEvent) => {
      const curDist = Math.sqrt(
        Math.pow(moveEvent.clientX - centerX, 2) +
        Math.pow(moveEvent.clientY - centerY, 2),
      );
      const newScale = Math.max(
        0.2,
        Math.min(5.0, startScale * (curDist / startDist)),
      );

      setTextLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, scale: newScale } : l)),
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleCopy = (id) => {
    const layer = textLayers.find((l) => l.id === id);
    if (!layer) return;

    const newLayer = {
      ...layer,
      id: `${layer.id}-copy-${Date.now()}`,
      x: Math.min(1024, layer.x + 40),
      y: Math.min(1024, layer.y + 40),
    };

    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const handleDelete = (id) => {
    setTextLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  };

  const activeSide =
    currentView === "back" || currentView === "back-center" ? "Back" : "Front";

  const handleAddCustomText = () => {
    const newId = `custom-text-${Date.now()}`;
    const newLayer = {
      id: newId,
      text: "CUSTOM TEXT",
      x: 512,
      y: 500,
      scale: 1.0,
      rotation: 0,
      font: "Varsity",
      color: "#E63946",
      textSize: 100,
      side: activeSide,
      letterSpacing: 0,
      lineSpacing: 1.15,
      curveRadius: 0,
      shadowEnabled: false,
      shadowColor: "#000000",
      shadowBlur: 10,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      outlineEnabled: false,
      outlineColor: "#FFFFFF",
      outlineWidth: 4,
    };
    setTextLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newId);
  };

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    const loadingToastId = toast.loading("Capturing design views...", {
      description: "Please wait while we prepare your checkout session.",
    });

    try {
      // 1. Capture front and back side snapshots
      const originalView = currentView;

      // Helper to capture a view
      const captureView = (viewName) => {
        return new Promise((resolve) => {
          setCurrentView(viewName);
          setTimeout(() => {
            try {
              if (threeRef.current) {
                const { gl, scene, camera } = threeRef.current;
                gl.render(scene, camera);
                const dataURL = gl.domElement.toDataURL("image/png");
                resolve(dataURL);
              } else {
                console.warn("threeRef.current is null - skipping snapshot for", viewName);
                resolve(null);
              }
            } catch (err) {
              console.error("Error capturing snapshot for", viewName, err);
              resolve(null);
            }
          }, 250); // 250ms delay for view state transition
        });
      };

      // Helper function to flatten PNG to JPEG with white background for PDF compatibility
      const pngToJpeg = (pngDataUrl) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");

            // Draw white background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the PNG image
            ctx.drawImage(img, 0, 0);

            // Export as JPEG with 80% quality
            resolve(canvas.toDataURL("image/jpeg", 0.8));
          };
          img.onerror = () => {
            resolve(pngDataUrl); // Fallback to original
          };
          img.src = pngDataUrl;
        });
      };

      // Capture Front PNG
      const frontPngUrl = await captureView("front");

      // Capture Back PNG
      const backPngUrl = await captureView("back");

      // Restore original view
      setCurrentView(originalView);

      if (!frontPngUrl || !backPngUrl) {
        throw new Error("Could not capture 3D views of the jersey. Please try again.");
      }

      // Convert transparent PNGs to solid JPEGs to reduce size and fix rendering bugs in PDF
      const frontDataUrl = await pngToJpeg(frontPngUrl);
      const backDataUrl = await pngToJpeg(backPngUrl);

      // 2. Generate summary PDF client-side using jsPDF
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Colors
      const BRAND_COLOR = [164, 35, 37]; // #A42325
      const DARK_TEXT = [33, 37, 41];
      const MUTED_TEXT = [108, 117, 125];
      const BG_CARD = [248, 249, 250];
      const BORDER_COLOR = [222, 226, 230];

      // Helper for drawing common footer
      const drawFooter = (pageNum, totalPages) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
        doc.text("Generated by Big Fish T-Shirt Customizer", 14, 285);
        doc.text(`Page ${pageNum} of ${totalPages}`, 196, 285, { align: "right" });
      };

      // PAGE 1: Specifications and Details
      // 1. Header Banner
      doc.setFillColor(BRAND_COLOR[0], BRAND_COLOR[1], BRAND_COLOR[2]);
      doc.rect(0, 0, 210, 42, "F");

      // Header Texts
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text("BIG FISH", 14, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("CUSTOM JERSEY DESIGN SUMMARY", 14, 26);
      doc.text(`DATE: ${new Date().toLocaleDateString()}`, 196, 26, { align: "right" });

      // Clean horizontal divider line in header
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(14, 31, 196, 31);

      // Page Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
      doc.text("Design Specifications Sheet", 14, 52);

      // Section: Order Information (Left Column)
      doc.setFillColor(BG_CARD[0], BG_CARD[1], BG_CARD[2]);
      doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
      doc.setLineWidth(0.2);
      doc.roundedRect(14, 58, 88, 62, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(BRAND_COLOR[0], BRAND_COLOR[1], BRAND_COLOR[2]);
      doc.text("ORDER INFO", 20, 66);

      doc.setFontSize(9);
      doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
      doc.text("Shopify Store:", 20, 74);
      doc.setFont("helvetica", "normal");
      doc.text(queryParams.shopifyBaseUrl || "N/A", 20, 78);

      doc.setFont("helvetica", "bold");
      doc.text("Quick ID:", 20, 86);
      doc.setFont("helvetica", "normal");
      doc.text(queryParams.quinckId || "N/A", 20, 90);

      doc.setFont("helvetica", "bold");
      doc.text("Quantity:", 20, 98);
      doc.setFont("helvetica", "normal");
      doc.text(String(qty), 20, 102);

      const customTextVal = textLayers.map(l => l.text).join(", ") || state.frontText || state.backText || "N/A";
      doc.setFont("helvetica", "bold");
      doc.text("Custom Text:", 20, 110);
      doc.setFont("helvetica", "normal");
      // Clip custom text if it's too long
      const textToDisplay = customTextVal.length > 35 ? customTextVal.slice(0, 32) + "..." : customTextVal;
      doc.text(textToDisplay, 20, 114);

      // Section: Specifications (Right Column)
      doc.setFillColor(BG_CARD[0], BG_CARD[1], BG_CARD[2]);
      doc.roundedRect(108, 58, 88, 62, 3, 3, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(BRAND_COLOR[0], BRAND_COLOR[1], BRAND_COLOR[2]);
      doc.text("JERSEY DETAILS", 114, 66);

      // Specs list
      const specs = [
        { label: "Base Jersey Style", val: selectedDesign },
        { label: "Collar Type", val: `${state.collarType || "None"} (${state.collar ? "Yes" : "No"})` },
        { label: "Sleeve Type", val: state.sleeve },
        { label: "Fabric Material", val: state.fabric },
        { label: "Primary Color", val: state.primaryColorSide === "Both" ? state.primary : `Front: ${state.primaryFront}, Back: ${state.primaryBack}` },
        { label: "Secondary Color", val: state.secondary }
      ];

      doc.setFontSize(9);
      let specY = 74;
      specs.forEach(spec => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
        doc.text(`${spec.label}:`, 114, specY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
        const cleanVal = String(spec.val || "N/A");
        const valToDisplay = cleanVal.length > 30 ? cleanVal.slice(0, 27) + "..." : cleanVal;
        doc.text(valToDisplay, 146, specY);
        specY += 7;
      });

      // Side-by-Side Mini Preview Section at the bottom of Page 1
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(DARK_TEXT[0], DARK_TEXT[1], DARK_TEXT[2]);
      doc.text("Quick Previews", 14, 134);

      // Draw frames for preview
      doc.setFillColor(BG_CARD[0], BG_CARD[1], BG_CARD[2]);
      doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);

      // Front preview frame
      doc.roundedRect(14, 140, 88, 120, 2, 2, "FD");
      doc.addImage(frontDataUrl, "JPEG", 16, 142, 84, 116);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(MUTED_TEXT[0], MUTED_TEXT[1], MUTED_TEXT[2]);
      doc.text("FRONT VIEW", 58, 254, { align: "center" });

      // Back preview frame
      doc.roundedRect(108, 140, 88, 120, 2, 2, "FD");
      doc.addImage(backDataUrl, "JPEG", 110, 142, 84, 116);
      doc.text("BACK VIEW", 152, 254, { align: "center" });

      // Footer for page 1
      drawFooter(1, 1);

      const pdfBlob = new Blob([doc.output("arraybuffer")], { type: "application/pdf" });
      // Cache the blob so the Download button can use it without any network call
      pdfBlobRef.current = pdfBlob;

      // 3. Assemble FormData
      toast.loading("Uploading files and saving design...", { id: loadingToastId });
      const formData = new FormData();

      // Helper function to convert base64 to File
      const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      };

      const frontFile = dataURLtoFile(frontPngUrl, "front-view.png");
      const backFile = dataURLtoFile(backPngUrl, "back-view.png");
      const pdfFile = new File([pdfBlob], "design-summary.pdf", { type: "application/pdf" });

      formData.append("quinckId", queryParams.quinckId);
      formData.append("ForntSideImage", frontFile);
      formData.append("BackSideImage", backFile);
      formData.append("CustomText", customTextVal);
      formData.append("Quintity", qty);
      formData.append("ShopifyBaseUrl", queryParams.shopifyBaseUrl);
      formData.append("PdfLink", pdfFile);

      // 4. Hit POST API
      const response = await fetch("/api/checkout", {
        method: "POST",
        body: formData,
      });

      console.log("my response", response);
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.message || "Failed to submit custom design.");
      }

      const result = await response.json();
      setCheckoutResult(result);
      toast.success("Design saved successfully! Proceeding to checkout...", {
        id: loadingToastId,
      });

    } catch (err) {
      console.error("Checkout process failed:", err);
      toast.error(err.message || "Checkout failed. Please try again.", {
        id: loadingToastId,
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleExport = () => {
    const triggerLocalDownload = (dataUrl, fileName) => {

      console.log("my data", dataUrl, fileName)

      try {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        // Clean up immediately to unblock the browser event loop
        setTimeout(() => {
          if (link.parentNode) {
            document.body.removeChild(link);
          }
          if (dataUrl.startsWith("blob:")) {
            URL.revokeObjectURL(dataUrl); // Free up client-side memory safely
          }
        }, 100);
      } catch (err) {
        console.error(`Error triggering download for ${fileName}:`, err);
      }
    };

    // 1. Client-side 3D Canvas Snapshot (Immediate)
    setTimeout(() => {
      try {
        if (threeRef.current) {
          const { gl, scene, camera } = threeRef.current;
          gl.render(scene, camera);
          const dataURL = gl.domElement.toDataURL("image/png");
          triggerLocalDownload(dataURL, "jersey-3d-preview.png");
        } else {
          console.warn("threeRef.current is null - skipping 3D snapshot");
        }
      } catch (err) {
        console.error("Error capturing 3D preview snapshot:", err);
      }
    }, 0);

    // 2. Client-side Flat Production Texture Export (Staggered by 300ms)
    setTimeout(() => {
      try {
        const activeSide =
          currentView === "back" || currentView === "back-center"
            ? "Back"
            : "Front";

        const activeDecalTexture =
          activeSide === "Back"
            ? texturesRef.current.back
            : texturesRef.current.front;
        const activePatternTexture =
          activeSide === "Back"
            ? texturesRef.current.patternBack
            : texturesRef.current.patternFront;

        if (activeDecalTexture && activeDecalTexture.image) {
          const size = 1024;
          const exportCanvas = document.createElement("canvas");
          exportCanvas.width = size;
          exportCanvas.height = size;
          const exportCtx = exportCanvas.getContext("2d");
          if (exportCtx) {
            // 1. Draw base pattern/background color if pattern exists
            if (activePatternTexture && activePatternTexture.image) {
              exportCtx.drawImage(activePatternTexture.image, 0, 0);
            } else {
              // Fallback: fill with active side primary color
              const fallbackColor =
                activeSide === "Front"
                  ? state.primaryFront || state.primary || "#2196F3"
                  : state.primaryBack || state.primary || "#2196F3";
              exportCtx.fillStyle = fallbackColor;
              exportCtx.fillRect(0, 0, size, size);
            }

            // 2. Draw active text/logo decals on top
            exportCtx.drawImage(activeDecalTexture.image, 0, 0);

            const dataURL = exportCanvas.toDataURL("image/png");
            triggerLocalDownload(dataURL, "jersey-print-template.png");
          }
        } else {
          console.warn(
            "activeDecalTexture or activeDecalTexture.image is null - skipping flat texture",
          );
        }
      } catch (err) {
        console.error("Error capturing flat print template:", err);
      }
    }, 300);

    // 3. Download Configuration State as JSON file (Staggered by 600ms)
    setTimeout(() => {
      try {
        const configData = {
          selectedDesign,
          generalState: state,
          textLayers,
          logoLayers,
          timestamp: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(configData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        triggerLocalDownload(url, "jersey-config.json");
      } catch (err) {
        console.error("Error downloading config JSON:", err);
      }
    }, 600);
  };

  const handleEraserStart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedLayer = logoLayers.find((l) => l.id === selectedLogoId);
    if (!selectedLayer) return;

    const container = e.currentTarget.getBoundingClientRect();

    const getCoords = (evt) => {
      if ("touches" in evt && evt.touches.length > 0) {
        return {
          clientX: evt.touches[0].clientX,
          clientY: evt.touches[0].clientY,
        };
      }
      const me = evt;
      return { clientX: me.clientX, clientY: me.clientY };
    };

    const initCoords = "touches" in e ? e.touches[0] : e;
    const startMouseX = initCoords.clientX;
    const startMouseY = initCoords.clientY;

    const getLocalPoint = (clientX, clientY) => {
      const logoCenterX =
        container.left +
        (selectedLayer.x - canvasSize / 2) * logoEditorScale +
        editorWidth / 2;
      const logoCenterY =
        container.top +
        logoEditorOffsetY +
        (selectedLayer.y - canvasSize / 2) * logoEditorScale +
        editorWidth / 2;

      const dx = (clientX - logoCenterX) / logoEditorScale;
      const dy = (clientY - logoCenterY) / logoEditorScale;

      const rad = (-selectedLayer.rotation * Math.PI) / 180;
      const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
      const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

      const img = loadedLogoImages[selectedLayer.src];
      const imgWidth = img ? img.naturalWidth || img.width || 200 : 200;
      const imgHeight = img ? img.naturalHeight || img.height || 200 : 200;

      const lx = localX / selectedLayer.scale + imgWidth / 2;
      const ly = localY / selectedLayer.scale + imgHeight / 2;

      return { x: lx, y: ly };
    };

    const initialPoint = getLocalPoint(startMouseX, startMouseY);
    const localBrushSize = eraserBrushSize / selectedLayer.scale;

    const newStroke = {
      points: [initialPoint],
      size: localBrushSize,
    };

    const updatedPaths = [...(selectedLayer.eraserPaths || []), newStroke];
    setLogoLayers((prev) =>
      prev.map((l) =>
        l.id === selectedLayer.id ? { ...l, eraserPaths: updatedPaths } : l,
      ),
    );

    const handleMove = (moveEvt) => {
      const { clientX, clientY } = getCoords(moveEvt);
      const pt = getLocalPoint(clientX, clientY);

      setLogoLayers((prev) =>
        prev.map((l) => {
          if (l.id !== selectedLayer.id) return l;
          const paths = l.eraserPaths || [];
          if (paths.length === 0) return l;
          const lastPath = paths[paths.length - 1];
          const updatedLastPath = {
            ...lastPath,
            points: [...lastPath.points, pt],
          };
          return {
            ...l,
            eraserPaths: [...paths.slice(0, -1), updatedLastPath],
          };
        }),
      );
    };

    const handleEnd = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
  };

  const handleLogoDragStart = (e, id) => {
    e.preventDefault();
    setSelectedLogoId(id);
    setSelectedLayerId(null); // Deselect text layers

    const layer = logoLayers.find((l) => l.id === id);
    if (!layer) return;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startX = layer.x;
    const startY = layer.y;

    const handleMouseMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startMouseX) / logoEditorScale;
      const deltaY = (moveEvent.clientY - startMouseY) / logoEditorScale;

      const snapResultX = getSnapValue(startX + deltaX);
      const snapResultY = getSnapValue(startY + deltaY);

      setSnapX(snapResultX.type ? snapResultX.value : null);
      setSnapY(snapResultY.type ? snapResultY.value : null);

      const snapType = snapResultX.type || snapResultY.type || null;
      setSnapType(snapType);

      setLogoLayers((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
              ...l,
              x: snapResultX.value,
              y: snapResultY.value,
            }
            : l,
        ),
      );
    };

    const handleMouseUp = () => {
      setSnapX(null);
      setSnapY(null);
      setSnapType(null);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleLogoRotateStart = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const layer = logoLayers.find((l) => l.id === id);
    if (!layer) return;

    const target = e.currentTarget.parentElement?.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startAngle = Math.atan2(startMouseY - centerY, startMouseX - centerX);
    const startRotation = layer.rotation;

    const handleMouseMove = (moveEvent) => {
      const currentAngle = Math.atan2(
        moveEvent.clientY - centerY,
        moveEvent.clientX - centerX,
      );
      const angleDiff = currentAngle - startAngle;
      let newRotation = startRotation + angleDiff * (180 / Math.PI);
      newRotation = ((newRotation % 360) + 360) % 360;

      setLogoLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, rotation: newRotation } : l)),
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleLogoScaleStart = (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    const layer = logoLayers.find((l) => l.id === id);
    if (!layer) return;

    const target = e.currentTarget.parentElement?.parentElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startDist = Math.sqrt(
      Math.pow(startMouseX - centerX, 2) + Math.pow(startMouseY - centerY, 2),
    );
    const startScale = layer.scale;

    const handleMouseMove = (moveEvent) => {
      const curDist = Math.sqrt(
        Math.pow(moveEvent.clientX - centerX, 2) +
        Math.pow(moveEvent.clientY - centerY, 2),
      );
      const newScale = Math.max(0.01, startScale * (curDist / startDist));

      setLogoLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, scale: newScale } : l)),
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleLogoCopy = (id) => {
    const layer = logoLayers.find((l) => l.id === id);
    if (!layer) return;

    const newLayer = {
      ...layer,
      id: `${layer.id}-copy-${Date.now()}`,
      x: Math.min(1024, layer.x + 40),
      y: Math.min(1024, layer.y + 40),
    };

    setLogoLayers((prev) => [...prev, newLayer]);
    setSelectedLogoId(newLayer.id);
    setSelectedLayerId(null);
  };

  const handleLogoDelete = (id) => {
    setLogoLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLogoId === id) {
      setSelectedLogoId(null);
    }
  };

  const handleAddLogoLayer = (src, type = "logo") => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const imgWidth = img.naturalWidth || img.width || 200;
      const imgHeight = img.naturalHeight || img.height || 200;
      const maxDim = Math.max(imgWidth, imgHeight);

      let initialScale = 1.0;
      let initialX = 512;
      let initialY = 512;

      if (type === "image") {
        initialScale = Math.min(1024 / imgWidth, 1024 / imgHeight) * 1.3;
        initialX = 512;
        initialY = 512;
      } else {
        const targetSize = 80;
        initialScale = targetSize / maxDim;
        initialX = 512;
        initialY = 500;
      }

      const newId = `custom-logo-${Date.now()}`;
      const newLayer = {
        id: newId,
        src,
        x: initialX,
        y: initialY,
        scale: initialScale,
        rotation: 0,
        side: activeSide,
        baseSize: 200,
        opacity: 1.0,
        type,
        zOrder: type === "image" ? "bottom" : undefined,
      };

      setLoadedLogoImages((prev) => ({
        ...prev,
        [src]: img,
      }));
      setLogoLayers((prev) => [...prev, newLayer]);
      setSelectedLogoId(newId);
      setSelectedLayerId(null);
    };
  };

  useEffect(() => {
    const sideLogos = logoLayers.filter((l) => l.side === activeSide);
    if (sideLogos.length > 0) {
      const currentSelected = logoLayers.find((l) => l.id === selectedLogoId);
      if (!currentSelected || currentSelected.side !== activeSide) {
        setSelectedLogoId(sideLogos[0].id);
      }
    } else {
      setSelectedLogoId(null);
    }
  }, [currentView, activeSide]);

  useEffect(() => {
    if (activeTab === "text") {
      setSelectedLogoId(null);
    } else if (activeTab === "logos") {
      setSelectedLayerId(null);
    }
  }, [activeTab]);

  useEffect(() => {
    const sideLayers = textLayers.filter((l) => l.side === activeSide);
    if (sideLayers.length > 0) {
      const currentSelected = textLayers.find((l) => l.id === selectedLayerId);
      if (!currentSelected || currentSelected.side !== activeSide) {
        setSelectedLayerId(sideLayers[0].id);
      }
    } else {
      setSelectedLayerId(null);
    }
  }, [currentView, activeSide]);

  useEffect(() => {
    const savedLogos = localStorage.getItem("jersey_uploaded_logos");
    if (savedLogos) {
      try {
        setUploadedLogos(JSON.parse(savedLogos));
      } catch (e) {
        console.error(e);
      }
    }
    const savedImages = localStorage.getItem("jersey_uploaded_images");
    if (savedImages) {
      try {
        setUploadedImages(JSON.parse(savedImages));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Web Font Loader to load premium fonts asynchronously
  const [fontsLoaded, setFontsLoaded] = useState(false);
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Orbitron:wght@900&family=Rubik+Glitch&family=Monoton&family=UnifrakturMaguntia&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    document.fonts.ready.then(() => {
      console.log("Premium custom fonts loaded successfully!");
      setFontsLoaded(true);
      // Force canvas texture update by copying textLayers state
      setTextLayers((prev) => [...prev]);
    });

    return () => {
      try {
        document.head.removeChild(link);
      } catch (e) {
        console.error(e);
      }
    };
  }, []);

  const activePatternSide = useCustomizerStore((s) => s.activePatternSide);
  const setActivePatternSide = useCustomizerStore(
    (s) => s.setActivePatternSide,
  );
  const state = useCustomizerStore((s) => s.state);
  const setState = useCustomizerStore((s) => s.setState);
  const updateState = useCustomizerStore((s) => s.updateState);
  const loadedPatterns = useCustomizerStore((s) => s.loadedPatterns);
  const setLoadedPatterns = useCustomizerStore((s) => s.setLoadedPatterns);

  useEffect(() => {
    const activePatterns = [
      state.fabricPatternFront,
      state.fabricPatternBack,
    ].filter((p) => p && p !== "None");

    activePatterns.forEach((patternPath) => {
      if (loadedPatterns[patternPath]) return;

      const img = new Image();
      img.src = patternPath;
      img.onload = () => {
        setLoadedPatterns((prev) => ({
          ...prev,
          [patternPath]: img,
        }));
      };
    });
  }, [state.fabricPatternFront, state.fabricPatternBack, loadedPatterns]);

  const setLogoPositionPreset = (pos) => {
    let x = 0.065,
      y = 0.16,
      z = 0.15;
    let rx = 0,
      ry = 0,
      rz = 0;

    switch (pos) {
      case "Left Chest":
        x = 0.065;
        y = 0.16;
        z = 0.15;
        rx = 0;
        ry = 0;
        rz = 0;
        break;
      case "Right Chest":
        x = -0.065;
        y = 0.16;
        z = 0.15;
        rx = 0;
        ry = 0;
        rz = 0;
        break;
      case "Center":
        x = 0.0;
        y = 0.08;
        z = 0.15;
        rx = 0;
        ry = 0;
        rz = 0;
        break;
      case "Back Top":
        x = 0.0;
        y = 0.23;
        z = -0.15;
        rx = 0;
        ry = Math.PI;
        rz = 0;
        break;
      case "Back Center":
        x = 0.0;
        y = 0.05;
        z = -0.15;
        rx = 0;
        ry = Math.PI;
        rz = 0;
        break;
      case "Sleeve":
        x = 0.22;
        y = 0.16;
        z = 0.0;
        rx = 0;
        ry = Math.PI / 2;
        rz = 0;
        break;
    }

    setState((s) => ({
      ...s,
      logoPosition: pos,
      logoPosX: x,
      logoPosY: y,
      logoPosZ: z,
      logoRotX: rx,
      logoRotY: ry,
      logoRotZ: rz,
    }));
  };

  const handleLogoUpload = (e, uploadType = "logo") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      handleAddLogoLayer(dataUrl, uploadType);
      if (uploadType === "image") {
        setUploadedImages((prev) => {
          const next = [
            dataUrl,
            ...prev.filter((item) => item !== dataUrl),
          ].slice(0, 12);
          localStorage.setItem("jersey_uploaded_images", JSON.stringify(next));
          return next;
        });
      } else {
        setUploadedLogos((prev) => {
          const next = [
            dataUrl,
            ...prev.filter((item) => item !== dataUrl),
          ].slice(0, 12);
          localStorage.setItem("jersey_uploaded_logos", JSON.stringify(next));
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const calculatePrice = () => {
    let base = 49;
    if (qty >= 10 && qty < 50) base = 39;
    if (qty >= 50) base = 29;
    if (state.fabric === "Premium") base += 10;
    return base * qty;
  };

  const currentPattern =
    JERSEY_DESIGNS.find((d) => d.id === selectedDesign)?.pattern ?? "plain";

  return (
    <div
      className="flex h-screen w-full bg-white flex-col md:flex-row"
      data-lenis-prevent
    >
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200">
        <Link href="/" className="text-zinc-600">
          <ChevronLeft />
        </Link>
        <div className="font-bold">Jersey Builder</div>
      </div>

      {/* ── Icon Sidebar ── */}
      <div className="hidden md:flex w-20 flex-col items-center bg-white border-r border-zinc-200 py-6 gap-4 z-20 overflow-y-auto">
        {/* Brand Logo */}
        <Link href="/" className="mb-2">
          <img
            src={LogoImg.src}
            alt="Logo"
            width={60}
            height={40}
            className="cursor-pointer object-contain"
          />
        </Link>
        {TABS?.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative group py-2.5 rounded-xl flex flex-col items-center justify-center cursor-pointer gap-1 transition-all duration-300 w-16 ${isActive
                ? "text-[#00263C]"
                : "text-zinc-400 hover:text-[#00263C]"
                }`}
            >
              {/* Highlight background pill for active state */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-[#00263C]/5 border-l-2 border-[#00263C] rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <tab.icon
                className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"
                  }`}
              />

              <span
                className={`text-[10px] tracking-wide text-center transition-all duration-300 ${isActive
                  ? "font-bold"
                  : "font-medium text-zinc-500 group-hover:text-[#00263C]"
                  }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Settings Panel ── */}
      <div className="w-full md:w-80 bg-white border-r border-zinc-200 flex flex-col h-full z-10 shadow-lg">
        <div className="p-5 border-b border-zinc-200 bg-zinc-50/60">
          <h2 className="text-xl font-bold text-[#00263C] capitalize">
            {TABS.find((t) => t.id === activeTab)?.label}
          </h2>
          <p className="text-sm text-[#00263C] mt-0.5">Customize your jersey</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
            >
              {/* ── DESIGNS TAB ── */}
              {activeTab === "designs" && <DesignsTab />}

              {/* ── COLORS TAB ── */}
              {activeTab === "colors" && <ColorsTab />}

              {/* ── PATTERNS TAB ── */}
              {activeTab === "patterns" && <PatternsTab />}

              {/* ── TEXT TAB ── */}
              {activeTab === "text" && (
                <TextTab
                  handleAddCustomText={handleAddCustomText}
                  handleDragStart={handleDragStart}
                  renderTextLayer={renderTextLayer}
                  handleCopy={handleCopy}
                  handleRotateStart={handleRotateStart}
                  handleDelete={handleDelete}
                  handleScaleStart={handleScaleStart}
                  editorScale={editorScale}
                />
              )}

              {/* ── LOGOS TAB ── */}
              {activeTab === "logos" && (
                <LogosTab
                  handleLogoUpload={handleLogoUpload}
                  handleEraserStart={handleEraserStart}
                  renderLogoLayer={renderLogoLayer}
                  handleLogoDragStart={handleLogoDragStart}
                  handleLogoCopy={handleLogoCopy}
                  handleLogoRotateStart={handleLogoRotateStart}
                  handleLogoDelete={handleLogoDelete}
                  handleLogoScaleStart={handleLogoScaleStart}
                  handleAddLogoLayer={handleAddLogoLayer}
                  reorderLayers={reorderLayers}
                  handleCopy={handleCopy}
                  handleDelete={handleDelete}
                  editorScale={logoEditorScale}
                  ERASER_CURSOR={ERASER_CURSOR}
                />
              )}

              {/* ── STYLE TAB ── */}
              {activeTab === "style" && <StyleTab />}

              {/* ── FABRIC TAB ── */}
              {activeTab === "fabric" && <FabricTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── 3D Canvas ── */}
      <div
        className="flex-1 relative flex flex-col"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${state.primary}18 0%, #f0f0f0 65%)`,
        }}
      >
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-end gap-3 z-10 pointer-events-none">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm pointer-events-auto hover:bg-zinc-50 transition-all">
            <Save className="w-4 h-4" /> Save
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm pointer-events-auto hover:bg-zinc-50 transition-all">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm font-bold text-sm pointer-events-auto hover:bg-zinc-50 transition-all"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Design name badge */}
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-white/80 backdrop-blur-sm text-xs font-bold text-zinc-700 px-3 py-1.5 rounded-full shadow border border-zinc-200 capitalize">
            {JERSEY_DESIGNS.find((d) => d.id === selectedDesign)?.label ??
              "Custom"}{" "}
            Design
            {state.collar ? ` • ${state.collarType} Collar` : ""}
            {state.collar &&
              (state.collarType === "Polo" || state.collarType === "Henley")
              ? ` (${state.zipper ? "Zipper" : "Buttons"})`
              : ""}
          </span>
        </div>

        <Jersey3DViewer threeRef={threeRef} texturesRef={texturesRef} />

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-black/5">
          <button
            onClick={() => setCurrentView("front")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${currentView === "front" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"}`}
          >
            Front
          </button>
          <button
            onClick={() => setCurrentView("back")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${currentView === "back" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"}`}
          >
            Back
          </button>
          <button
            onClick={() => setCurrentView("sleeves")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${currentView === "sleeves" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"}`}
          >
            Sleeves
          </button>
          <button
            onClick={() => setCurrentView("360")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${currentView === "360" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-600"}`}
          >
            360° View
          </button>
        </div>
      </div>

      {/* ── Right Pricing Panel ── */}
      <div className="w-full md:w-72 bg-white border-l border-zinc-200 flex flex-col h-full shadow-2xl z-20">
        <div className="p-5 border-b border-zinc-200 flex-1 overflow-y-auto">
          <h2 className="text-lg font-bold text-zinc-900 mb-5">
            Order Summary
          </h2>

          {/* Live preview thumbnail */}
          <div className="w-24 h-24 mx-auto mb-4">
            <JerseySVG
              primary={state.primary}
              secondary={state.designColor || state.secondary}
              pattern={currentPattern}
              selected={false}
            />
          </div>
          <p className="text-center text-xs font-bold text-zinc-500 mb-5 capitalize">
            {JERSEY_DESIGNS.find((d) => d.id === selectedDesign)?.label} ·{" "}
            {state.sleeve} Sleeve
          </p>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Base Jersey</span>
              <span className="font-bold text-zinc-900">
                ${qty >= 10 ? (qty >= 50 ? "29" : "39") : "49"}
              </span>
            </div>
            {state.fabric === "Premium" && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Premium Fabric</span>
                <span className="font-bold text-zinc-900">+$10</span>
              </div>
            )}
            {state.collar && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Collar</span>
                <span className="font-bold text-zinc-900">Included</span>
              </div>
            )}
            {state.collar &&
              (state.collarType === "Polo" ||
                state.collarType === "Henley") && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Closure</span>
                  <span className="font-bold text-zinc-900">
                    {state.zipper ? "Zipper (+$5)" : "Button Placket"}
                  </span>
                </div>
              )}

            <div className="border-t border-zinc-100 pt-4">
              <label className="text-xs font-bold text-zinc-500 mb-2 block uppercase tracking-wider">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full border border-zinc-200 rounded p-2.5 text-center font-bold focus:outline-red-500 text-lg"
              />

              <div className="text-[11px] text-green-600 mt-2 font-semibold text-center">
                {qty >= 50
                  ? "🎉 50+ Bulk discount applied!"
                  : qty >= 10
                    ? `Team discount! Add ${50 - qty} more for bulk rate.`
                    : `Add ${10 - qty} more for team discount.`}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-zinc-50 border-t border-zinc-200">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-zinc-600">Total</span>
            <span className="text-3xl font-extrabold text-zinc-900">
              $
              {calculatePrice() +
                (state.collar &&
                  (state.collarType === "Polo" ||
                    state.collarType === "Henley") &&
                  state.zipper
                  ? 5 * qty
                  : 0)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isCheckoutLoading}
            className="w-full py-4 bg-[#A42325] hover:bg-[#A42325]/80 text-white rounded font-bold shadow-lg shadow-[#A42325]/30 flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckoutLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Checkout...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" /> Proceed to Checkout
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {checkoutResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-zinc-100 flex flex-col font-sans"
            >
              <div className="p-6 text-center border-b border-zinc-100 bg-zinc-50/50">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-extrabold text-zinc-900">Design Saved Successfully!</h3>
                <p className="text-sm text-zinc-500 mt-1">Your design has been processed and stored on AWS S3 & MongoDB.</p>
              </div>

              <div className="p-6 space-y-4 flex-1 text-sm text-zinc-600 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2 py-2 border-b border-zinc-100 font-medium">
                  <span className="text-zinc-400">Parameter</span>
                  <span className="col-span-2 text-zinc-900">Value</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-zinc-400">Quick ID</span>
                  <span className="col-span-2 font-bold text-zinc-800 break-all">{checkoutResult.quinckId || "N/A"}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-zinc-400">Quantity</span>
                  <span className="col-span-2 font-bold text-zinc-800">{checkoutResult.Quintity}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-zinc-400">Custom Text</span>
                  <span className="col-span-2 font-medium text-zinc-700">{checkoutResult.CustomText || "None"}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-zinc-400">Front Preview</span>
                  <a href={checkoutResult.ForntSideImage} target="_blank" rel="noopener noreferrer" className="col-span-2 text-blue-600 font-semibold hover:underline break-all">
                    View Front Image URL
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-zinc-400">Back Preview</span>
                  <a href={checkoutResult.BackSideImage} target="_blank" rel="noopener noreferrer" className="col-span-2 text-blue-600 font-semibold hover:underline break-all">
                    View Back Image URL
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <span className="font-semibold text-zinc-400">PDF Summary</span>
                  <button
                    type="button"
                    onClick={() => {
                      // Use the PDF blob cached in memory — no network / CORS needed
                      const blob = pdfBlobRef.current;
                      if (!blob) {
                        toast.error("PDF is not available. Please try again.");
                        return;
                      }
                      const blobUrl = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = blobUrl;
                      link.download = "design-summary.pdf";
                      document.body.appendChild(link);
                      link.click();
                      setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(blobUrl);
                      }, 100);
                    }}
                    className="col-span-2 text-red-600 font-semibold hover:underline break-all flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    Download Summary PDF
                  </button>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutResult(null)}
                  className="flex-1 py-3 border border-zinc-200 text-zinc-700 rounded-xl font-bold hover:bg-zinc-100 transition-colors"
                >
                  Configure More
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Use ShopifyBaseUrl from checkoutResult (saved from query param in DB)
                    // Fallback to queryParams.shopifyBaseUrl, then to hardcoded URL
                    const baseUrl =
                      checkoutResult.ShopifyBaseUrl ||
                      queryParams.shopifyBaseUrl ||
                      "https://bigfish170.com/products/bigfish-custom-product";

                    const params = new URLSearchParams({
                      orderId: checkoutResult._id || checkoutResult.quinckId || "",
                      quantity: String(checkoutResult.Quintity || qty || 1),
                      frontImage: checkoutResult.ForntSideImage || "",
                      backimage: checkoutResult.BackSideImage || "",
                      pdfLink: checkoutResult.PdfLink || "",
                      customText: checkoutResult.CustomText || "",
                    });
                    window.open(`${baseUrl}?${params.toString()}`, "_blank");
                  }}
                  className="flex-1 py-3 bg-[#A42325] text-white rounded-xl font-bold hover:bg-[#A42325]/90 transition-colors shadow-lg shadow-[#A42325]/20"
                >
                  Go to Shopify
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCustomizerStore } from "@/components/customizer/useCustomizerStore";
import Jersey3DViewer from "@/components/customizer/Jersey3DViewer";
import { RotateCw, Sparkles, X, Download, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DesignPreviewPage() {
  const { id } = useParams();
  const threeRef = React.useRef(null);
  const texturesRef = React.useRef(null);
  const [loading, setLoading] = useState(true);
  const [design, setDesign] = useState(null);
  const [error, setError] = useState("");

  const state = useCustomizerStore((s) => s.state);
  const setState = useCustomizerStore((s) => s.setState);
  const textLayers = useCustomizerStore((s) => s.textLayers);
  const setTextLayers = useCustomizerStore((s) => s.setTextLayers);
  const logoLayers = useCustomizerStore((s) => s.logoLayers);
  const setLogoLayers = useCustomizerStore((s) => s.setLogoLayers);
  const selectedDesign = useCustomizerStore((s) => s.selectedDesign);
  const setSelectedDesign = useCustomizerStore((s) => s.setSelectedDesign);
  const currentView = useCustomizerStore((s) => s.currentView);
  const setCurrentView = useCustomizerStore((s) => s.setCurrentView);
  const loadedLogoImages = useCustomizerStore((s) => s.loadedLogoImages);
  const setLoadedLogoImages = useCustomizerStore((s) => s.setLoadedLogoImages);
  const setDynamicShapes = useCustomizerStore((s) => s.setDynamicShapes);

  // 1. Fetch the design from MongoDB
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/checkout/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.design) {
          setDesign(data.design);
          const ds = data.design.designState;
          if (ds) {
            // Populate customizer store states for 3D reconstruction
            if (ds.state) setState(ds.state);
            if (ds.textLayers) setTextLayers(ds.textLayers);
            if (ds.logoLayers) setLogoLayers(ds.logoLayers);
            if (ds.selectedDesign) setSelectedDesign(ds.selectedDesign);
          }
        } else {
          setError(data.message || "Failed to retrieve custom jersey design details.");
        }
      })
      .catch((err) => {
        console.error("Fetch design failed:", err);
        setError("Network error. Unable to load the design.");
      })
      .finally(() => setLoading(false));
  }, [id, setState, setTextLayers, setLogoLayers, setSelectedDesign]);

  // 2. Fetch dynamic shapes from the admin dashboard so custom shapes render correctly
  useEffect(() => {
    fetch("/api/design-shapes")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.shapes) {
          setDynamicShapes(data.shapes);
        }
      })
      .catch((e) => console.error("Error loading custom shapes in preview:", e));
  }, [setDynamicShapes]);

  // 3. Preload customized logo image layers into store
  useEffect(() => {
    if (!logoLayers || logoLayers.length === 0) return;
    logoLayers.forEach((layer) => {
      if (layer.src && !loadedLogoImages[layer.src]) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = layer.src;
        img.onload = () => {
          setLoadedLogoImages((prev) => ({ ...prev, [layer.src]: img }));
        };
      }
    });
  }, [logoLayers, loadedLogoImages, setLoadedLogoImages]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white font-sans">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-500 mb-3" />
        <p className="text-sm font-semibold tracking-wider opacity-80">Loading 3D Viewer...</p>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white p-6 font-sans text-center">
        <X className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Failed to Load Preview</h2>
        <p className="text-sm text-zinc-400 max-w-sm mb-6">{error || "Design not found in system."}</p>
        <Link href="/" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-zinc-950 text-white font-sans overflow-hidden">
      
      {/* ── Left side: Interactive 3D Model ──────────────────────────────── */}
      <div className="flex-1 relative h-[60%] md:h-full bg-gradient-to-b from-zinc-900 to-zinc-950">
        
        {/* Top Header */}
        <div className="absolute top-5 left-5 right-5 z-20 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm tracking-tighter">
              BF
            </div>
            <div>
              <h1 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Jersey Preview</h1>
              <p className="text-sm font-bold text-white leading-tight">Order #{design._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {design.PdfLink && (
              <a
                href={design.PdfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-bold border border-zinc-700 transition-all shadow"
              >
                <Download className="w-4 h-4" />
                PDF Sheet
              </a>
            )}
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="w-full h-full">
          <Jersey3DViewer threeRef={threeRef} texturesRef={texturesRef} />
        </div>

        {/* Camera Views Control Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-zinc-800 shadow-xl">
          {[
            { id: "front", label: "Front" },
            { id: "back", label: "Back" },
            { id: "sleeves", label: "Sleeve" },
            { id: "360", label: "360° Auto" }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setCurrentView(v.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                currentView === v.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Rotation indicator */}
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-1.5 bg-zinc-900/40 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] text-zinc-400 uppercase tracking-widest border border-zinc-800/30">
          <RotateCw className="w-3.5 h-3.5" />
          Drag to rotate
        </div>
      </div>

      {/* ── Right side: Specification Details Panel ───────────────────────── */}
      <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-6 overflow-y-auto flex flex-col justify-between h-[40%] md:h-full">
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Specifications
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Custom configurations summary</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Base Style</span>
              <span className="font-bold text-zinc-200 capitalize">{selectedDesign}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Fabric Material</span>
              <span className="font-bold text-zinc-200">{state.fabric || "Mesh"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Sleeve Type</span>
              <span className="font-bold text-zinc-200">{state.sleeve || "Short"} Sleeve</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Collar Type</span>
              <span className="font-bold text-zinc-200">{state.collarType || "None"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Closure</span>
              <span className="font-bold text-zinc-200">{state.zipper ? "Zipper" : "Button Placket"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Custom Text</span>
              <span className="font-bold text-indigo-400 truncate max-w-[150px]">{design.CustomText || "None"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Quantity</span>
              <span className="font-bold text-zinc-200">{design.Quintity || 1} pcs</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-800 mt-6 space-y-3">
          {design.PdfLink && (
            <a
              href={design.PdfLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg border border-zinc-700 flex items-center justify-center gap-2 transition-all shadow"
            >
              Open PDF Design Sheet
            </a>
          )}
          <Link
            href="/"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center justify-center transition-all shadow-lg shadow-indigo-600/20"
          >
            Create New Jersey
          </Link>
        </div>
      </div>
    </div>
  );
}

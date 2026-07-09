import React from "react";
import { useCustomizerStore } from "../useCustomizerStore";
import { Type } from "lucide-react";

export default function TextTab({
  handleAddCustomText,
  handleDragStart,
  renderTextLayer,
  handleCopy,
  handleRotateStart,
  handleDelete,
  handleScaleStart,
  editorScale,
}) {
  const currentView = useCustomizerStore((s) => s.currentView);
  const setCurrentView = useCustomizerStore((s) => s.setCurrentView);
  const textLayers = useCustomizerStore((s) => s.textLayers);
  const setTextLayers = useCustomizerStore((s) => s.setTextLayers);
  const selectedLayerId = useCustomizerStore((s) => s.selectedLayerId);
  const setSelectedLayerId = useCustomizerStore((s) => s.setSelectedLayerId);
  const updateState = useCustomizerStore((s) => s.updateState);
  const snapX = useCustomizerStore((s) => s.snapX);
  const snapY = useCustomizerStore((s) => s.snapY);
  const snapType = useCustomizerStore((s) => s.snapType);

  const activeSide =
    currentView === "back" || currentView === "back-center" ? "Back" : "Front";

  const selectedLayer = textLayers.find((l) => l.id === selectedLayerId);

  return (
    <div className="space-y-6">
      {/* Front/Back View Segmented Switcher */}
      <div className="flex bg-zinc-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setCurrentView("front")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
            activeSide === "Front"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Front Side
        </button>
        <button
          type="button"
          onClick={() => setCurrentView("back")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
            activeSide === "Back"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Back Side
        </button>
      </div>

      {/* Visual 2D Editor Canvas representation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
            Visual Text Editor <br /> ({activeSide} View)
          </label>
          <button
            onClick={handleAddCustomText}
            className="px-3 py-1 bg-[#00263C] hover:bg-[#001c2b] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <Type className="w-3.5 h-3.5" /> Add Text
          </button>
        </div>

        {/* Bounding Box Customizer Canvas area (280x400) */}
        <div
          className="relative w-[280px] h-[400px] rounded border border-zinc-200 shadow-inner mx-auto select-none overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
          }}
        >
          {/* Centered square workspace to maintain aspect ratios */}
          <div className="absolute top-[60px] left-0 w-[280px] h-[280px]">
            {/* 1. Backdrop (inside overflow-hidden) */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              {/* Jersey Silhouette Backdrop helper */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <svg viewBox="0 0 100 100" className="w-48 h-48 fill-white">
                  <path d="M 30,15 L 70,15 L 85,25 L 80,45 L 70,40 L 70,85 L 30,85 L 30,40 L 20,45 L 15,25 Z" />
                </svg>
              </div>
              {/* Canvas area grid lines */}
              <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#a1a1aa_1px,transparent_1px),linear-gradient(to_bottom,#a1a1aa_1px,transparent_1px)] bg-size-[14px_14px]" />
            </div>

            {/* Safe Area Box Indicator */}
            <div className="absolute top-[33px] left-[33px] right-[33px] bottom-[33px] border border-dashed border-blue-500/20 rounded-2xl pointer-events-none" />

            {/* Active side text label */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-zinc-500 tracking-widest uppercase pointer-events-none">
              {activeSide} Texture Map (1024x1024)
            </div>

            {/* Smart Snap Visual Guidelines */}
            {snapX !== null && (
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-blue-500 z-30 pointer-events-none"
                style={{ left: snapX * editorScale }}
              />
            )}
            {snapY !== null && (
              <div
                className="absolute left-0 right-0 border-t border-dashed border-blue-500 z-30 pointer-events-none"
                style={{ top: snapY * editorScale }}
              />
            )}
            {snapType && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#00263C] text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full shadow pointer-events-none z-30 tracking-wider">
                {snapType}
              </div>
            )}

            {/* 2. Text Content Container (Clipped at bounds) */}
            <div className="absolute inset-0 rounded-2xl">
              {textLayers
                .filter((layer) => layer.side === activeSide)
                .map((layer) => {
                  const isSelected = selectedLayerId === layer.id;
                  return (
                    <div
                      key={layer.id}
                      style={{
                        position: "absolute",
                        left: layer.x * editorScale,
                        top: layer.y * editorScale,
                        transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                        cursor: "move",
                        zIndex: isSelected ? 40 : 10,
                      }}
                      onMouseDown={(e) => handleDragStart(e, layer.id)}
                    >
                      {renderTextLayer(layer, false)}
                    </div>
                  );
                })}
            </div>

            {/* 3. Bounding Box & Handles Overlay (Visible outside bounds) */}
            <div className="absolute inset-0 pointer-events-none">
              {textLayers
                .filter(
                  (layer) =>
                    layer.side === activeSide && selectedLayerId === layer.id,
                )
                .map((layer) => {
                  return (
                    <div
                      key={`handles-text-${layer.id}`}
                      style={{
                        position: "absolute",
                        left: layer.x * editorScale,
                        top: layer.y * editorScale,
                        transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
                        pointerEvents: "none",
                        zIndex: 50,
                      }}
                    >
                      {renderTextLayer(
                        layer,
                        true,
                        <>
                          {/* Bounding Box Border */}
                          <div
                            className="absolute inset-0 border border-dashed border-blue-500"
                            style={{ visibility: "visible" }}
                          />

                          {/* Interactive Handles */}
                          <div style={{ visibility: "visible" }}>
                            {/* Top-Left: Duplicate */}
                            <button
                              className="absolute -top-3.5 -left-3.5 w-6 h-6 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleCopy(layer.id);
                              }}
                              title="Duplicate"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-zinc-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                                />
                              </svg>
                            </button>

                            {/* Top-Right: Rotate */}
                            <div
                              className="absolute -top-3.5 -right-3.5 w-6 h-6 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-md rounded-full flex items-center justify-center cursor-alias active:scale-90 transition-transform pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleRotateStart(e, layer.id);
                              }}
                              title="Rotate"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-zinc-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89"
                                />
                              </svg>
                            </div>

                            {/* Bottom-Left: Delete */}
                            <button
                              className="absolute -bottom-3.5 -left-3.5 w-6 h-6 bg-[#00263C] hover:bg-[#001c2b] shadow-md rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleDelete(layer.id);
                              }}
                              title="Delete"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>

                            {/* Bottom-Right: Scale */}
                            <div
                              className="absolute -bottom-3.5 -right-3.5 w-6 h-6 bg-blue-500 hover:bg-blue-600 shadow-md rounded-full flex items-center justify-center cursor-se-resize active:scale-90 transition-transform pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleScaleStart(e, layer.id);
                              }}
                              title="Scale"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                                />
                              </svg>
                            </div>
                          </div>
                        </>,
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Layers List Selection */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          Text Layers List ({activeSide} Side)
        </label>
        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
          {textLayers.filter((l) => l.side === activeSide).length === 0 ? (
            <div className="text-xs text-zinc-400 italic text-center py-2 bg-zinc-50 rounded-xl border border-zinc-100">
              No text layers on this side. Add one above!
            </div>
          ) : (
            textLayers
              .filter((l) => l.side === activeSide)
              .map((layer) => {
                const isSelected = selectedLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#00263C] bg-[#00263C]/5"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Type
                        className={`w-4 h-4 ${isSelected ? "text-[#00263C]" : "text-zinc-400"}`}
                      />

                      <span
                        className={`text-xs font-bold truncate max-w-[150px] ${isSelected ? "text-[#001724]" : "text-zinc-700"}`}
                      >
                        {layer.text || "(Empty Text)"}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleCopy(layer.id)}
                        className="p-1 hover:bg-zinc-100 rounded-md text-zinc-400 hover:text-zinc-600"
                        title="Duplicate"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(layer.id)}
                        className="p-1 hover:bg-[#00263C]/10 rounded-md text-zinc-400 hover:text-[#00263C]"
                        title="Delete"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Properties Panel of the Selected Layer */}
      {selectedLayer && (
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Layer Settings (
            {selectedLayer.id.startsWith("front-") ||
            selectedLayer.id.startsWith("back-")
              ? "System Layer"
              : "Custom Layer"}
            )
          </h4>

          <div>
            <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
              Text Content
            </label>
            <textarea
              value={selectedLayer.text}
              onChange={(e) => {
                const val = e.target.value;
                setTextLayers((prev) =>
                  prev.map((l) =>
                    l.id === selectedLayer.id ? { ...l, text: val } : l,
                  ),
                );
                if (selectedLayer.id === "front-text")
                  updateState("frontText", val);
                if (selectedLayer.id === "back-text")
                  updateState("backText", val);
                if (
                  selectedLayer.id === "front-number" ||
                  selectedLayer.id === "back-number"
                ) {
                  updateState("number", val);
                }
              }}
              className="w-full border border-zinc-200 rounded-xl p-3 text-zinc-900 font-medium focus:outline-none focus:border-[#00263C] text-sm resize-y min-h-[72px]"
              placeholder="Enter text..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
              Font Style
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                "Bold",
                "Italic",
                "Script",
                "Block",
                "Outline",
                "Varsity",
                "Serif Athletic",
                "Cyberpunk",
                "Grunge",
                "Neon Glow",
                "Gothic",
              ].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setTextLayers((prev) =>
                      prev.map((l) =>
                        l.id === selectedLayer.id ? { ...l, font: f } : l,
                      ),
                    );
                    if (selectedLayer.id === "front-text")
                      updateState("frontFont", f);
                    if (selectedLayer.id === "back-text")
                      updateState("backFont", f);
                    if (
                      selectedLayer.id === "front-number" ||
                      selectedLayer.id === "back-number"
                    ) {
                      updateState("numberFont", f);
                    }
                  }}
                  className={`p-1.5 rounded-full cursor-pointer border text-[10px] font-bold transition-all active:scale-90 duration-300 ${
                    selectedLayer.font === f
                      ? "border-[#00263C] bg-red-50 text-[#001724]"
                      : "border-[#002337] text-[#002337] hover:border-zinc-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 mb-1.5 block">
              Text Color
            </label>
            <div className="flex gap-1.5 flex-wrap items-center">
              {[
                "#FFFFFF",
                "#111111",
                "#00263C",
                "#2196F3",
                "#FFD700",
                "#2A9D8F",
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setTextLayers((prev) =>
                      prev.map((l) =>
                        l.id === selectedLayer.id ? { ...l, color: c } : l,
                      ),
                    );
                    if (selectedLayer.id === "front-text")
                      updateState("frontTextColor", c);
                    if (selectedLayer.id === "back-text")
                      updateState("backTextColor", c);
                    if (
                      selectedLayer.id === "front-number" ||
                      selectedLayer.id === "back-number"
                    ) {
                      updateState("numberColor", c);
                    }
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    selectedLayer.color === c
                      ? "border-zinc-900 scale-110"
                      : "border-black/10 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="w-px h-4 bg-zinc-300 mx-1"></div>
              <input
                type="color"
                value={selectedLayer.color}
                onChange={(e) => {
                  const val = e.target.value;
                  setTextLayers((prev) =>
                    prev.map((l) =>
                      l.id === selectedLayer.id ? { ...l, color: val } : l,
                    ),
                  );
                  if (selectedLayer.id === "front-text")
                    updateState("frontTextColor", val);
                  if (selectedLayer.id === "back-text")
                    updateState("backTextColor", val);
                  if (
                    selectedLayer.id === "front-number" ||
                    selectedLayer.id === "back-number"
                  ) {
                    updateState("numberColor", val);
                  }
                }}
                className="w-7 h-7 p-0 border-0 rounded cursor-pointer overflow-hidden"
              />
            </div>
          </div>

          {/* Base Font Size */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800 block">
              Base Font Size
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="15"
                max="300"
                value={selectedLayer.textSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTextLayers((prev) =>
                    prev.map((l) =>
                      l.id === selectedLayer.id ? { ...l, textSize: val } : l,
                    ),
                  );
                  if (selectedLayer.id === "front-text")
                    updateState("frontTextSize", val);
                  if (selectedLayer.id === "back-text")
                    updateState("backTextSize", val);
                }}
                className="flex-1 accent-[#00263C] h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
              />

              <div className="min-w-[56px] h-10 px-3 border border-zinc-200 bg-white rounded-lg flex items-center justify-center text-xs font-bold text-zinc-700">
                {selectedLayer?.textSize}
              </div>
            </div>
          </div>

          {/* Letter spacing */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800 block">
              Letter spacing
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="500"
                value={selectedLayer.letterSpacing || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTextLayers((prev) =>
                    prev.map((l) =>
                      l.id === selectedLayer.id
                        ? { ...l, letterSpacing: val }
                        : l,
                    ),
                  );
                }}
                className="flex-1 accent-[#00263C] h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
              />

              <div className="min-w-[56px] h-10 px-3 border border-zinc-200 bg-white shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-zinc-700">
                {selectedLayer.letterSpacing || 0}
              </div>
            </div>
          </div>

          {/* Line spacing */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800 block">
              Line spacing
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={selectedLayer.lineSpacing || 1.15}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTextLayers((prev) =>
                    prev.map((l) =>
                      l.id === selectedLayer.id
                        ? { ...l, lineSpacing: val }
                        : l,
                    ),
                  );
                }}
                className="flex-1 accent-[#00263C] h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
              />

              <div className="min-w-[56px] h-10 px-3 border border-zinc-200 bg-white shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-zinc-700">
                {(selectedLayer.lineSpacing || 1.15).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Text Curve */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-800 block">
              Text Curve
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-120"
                max="120"
                value={selectedLayer.curveRadius || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTextLayers((prev) =>
                    prev.map((l) =>
                      l.id === selectedLayer.id
                        ? { ...l, curveRadius: val }
                        : l,
                    ),
                  );
                }}
                className="flex-1 accent-[#00263C] h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
              />

              <div className="min-w-[56px] h-10 px-3 border border-zinc-200 bg-white shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-zinc-700">
                {selectedLayer.curveRadius || 0}°
              </div>
            </div>
          </div>

          {/* Text Outline */}
          <div className="space-y-3 pt-3 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800">
                Enable Text Outline
              </label>
              <input
                type="checkbox"
                checked={!!selectedLayer.outlineEnabled}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setTextLayers((prev) =>
                    prev.map((l) =>
                      l.id === selectedLayer.id
                        ? {
                            ...l,
                            outlineEnabled: checked,
                            outlineColor: l.outlineColor || "#FFFFFF",
                            outlineWidth:
                              typeof l.outlineWidth === "number"
                                ? l.outlineWidth
                                : 4,
                          }
                        : l,
                    ),
                  );
                }}
                className="w-4 h-4 text-[#00263C] border-zinc-300 rounded focus:ring-[#00263C] cursor-pointer"
              />
            </div>

            {selectedLayer.outlineEnabled && (
              <div className="space-y-3 pl-2 border-l-2 border-[#00263C]/20">
                {/* Outline Color */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-600">
                    Outline Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={selectedLayer.outlineColor || "#FFFFFF"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTextLayers((prev) =>
                          prev.map((l) =>
                            l.id === selectedLayer.id
                              ? { ...l, outlineColor: val }
                              : l,
                          ),
                        );
                      }}
                      className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden"
                    />

                    <span className="text-[10px] font-bold text-zinc-500 uppercase">
                      {selectedLayer.outlineColor || "#FFFFFF"}
                    </span>
                  </div>
                </div>

                {/* Outline Width */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-zinc-600">
                    <span>Outline Width</span>
                    <span>{selectedLayer.outlineWidth ?? 4}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={selectedLayer.outlineWidth ?? 4}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTextLayers((prev) =>
                        prev.map((l) =>
                          l.id === selectedLayer.id
                            ? { ...l, outlineWidth: val }
                            : l,
                        ),
                      );
                    }}
                    className="w-full accent-[#00263C] h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Text Shadow */}
          <div className="space-y-3 pt-3 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800">
                Enable Text Shadow
              </label>
              <input
                type="checkbox"
                checked={!!selectedLayer.shadowEnabled}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setTextLayers((prev) =>
                    prev.map((l) =>
                      l.id === selectedLayer.id
                        ? {
                            ...l,
                            shadowEnabled: checked,
                            shadowColor: l.shadowColor || "#000000",
                            shadowBlur:
                              typeof l.shadowBlur === "number"
                                ? l.shadowBlur
                                : 10,
                            shadowOffsetX:
                              typeof l.shadowOffsetX === "number"
                                ? l.shadowOffsetX
                                : 4,
                            shadowOffsetY:
                              typeof l.shadowOffsetY === "number"
                                ? l.shadowOffsetY
                                : 4,
                          }
                        : l,
                    ),
                  );
                }}
                className="w-4 h-4 text-[#00263C] border-zinc-300 rounded focus:ring-[#00263C] cursor-pointer"
              />
            </div>

            {selectedLayer.shadowEnabled && (
              <div className="space-y-3 pl-2 border-l-2 border-[#00263C]/20">
                {/* Shadow Color */}
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-600">
                    Shadow Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={selectedLayer.shadowColor || "#000000"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTextLayers((prev) =>
                          prev.map((l) =>
                            l.id === selectedLayer.id
                              ? { ...l, shadowColor: val }
                              : l,
                          ),
                        );
                      }}
                      className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden"
                    />

                    <span className="text-[10px] font-bold text-zinc-500 uppercase">
                      {selectedLayer.shadowColor || "#000000"}
                    </span>
                  </div>
                </div>

                {/* Shadow Blur */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-zinc-600">
                    <span>Shadow Blur</span>
                    <span>{selectedLayer.shadowBlur ?? 10}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={selectedLayer.shadowBlur ?? 10}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTextLayers((prev) =>
                        prev.map((l) =>
                          l.id === selectedLayer.id
                            ? { ...l, shadowBlur: val }
                            : l,
                        ),
                      );
                    }}
                    className="w-full accent-[#00263C] h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Offset X */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-zinc-600">
                    <span>Offset X</span>
                    <span>{selectedLayer.shadowOffsetX ?? 4}px</span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={selectedLayer.shadowOffsetX ?? 4}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTextLayers((prev) =>
                        prev.map((l) =>
                          l.id === selectedLayer.id
                            ? { ...l, shadowOffsetX: val }
                            : l,
                        ),
                      );
                    }}
                    className="w-full accent-[#00263C] h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Offset Y */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-zinc-600">
                    <span>Offset Y</span>
                    <span>{selectedLayer.shadowOffsetY ?? 4}px</span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={selectedLayer.shadowOffsetY ?? 4}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTextLayers((prev) =>
                        prev.map((l) =>
                          l.id === selectedLayer.id
                            ? { ...l, shadowOffsetY: val }
                            : l,
                        ),
                      );
                    }}
                    className="w-full accent-[#00263C] h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

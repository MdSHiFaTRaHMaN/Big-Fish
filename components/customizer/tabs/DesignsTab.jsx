import React, { useEffect, useState } from "react";
import { useCustomizerStore } from "../useCustomizerStore";
import { Toggle, JerseySVG, JERSEY_DESIGNS } from "../JerseyPresets";

export default function DesignsTab() {
  const state = useCustomizerStore((s) => s.state);
  const updateState = useCustomizerStore((s) => s.updateState);
  const selectedDesign = useCustomizerStore((s) => s.selectedDesign);
  const setSelectedDesign = useCustomizerStore((s) => s.setSelectedDesign);

  // Dynamic shapes from admin dashboard
  const dynamicShapes = useCustomizerStore((s) => s.dynamicShapes);
  const setDynamicShapes = useCustomizerStore((s) => s.setDynamicShapes);
  const [loadingShapes, setLoadingShapes] = useState(true);

  useEffect(() => {
    fetch("/api/design-shapes")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDynamicShapes(data.shapes);
      })
      .catch(() => { })
      .finally(() => setLoadingShapes(false));
  }, [setDynamicShapes]);

  // Find the selected dynamic shape's SVG
  const selectedDynamicShape = dynamicShapes.find(
    (s) => s.id === selectedDesign
  );

  return (
    <div className="space-y-5">
      {/* Collar toggle */}
      <div className="flex items-center justify-between py-3 border-b border-zinc-100">
        <span className="text-sm font-semibold text-[#00263C]">
          Add Collar
        </span>
        <Toggle
          value={state.collar}
          onChange={(v) => {
            updateState("collar", v);
            if (v && state.collarType === "None") {
              updateState("collarType", "Polo");
            }
          }}
        />
      </div>
      {/* Closure selection */}
      {state.collar &&
        (state.collarType === "Polo" ||
          state.collarType === "Henley") && (
          <div className="py-3 border-b border-zinc-100 space-y-2">
            <span className="text-sm font-semibold text-zinc-800 block">
              Closure Type
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateState("zipper", false)}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 duration-200 ${!state.zipper
                  ? "border-[#00263C] bg-[#00263C]/10 text-[#00263C] font-extrabold"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                  }`}
              >
                Button Placket
              </button>
              <button
                onClick={() => updateState("zipper", true)}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 duration-200 ${state.zipper
                  ? "border-[#00263C] bg-[#00263C]/10 text-[#00263C] font-extrabold"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                  }`}
              >
                Zipper (+$5)
              </button>
            </div>
          </div>
        )}

      {/* ── Built-in Designs ── */}
      <div className="grid grid-cols-4 gap-3 pt-1">
        {JERSEY_DESIGNS.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDesign(d.id)}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${selectedDesign === d.id
              ? "bg-[#00263C]/10 ring-2 ring-[#00263C]"
              : "hover:bg-zinc-50"
              }`}
          >
            <div className="w-14 h-14">
              <JerseySVG
                primary={state.primary}
                secondary={
                  selectedDesign === d.id
                    ? state.designColor || state.secondary
                    : state.secondary
                }
                pattern={d.pattern}
                selected={selectedDesign === d.id}
              />
            </div>
            <span
              className={`text-[9px] font-bold leading-tight text-center ${selectedDesign === d.id ? "text-[#00263C]" : "text-zinc-500"}`}
            >
              {d.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Custom Admin Designs ── */}
      {!loadingShapes && dynamicShapes.length > 0 && (
        <div className="pt-1">
          <div className="flex gap-2 mb-3">
            <div className="flex-1 h-px bg-zinc-100" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">
              Custom Designs
            </span>
            <div className="flex-1 h-px bg-zinc-100" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {dynamicShapes.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setSelectedDesign(shape.id)}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${selectedDesign === shape.id
                  ? "bg-[#00263C]/10 ring-2 ring-[#00263C]"
                  : "hover:bg-zinc-50"
                  }`}
              >
                <div className="w-14 h-14">
                  <JerseySVG
                    primary={state.primary}
                    secondary={
                      selectedDesign === shape.id
                        ? state.designColor || state.secondary
                        : state.secondary
                    }
                    pattern={shape.id}
                    dynamicSvg={shape.svgElements}
                    selected={selectedDesign === shape.id}
                  />
                </div>
                <span
                  className={`text-[9px] font-bold leading-tight text-center ${selectedDesign === shape.id ? "text-[#00263C]" : "text-zinc-500"}`}
                >
                  {shape.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading indicator for dynamic shapes */}
      {loadingShapes && (
        <div className="flex items-center justify-center py-4 gap-2 text-zinc-300">
          <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-400 rounded-full animate-spin" />
          <span className="text-xs font-medium text-zinc-400">Loading custom designs...</span>
        </div>
      )}

      {/* Design Side: Front / Back / Both & Shape Color Customization */}
      {selectedDesign !== "throw" && (
        <div className="pt-2 space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
              Apply To
            </label>
            <div className="flex gap-2">
              {["Front", "Back", "Both"].map((side) => (
                <button
                  key={side}
                  onClick={() => updateState("designSide", side)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${state.designSide === side
                    ? "border-[#00263C] bg-[#00263C]/10 text-[#00263C]"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                    }`}
                >
                  {side}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
              Design Color
            </label>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {[
                "#1A1A2E",
                "#FFFFFF",
                "#00263C",
                "#2196F3",
                "#FFD166",
                "#06D6A0",
                "#111111",
                "#8D99AE",
                "#FF5E7E",
                "#7B2CBF",
              ].map((c) => (
                <button
                  key={c}
                  onClick={() => updateState("designColor", c)}
                  className={`w-7 h-7 rounded-full border transition-transform ${state.designColor === c
                    ? "border-zinc-950 scale-110 ring-1 ring-offset-1 ring-zinc-400"
                    : "border-black/10 hover:scale-105"
                    }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={state.designColor || "#1A1A2E"}
                onChange={(e) =>
                  updateState("designColor", e.target.value)
                }
                className="w-8 h-8 rounded cursor-pointer border border-zinc-200 p-0"
              />
              <span className="text-xs text-zinc-500 font-mono">
                {(state.designColor || "#1A1A2E").toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { useCustomizerStore } from "../useCustomizerStore";

export default function ColorsTab() {
  const state = useCustomizerStore((s) => s.state);
  const setState = useCustomizerStore((s) => s.setState);
  const updateState = useCustomizerStore((s) => s.updateState);

  const side = state.primaryColorSide || "Both";
  const activeColor =
    side === "Back"
      ? state.primaryBack || state.primary
      : side === "Front"
        ? state.primaryFront || state.primary
        : state.primary;

  const handleColorChange = (c) => {
    if (side === "Both") {
      setState((s) => ({
        ...s,
        primary: c,
        primaryFront: c,
        primaryBack: c,
      }));
    } else if (side === "Front") {
      setState((s) => ({
        ...s,
        primaryFront: c,
        primary: c,
      }));
    } else {
      setState((s) => ({
        ...s,
        primaryBack: c,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-bold text-zinc-900 mb-3 block">
          Primary Color
        </label>

        {/* Side Selector */}
        <div className="flex gap-1.5 p-1 bg-zinc-100 rounded border mb-4">
          {[
            { id: "Both", label: "Both" },
            { id: "Front", label: "Front" },
            { id: "Back", label: "Back" },
          ].map((sOption) => (
            <button
              key={sOption.id}
              onClick={() =>
                updateState("primaryColorSide", sOption.id)
              }
              className={`flex-1 py-1.5 text-xs font-bold rounded cursor-pointer transition-all text-center ${
                side === sOption.id
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {sOption.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-3">
          {[
            "#E63946",
            "#2196F3",
            "#111111",
            "#FFFFFF",
            "#CCCCCC",
            "#457B9D",
            "#2A9D8F",
            "#F4A261",
            "#726DE8",
            "#FF6B6B",
            "#80C670",
            "#EFBD4E",
          ].map((c) => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className={`w-9 h-9 rounded border-2 transition-transform ${
                activeColor === c
                  ? "border-zinc-900 scale-110 ring-2 ring-offset-1 ring-zinc-400"
                  : "border-black/10 hover:scale-105"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <input
            type="color"
            value={activeColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-9 h-9 rounded cursor-pointer border border-zinc-200"
          />
          <span className="text-xs text-zinc-500 font-mono">
            {activeColor.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

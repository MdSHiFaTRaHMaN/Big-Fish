import React from "react";
import { useCustomizerStore } from "../useCustomizerStore";

export default function FabricTab() {
  const state = useCustomizerStore((s) => s.state);
  const updateState = useCustomizerStore((s) => s.updateState);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {[
          {
            name: "Mesh",
            desc: "Standard high-breathability sports mesh fabric",
            extra: "",
          },
          {
            name: "Flex",
            desc: "Premium stretch fabric with extra flexibility",
            extra: "",
          },
        ].map((f) => (
          <button
            key={f.name}
            onClick={() => updateState("fabric", f.name)}
            className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${
              state.fabric === f.name
                ? "border-[#00263C] bg-[#00263C]/10"
                : "border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <div>
              <div
                className={`font-bold text-sm ${
                  state.fabric === f.name
                    ? "text-[#00263C]"
                    : "text-zinc-800"
                }`}
              >
                {f.name}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {f.desc}
              </div>
            </div>
            {f.extra && (
              <span className="text-xs font-bold text-[#00263C] bg-[#00263C]/10 px-2 py-1 rounded-full">
                {f.extra}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Fabric Technology Visualizer Card */}
      <div className="mt-4 border-t pt-4">
        <div className="text-xs font-medium mb-4 text-zinc-500 uppercase tracking-wider">
          Fabric Technology Visualizer
        </div>
        <div className="overflow-hidden border border-zinc-200 shadow-sm bg-white">
          <img
            src="/assets/mesh_flex_showcase.png"
            alt="Mesh vs Flex Antigravity Showcases"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useCustomizerStore } from "../useCustomizerStore";

export default function StyleTab() {
  const state = useCustomizerStore((s) => s.state);
  const updateState = useCustomizerStore((s) => s.updateState);

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-bold text-zinc-900 mb-2 block">
          Collar Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["None", "V-Neck", "Round", "Polo", "Henley"].map((c) => (
            <button
              key={c}
              onClick={() => {
                updateState("collarType", c);
                updateState("collar", c !== "None");
              }}
              className={`p-3 rounded-full cursor-pointer border text-sm font-bold transition-all active:scale-90 duration-300 ${state.collarType === c ? "border-[#00263C] bg-[#00263C]/10 text-[#00263C]" : "border-[#002337] text-[#002337] hover:border-zinc-300"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {state.collar &&
        (state.collarType === "Polo" || state.collarType === "Henley") && (
          <div>
            <label className="text-sm font-bold text-zinc-900 mb-2 block">
              Closure Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateState("zipper", false)}
                className={`p-3 rounded-full cursor-pointer border text-sm font-bold transition-all active:scale-90 duration-300 ${
                  !state.zipper
                    ? "border-[#00263C] bg-[#00263C]/10 text-[#00263C] font-extrabold"
                    : "border-[#002337] text-[#002337] hover:border-zinc-300"
                }`}
              >
                Button Placket
              </button>
              <button
                onClick={() => updateState("zipper", true)}
                className={`p-3 rounded-full cursor-pointer border text-sm font-bold transition-all active:scale-90 duration-300 ${
                  state.zipper
                    ? "border-[#00263C] bg-[#00263C]/10 text-[#00263C] font-extrabold"
                    : "border-[#002337] text-[#002337] hover:border-zinc-300"
                }`}
              >
                Zipper (+$5)
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

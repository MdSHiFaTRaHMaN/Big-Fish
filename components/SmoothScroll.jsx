"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothScroll({ children }) {
  return (
    <ReactLenis 
      root 
      options={{ 
        duration: 1.4, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Clean exponential easing out curve
        smoothWheel: true,
        wheelMultiplier: 1.1,
      }}
    >
      {children}
    </ReactLenis>
  );
}

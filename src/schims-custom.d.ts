// src/shims-custom.d.ts
declare global {
  interface HTMLElementEventMap {
    "volume-change": CustomEvent<{ rms: number; lufs: number }>;
  }
}

export {}; 


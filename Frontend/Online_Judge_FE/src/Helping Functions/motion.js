// Shared spring presets (Motion's bounce/duration ≈ Apple's damping/response).
// Critically damped by default; bounce is reserved for momentum-driven gestures.

export const spring = { type: 'spring', bounce: 0, duration: 0.4 };
export const snappy = { type: 'spring', bounce: 0, duration: 0.3 };
export const flick = { type: 'spring', bounce: 0.2, duration: 0.4 };

// Page / section entrance
export const rise = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: spring,
};

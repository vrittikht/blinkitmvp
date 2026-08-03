/** Lightweight Web Audio beeps — no asset files required. */

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx) sharedCtx = new AC();
  return sharedCtx;
}

function tone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.04) {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();

    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.value = Math.max(gain, 0.001);
    osc.connect(amp);
    amp.connect(ctx.destination);
    const now = ctx.currentTime;
    amp.gain.setValueAtTime(Math.max(gain, 0.001), now);
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  } catch {
    /* audio optional */
  }
}

export function playSpinTick() {
  tone(520, 0.05, "triangle", 0.03);
}

export function playSpinWhoosh() {
  tone(180, 0.35, "sawtooth", 0.025);
  window.setTimeout(() => tone(140, 0.4, "sawtooth", 0.02), 80);
}

export function playWinChime() {
  tone(523.25, 0.12, "sine", 0.05);
  window.setTimeout(() => tone(659.25, 0.12, "sine", 0.05), 100);
  window.setTimeout(() => tone(783.99, 0.22, "sine", 0.055), 200);
}

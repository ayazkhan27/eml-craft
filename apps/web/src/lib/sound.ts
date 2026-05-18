type SoundName = "craft" | "known" | "reset" | "buzz";

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextCtor = window.AudioContext;
  if (!AudioContextCtor) return null;
  audioContext ??= new AudioContextCtor();
  return audioContext;
}

function tone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  gain = 0.045,
  type: OscillatorType = "sine",
) {
  const oscillator = ctx.createOscillator();
  const volume = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  volume.gain.setValueAtTime(0.0001, start);
  volume.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  volume.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(volume);
  volume.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playSound(name: SoundName) {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  const now = ctx.currentTime;
  if (name === "craft") {
    tone(ctx, 392, now, 0.11);
    tone(ctx, 523.25, now + 0.06, 0.12);
    return;
  }
  if (name === "known") {
    tone(ctx, 523.25, now, 0.10);
    tone(ctx, 659.25, now + 0.055, 0.12);
    tone(ctx, 783.99, now + 0.11, 0.14);
    return;
  }
  if (name === "buzz") {
    tone(ctx, 92.5, now, 0.08, 0.032, "square");
    tone(ctx, 87.3, now + 0.045, 0.08, 0.030, "sawtooth");
    return;
  }
  tone(ctx, 246.94, now, 0.08, 0.035);
  tone(ctx, 196, now + 0.055, 0.10, 0.035);
}

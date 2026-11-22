import { useCallback } from 'react';
import { useApp } from '../context/AppContext';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

function playWarmSine(
  ctx: AudioContext,
  options: {
    startFreq: number;
    endFreq?: number;
    startTime: number;
    duration: number;
    peakGain: number;
    attack?: number;
  }
) {
  const { startFreq, endFreq, startTime, duration, peakGain, attack = 0.016 } = options;

  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  // Pure sine wave in warm low-mid range (220Hz - 520Hz)
  osc.type = 'sine';
  osc.frequency.setValueAtTime(startFreq, startTime);
  if (endFreq && endFreq !== startFreq) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
  }

  // Low-pass filter at 800Hz to round the timbre and remove harshness
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, startTime);
  filter.Q.setValueAtTime(0.7, startTime);

  // Soft ~15ms attack + smooth exponential decay
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.025);
}

export function useSoundEffects() {
  const { soundEnabled } = useApp();

  /**
   * Sucesso / Carteira: acorde suave e encorpado de 2 notas subindo (293Hz -> 440Hz)
   */
  const playSuccess = useCallback(
    (force = false) => {
      if (!soundEnabled && !force) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Nota 1: D4 (293.66 Hz)
      playWarmSine(ctx, {
        startFreq: 293.66,
        startTime: now,
        duration: 0.19,
        peakGain: 0.09,
      });
      // Nota 2: A4 (440.00 Hz)
      playWarmSine(ctx, {
        startFreq: 440.0,
        startTime: now + 0.095,
        duration: 0.28,
        peakGain: 0.105,
      });
    },
    [soundEnabled]
  );

  /**
   * Análise Pronta: toque médio-grave arredondado e suave (493.88Hz + base 246.94Hz)
   */
  const playInsight = useCallback(
    (force = false) => {
      if (!soundEnabled && !force) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Nota principal: B4 (493.88 Hz)
      playWarmSine(ctx, {
        startFreq: 493.88,
        startTime: now,
        duration: 0.28,
        peakGain: 0.095,
      });
      // Corpo grave suave: B3 (246.94 Hz)
      playWarmSine(ctx, {
        startFreq: 246.94,
        startTime: now,
        duration: 0.24,
        peakGain: 0.045,
      });
    },
    [soundEnabled]
  );

  /**
   * Remoção: som discreto e macio descendo de tom (329.63Hz -> 220Hz)
   */
  const playRemove = useCallback(
    (force = false) => {
      if (!soundEnabled && !force) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      playWarmSine(ctx, {
        startFreq: 329.63,
        endFreq: 220.0,
        startTime: now,
        duration: 0.16,
        peakGain: 0.085,
      });
    },
    [soundEnabled]
  );

  return { playSuccess, playInsight, playRemove, soundEnabled };
}

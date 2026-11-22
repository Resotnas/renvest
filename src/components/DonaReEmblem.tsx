import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FourPointSparkle: React.FC<{ className?: string }> = ({ className = 'w-3 h-3' }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M8 0.5C8.6 4.6 11.4 7.4 15.5 8C11.4 8.6 8.6 11.4 8 15.5C7.4 11.4 4.6 8.6 0.5 8C4.6 7.4 7.4 4.6 8 0.5Z" />
  </svg>
);

export const DonaReEmblem: React.FC = () => {
  const [pulseKey, setPulseKey] = useState(0);

  return (
    <div className="relative flex items-center justify-center w-36 h-32 mb-3 select-none">
      {/* 1. Breathing ambient emerald-cyan glow */}
      <motion.div
        animate={{
          scale: [0.9, 1.16, 0.9],
          opacity: [0.35, 0.72, 0.35],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500/45 via-teal-400/35 to-cyan-400/45 blur-2xl"
      />

      {/* Interactive glow pulse burst on hover/tap */}
      {pulseKey > 0 && (
        <motion.div
          key={pulseKey}
          initial={{ scale: 0.85, opacity: 0.7 }}
          animate={{ scale: 1.55, opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="pointer-events-none absolute w-20 h-20 rounded-full border border-cyan-400/60 bg-emerald-400/20 blur-sm"
        />
      )}

      {/* 3. Slowly orbiting luminous micro-dots */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute w-[112px] h-[112px]"
      >
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
        <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 19, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute w-[126px] h-[126px]"
      >
        <span className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-1 rounded-full bg-teal-300 shadow-[0_0_6px_#5eead4]" />
      </motion.div>

      {/* 3. Asynchronous twinkling 4-point sparkles */}
      <motion.span
        animate={{ scale: [0.55, 1.15, 0.55], opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        className="pointer-events-none absolute top-2 right-5 text-cyan-400 dark:text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.85)]"
      >
        <FourPointSparkle className="w-3.5 h-3.5" />
      </motion.span>

      <motion.span
        animate={{ scale: [0.5, 1.1, 0.5], opacity: [0.2, 0.95, 0.2], y: [0, 2.5, 0] }}
        transition={{ duration: 3.3, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
        className="pointer-events-none absolute bottom-3 left-5 text-emerald-500 dark:text-emerald-300 drop-shadow-[0_0_6px_rgba(16,185,129,0.85)]"
      >
        <FourPointSparkle className="w-3 h-3" />
      </motion.span>

      <motion.span
        animate={{ scale: [0.45, 1, 0.45], opacity: [0.2, 0.9, 0.2] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.9 }}
        className="pointer-events-none absolute top-6 left-4 text-slate-700 dark:text-white/90"
      >
        <FourPointSparkle className="w-2.5 h-2.5" />
      </motion.span>

      {/* 1 & 4. Floating Rounded-Square Card + Hover/Tap Elastic Response */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ perspective: 700 }}
        className="relative"
      >
        <motion.button
          type="button"
          onClick={() => setPulseKey((k) => k + 1)}
          onHoverStart={() => setPulseKey((k) => k + 1)}
          whileHover={{ scale: 1.06, rotate: 4 }}
          whileTap={{ scale: 0.95, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 420, damping: 20 }}
          aria-label="Dona Rê — Assistente de IA"
          className="relative w-[74px] h-[74px] rounded-[24px] p-[2px] overflow-hidden shadow-[0_14px_34px_-10px_rgba(16,185,129,0.55)] cursor-pointer focus:outline-none"
        >
          {/* 2. Orbital Glow Conic-Gradient Beam rotating continuously (~6s) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute -inset-[40%]"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.95) 65deg, rgba(6,182,212,1) 125deg, rgba(255,255,255,0.85) 155deg, transparent 210deg, transparent 360deg)',
            }}
          />

          {/* Subtle frosted static base border so all sides stay defined */}
          <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-emerald-500/25 dark:border-white/15" />

          {/* Inner Liquid Glass Core */}
          <div className="relative w-full h-full rounded-[22px] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-cyan-400/20" />

            {/* 1. Periodic elegant 3D coin spin on the "R" every 6 seconds */}
            <motion.span
              animate={{ rotateY: [0, 360] }}
              transition={{
                duration: 1.2,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 6,
                delay: 1.5,
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative font-display font-extrabold text-[34px] leading-none bg-gradient-to-br from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(16,185,129,0.4)]"
            >
              R
            </motion.span>
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};

import React, { useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface RenVestLoaderProps {
  /** 'overlay' para tela cheia com backdrop-blur; 'inline' para versão compacta dentro de cards/chat */
  variant?: 'overlay' | 'inline';
  /** Controla a visibilidade com fade suave via AnimatePresence */
  visible?: boolean;
  /** Texto discreto exibido ao lado/abaixo do ícone */
  message?: string;
  /** Tamanho na versão inline */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoaderEmblem: React.FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const gradId = useId();

  const dimensions = {
    sm: { box: 'w-9 h-9', svg: 36, r: 15, stroke: 2.6, text: 'text-sm', inner: 'w-7 h-7' },
    md: { box: 'w-14 h-14', svg: 56, r: 23, stroke: 3.0, text: 'text-xl', inner: 'w-11 h-11' },
    lg: { box: 'w-24 h-24', svg: 96, r: 41, stroke: 3.5, text: 'text-4xl', inner: 'w-[74px] h-[74px]' },
  }[size];

  const half = dimensions.svg / 2;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${dimensions.box}`}>
      {/* Soft ambient aura behind the ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/25 via-teal-500/20 to-cyan-500/25 blur-xl pointer-events-none" />

      {/* Rotating SVG luminous ring with continuous stroke-dasharray completion */}
      <svg
        width={dimensions.svg}
        height={dimensions.svg}
        viewBox={`0 0 ${dimensions.svg} ${dimensions.svg}`}
        className="absolute inset-0 renvest-ring-spin"
        fill="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-primary)" />
            <stop offset="55%" stopColor="var(--accent-secondary)" />
            <stop offset="100%" stopColor="var(--accent-cyan)" />
          </linearGradient>
        </defs>

        {/* Subtle frosted track */}
        <circle
          cx={half}
          cy={half}
          r={dimensions.r}
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth={dimensions.stroke}
        />

        {/* Luminous animated arc */}
        <circle
          cx={half}
          cy={half}
          r={dimensions.r}
          stroke={`url(#${gradId})`}
          strokeWidth={dimensions.stroke}
          strokeLinecap="round"
          className="renvest-ring-dash"
        />
      </svg>

      {/* Center frosted glass medallion with breathing "R" */}
      <div
        className={`relative ${dimensions.inner} rounded-full glass-card-elevated flex items-center justify-center shadow-inner`}
      >
        <motion.span
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.82, 1, 0.82] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
          className={`font-display font-extrabold leading-none select-none bg-gradient-to-br from-teal-700 via-emerald-600 to-sky-600 dark:from-emerald-300 dark:via-teal-200 dark:to-cyan-300 bg-clip-text text-transparent ${dimensions.text}`}
        >
          R
        </motion.span>
      </div>
    </div>
  );
};

export const RenVestLoader: React.FC<RenVestLoaderProps> = ({
  variant = 'inline',
  visible = true,
  message,
  size,
  className = '',
}) => {
  if (variant === 'overlay') {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            key="renvest-loader-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="status"
            aria-live="polite"
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-slate-200/55 dark:bg-slate-950/65 backdrop-blur-md ${className}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="glass-card-elevated rounded-[32px] px-8 py-7 flex flex-col items-center gap-4 text-center max-w-[290px]"
            >
              <LoaderEmblem size={size || 'lg'} />
              {message && (
                <p className="text-xs font-semibold text-secondary tracking-wide leading-relaxed">
                  {message}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="renvest-loader-inline"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-2.5 ${className}`}
        >
          <LoaderEmblem size={size || 'sm'} />
          {message && (
            <span className="text-xs font-medium text-secondary">{message}</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

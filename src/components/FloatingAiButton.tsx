import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ORGANIC_EASE } from './MotionPrimitives';

export const FloatingAiButton: React.FC = () => {
  const { activeTab, setActiveTab, navLayout } = useApp();
  const hasBottomNav = navLayout === 'bottom' || navLayout === 'both';

  return (
    <AnimatePresence>
      {activeTab !== 'chat' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.75, y: 12 }}
          transition={{ duration: 0.24, ease: ORGANIC_EASE }}
          className={`fixed left-1/2 -translate-x-1/2 z-40 w-full max-w-[430px] pointer-events-none px-4 ${
            hasBottomNav ? 'bottom-[86px]' : 'bottom-5'
          }`}
        >
          <div className="flex justify-end pr-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab('chat')}
              aria-label="Abrir Assistente de IA Dona Rê"
              title="Dona Rê • Assistente de IA"
              className="pointer-events-auto group relative flex items-center justify-center w-[54px] h-[54px] rounded-[20px] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-[1.5px] shadow-[0_12px_28px_-6px_rgba(16,185,129,0.65)] hover:shadow-[0_14px_32px_-4px_rgba(6,182,212,0.75)] cursor-pointer"
            >
              {/* Subtle outer pulse aura */}
              <span className="absolute -inset-1 rounded-[24px] bg-gradient-to-br from-emerald-500/35 to-cyan-500/35 blur-md opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Inner glossy glass badge with stylized R */}
              <span className="relative w-full h-full rounded-[18.5px] bg-slate-950/90 flex items-center justify-center overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-br from-emerald-400/25 via-transparent to-cyan-400/20" />
                <span className="relative font-display font-extrabold text-[22px] leading-none bg-gradient-to-br from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent tracking-tight">
                  R
                </span>
              </span>

              {/* Live online dot */}
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-950 shadow-sm transition-colors duration-300" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

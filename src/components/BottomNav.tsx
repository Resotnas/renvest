import React from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { Home, Wallet, Sparkles, Compass, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MainTab } from '../types';
import { SPRING_PILL } from './MotionPrimitives';

export const NAV_ITEMS: {
  id: MainTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'home', label: 'Visão Geral', shortLabel: 'Home', icon: Home },
  { id: 'portfolio', label: 'Minha Carteira', shortLabel: 'Carteira', icon: Wallet },
  { id: 'ai', label: 'Aportar IA', shortLabel: 'Aportar', icon: Sparkles },
  { id: 'explore', label: 'Explorar B3', shortLabel: 'Explorar', icon: Compass },
  { id: 'profile', label: 'Perfil & Ajustes', shortLabel: 'Perfil', icon: User },
];

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-[406px]"
    >
      <LayoutGroup id="bottom-nav">
        <div className="glass-nav rounded-[28px] px-1.5 py-1.5 flex items-center justify-between gap-0.5 transition-colors duration-300">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-[22px] cursor-pointer transition-colors duration-200 ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-active-pill"
                    transition={SPRING_PILL}
                    className="absolute inset-0 rounded-[22px] bg-emerald-500/18 dark:bg-emerald-400/18 border border-emerald-600/25 dark:border-emerald-400/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
                  />
                )}
                <motion.span
                  animate={{
                    scale: isActive ? 1.12 : 1,
                    y: isActive ? -1.5 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 460, damping: 28 }}
                  className="relative z-10 flex items-center justify-center"
                >
                  <Icon className="w-[19px] h-[19px]" />
                </motion.span>
                <span
                  className={`text-[10px] font-bold relative z-10 transition-opacity duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-80'
                  }`}
                >
                  {item.shortLabel}
                </span>
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>
    </nav>
  );
};

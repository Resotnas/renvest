import React from 'react';
import { Home, Wallet, Sparkles, Compass, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MainTab } from '../types';

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
      <div className="glass-nav rounded-[28px] px-1.5 py-1.5 flex items-center justify-between gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`tap-press relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-[22px] cursor-pointer ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-[22px] bg-emerald-500/15 dark:bg-emerald-400/15 border border-emerald-600/25 dark:border-emerald-400/25 transition-all duration-150" />
              )}
              <Icon
                className={`w-[19px] h-[19px] relative z-10 transition-transform duration-150 ${
                  isActive ? 'scale-110 -translate-y-0.5' : ''
                }`}
              />
              <span
                className={`text-[10px] font-bold relative z-10 transition-opacity duration-150 ${
                  isActive ? 'opacity-100' : 'opacity-80'
                }`}
              >
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

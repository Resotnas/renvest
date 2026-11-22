import React from 'react';
import { X, Sun, Moon, LogIn, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { NAV_ITEMS } from './BottomNav';

export const SideMenu: React.FC = () => {
  const {
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
    user,
    theme,
    toggleTheme,
    setScreen,
  } = useApp();

  if (!sidebarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 w-[285px] max-w-[82vw] h-full glass-card-elevated rounded-r-[32px] p-5 flex flex-col justify-between animate-drawer-left">
        <div className="space-y-6">
          {/* Top Brand + Close */}
          <div className="flex items-center justify-between">
            <BrandLogo size="sm" />
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu lateral"
              className="tap-press w-9 h-9 rounded-full glass-pill flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Badge */}
          <div className="glass-accent-card rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-display font-extrabold text-sm shrink-0 shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-display font-bold text-primary truncate">{user.name}</p>
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Perfil {user.investorProfile}
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5" aria-label="Menu lateral">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`tap-press w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/16 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Dona Rê AI Assistant shortcut */}
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`tap-press w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-emerald-500/16 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-500 to-cyan-500 text-white font-display font-extrabold text-[11px] flex items-center justify-center">
                R
              </span>
              <span>Dona Rê • Assistente IA</span>
            </button>
          </nav>
        </div>

        {/* Footer Quick Actions */}
        <div className="space-y-2 pt-4 border-t glass-divider">
          <button
            type="button"
            onClick={toggleTheme}
            className="tap-press w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl glass-pill text-xs font-semibold text-primary cursor-pointer"
          >
            <span className="inline-flex items-center gap-2">
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
              {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              Trocar
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false);
                setScreen('onboarding');
              }}
              className="tap-press py-2.5 px-2 rounded-2xl glass-pill text-[11px] font-semibold text-secondary hover:text-primary inline-flex items-center justify-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Questionário
            </button>
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false);
                setScreen('login');
              }}
              className="tap-press py-2.5 px-2 rounded-2xl glass-pill text-[11px] font-semibold text-secondary hover:text-primary inline-flex items-center justify-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Tela Login
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

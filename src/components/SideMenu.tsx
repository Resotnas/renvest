import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Sun, Moon, LogIn, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { NAV_ITEMS } from './BottomNav';
import { ORGANIC_EASE } from './MotionPrimitives';

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

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '-100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.6 }}
            transition={{ duration: 0.28, ease: ORGANIC_EASE }}
            className="relative z-10 w-[285px] max-w-[82vw] h-full glass-card-elevated rounded-r-[32px] p-5 flex flex-col justify-between transition-colors duration-300"
          >
            <div className="space-y-6">
              {/* Top Brand + Close */}
              <div className="flex items-center justify-between">
                <BrandLogo size="sm" />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Fechar menu lateral"
                  className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </motion.button>
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
                    <motion.button
                      key={item.id}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-colors duration-200 ${
                        isActive
                          ? 'bg-emerald-500/16 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}

                {/* Dona Rê AI Assistant shortcut */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab('chat')}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-colors duration-200 ${
                    activeTab === 'chat'
                      ? 'bg-emerald-500/16 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-500 to-cyan-500 text-white font-display font-extrabold text-[11px] flex items-center justify-center">
                    R
                  </span>
                  <span>Dona Rê • Assistente IA</span>
                </motion.button>
              </nav>
            </div>

            {/* Footer Quick Actions */}
            <div className="space-y-2 pt-4 border-t glass-divider">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl glass-pill text-xs font-semibold text-primary cursor-pointer"
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
              </motion.button>

              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSidebarOpen(false);
                    setScreen('onboarding');
                  }}
                  className="py-2.5 px-2 rounded-2xl glass-pill text-[11px] font-semibold text-secondary hover:text-primary inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Questionário
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSidebarOpen(false);
                    setScreen('login');
                  }}
                  className="py-2.5 px-2 rounded-2xl glass-pill text-[11px] font-semibold text-secondary hover:text-primary inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  Tela Login
                </motion.button>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

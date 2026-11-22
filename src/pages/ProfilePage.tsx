import React, { useState } from 'react';
import {
  Trash2,
  Sun,
  Moon,
  LogOut,
  RefreshCw,
  Sparkles,
  History,
  ChevronDown,
  ChevronUp,
  LogIn,
  Shield,
  Scale,
  Flame,
  Eye,
  EyeOff,
  PanelLeft,
  Menu,
  Volume2,
  VolumeX,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { isSupabaseConfigured } from '../lib/supabase';
import { isGeminiClientConfigured } from '../services/geminiApi';
import { GlassCard } from '../components/GlassCard';
import { NavLayout } from '../types';

export const ProfilePage: React.FC = () => {
  const {
    theme,
    toggleTheme,
    navLayout,
    setNavLayout,
    setSidebarOpen,
    hideBalances,
    toggleHideBalances,
    soundEnabled,
    toggleSoundEnabled,
    user,
    isCloudConnected,
    signOut,
    isMacroLive,
    isMarketLive,
    marketSourceLabel,
    setScreen,
    aiHistory,
    deleteAiAnalysis,
  } = useApp();
  const { playInsight } = useSoundEffects();

  const [expandedAiId, setExpandedAiId] = useState<string | null>(null);

  const ProfileIcon =
    user.investorProfile === 'Conservador'
      ? Shield
      : user.investorProfile === 'Arrojado'
        ? Flame
        : Scale;

  const navOptions: { id: NavLayout; label: string; desc: string }[] = [
    { id: 'both', label: 'Inferior + Lateral', desc: 'Barra fixa + botão lateral' },
    { id: 'bottom', label: 'Só Inferior', desc: 'Apenas barra fixa embaixo' },
    { id: 'sidebar', label: 'Só Lateral', desc: 'Menu lateral deslizante' },
  ];

  return (
    <div className="space-y-5 pb-28">
      {/* Header */}
      <header className="pt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {navLayout !== 'bottom' && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu lateral"
              className="tap-press w-10 h-10 rounded-2xl glass-pill flex items-center justify-center text-primary cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-display font-extrabold text-primary leading-tight">
              Perfil & Ajustes
            </h1>
            <p className="text-xs text-secondary">{user.email}</p>
          </div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-display font-extrabold text-base shadow-lg shadow-emerald-500/25">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* Investor Profile Card */}
      <GlassCard variant="accent" padding="lg" className="space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ProfileIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-secondary">Perfil de Investidor</p>
              <p className="text-lg font-display font-extrabold text-primary">
                {user.investorProfile}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setScreen('onboarding')}
            className="tap-press px-3.5 py-2.5 rounded-2xl liquid-btn text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refazer
          </button>
        </div>
        <p className="text-xs text-secondary leading-relaxed">
          Seu perfil calibra automaticamente o equilíbrio entre Renda Fixa, FIIs e Ações nas recomendações da IA RenVest.
        </p>
      </GlassCard>

      {/* App Default Settings */}
      <section className="space-y-2.5">
        <h2 className="text-base font-display font-bold text-primary">Configurações do Aplicativo</h2>
        <GlassCard padding="md" className="rounded-3xl space-y-4">
          {/* Theme */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center">
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">
                  Tema {theme === 'dark' ? 'Escuro (Dark)' : 'Claro (Light)'}
                </p>
                <p className="text-[11px] text-secondary">Aparência Liquid Glass</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="tap-press px-3.5 py-1.5 rounded-full text-xs font-bold glass-pill text-emerald-700 dark:text-emerald-400 cursor-pointer"
            >
              Alternar
            </button>
          </div>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t glass-divider">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Efeitos sonoros</p>
                <p className="text-[11px] text-secondary">
                  Feedback sutil na carteira e análises IA
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              aria-label="Alternar efeitos sonoros"
              onClick={() => {
                const next = !soundEnabled;
                toggleSoundEnabled();
                if (next) playInsight(true);
              }}
              className={`relative w-12 h-7 rounded-full p-1 transition-colors duration-300 cursor-pointer border ${
                soundEnabled
                  ? 'bg-emerald-500/85 border-emerald-400/60'
                  : 'bg-slate-300/70 dark:bg-slate-700/70 border-transparent'
              }`}
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                className={`block w-5 h-5 rounded-full bg-white shadow-sm ${
                  soundEnabled ? 'ml-auto' : 'mr-auto'
                }`}
              />
            </button>
          </div>

          {/* Privacy Balances */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t glass-divider">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center">
                {hideBalances ? (
                  <EyeOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Ocultar Saldos</p>
                <p className="text-[11px] text-secondary">Esconde valores na Home e Carteira</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleHideBalances}
              className={`tap-press px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer border ${
                hideBalances
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                  : 'glass-pill text-secondary'
              }`}
            >
              {hideBalances ? 'Ativo' : 'Desativado'}
            </button>
          </div>

          {/* Navigation Style: Bottom / Sidebar / Both */}
          <div className="pt-3 border-t glass-divider space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl glass-pill flex items-center justify-center">
                <PanelLeft className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Estilo de Navegação</p>
                <p className="text-[11px] text-secondary">Escolha menu inferior fixo, lateral ou ambos</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {navOptions.map((opt) => {
                const active = navLayout === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setNavLayout(opt.id)}
                    className={`tap-press p-2.5 rounded-2xl text-left border cursor-pointer ${
                      active
                        ? 'bg-emerald-500/18 border-emerald-600/40 text-emerald-800 dark:text-emerald-300'
                        : 'glass-pill text-secondary hover:text-primary'
                    }`}
                  >
                    <p className="text-[11px] font-bold leading-tight">{opt.label}</p>
                    <p className="text-[10px] opacity-80 mt-0.5 leading-tight">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login preview & Sign out */}
          <div className="pt-3 border-t glass-divider grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setScreen('login')}
              className="tap-press py-2.5 px-3 rounded-2xl glass-pill text-xs font-semibold text-primary inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Tela de Login
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="tap-press py-2.5 px-3 rounded-2xl glass-pill text-xs font-semibold text-rose-600 dark:text-rose-400 inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair da conta
            </button>
          </div>
        </GlassCard>
      </section>

      {/* Integrations Status Card (Fase 2) */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-base font-display font-bold text-primary">Conexões em Tempo Real</h2>
        </div>
        <GlassCard padding="md" className="rounded-3xl space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-secondary">BCB + AwesomeAPI (Selic, CDI, Dólar)</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isMacroLive ? 'Conectado' : 'Cache'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t glass-divider">
            <span className="text-secondary">Brapi B3 (Ações e FIIs)</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isMarketLive ? marketSourceLabel : 'Referência'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t glass-divider">
            <span className="text-secondary">Google Gemini IA (Aporte & Dona Rê)</span>
            <span className="font-bold text-primary">
              {isGeminiClientConfigured ? 'Gemini 2.5 Flash' : 'Aguardando chave .env'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t glass-divider">
            <span className="text-secondary">Supabase (Login & Banco)</span>
            <span className="font-bold text-primary">
              {isCloudConnected
                ? 'Sincronizado na nuvem'
                : isSupabaseConfigured
                  ? 'Pronto (faça login)'
                  : 'Modo Local (.env.local)'}
            </span>
          </div>
        </GlassCard>
      </section>

      {/* AI Analysis History */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-display font-bold text-primary">
            Histórico de Análises IA
          </h2>
          <span className="text-xs text-muted tabular-nums">({aiHistory.length})</span>
        </div>

        {aiHistory.length === 0 ? (
          <GlassCard padding="md" className="text-center space-y-1.5">
            <Sparkles className="w-5 h-5 text-emerald-500 mx-auto opacity-80" />
            <p className="text-xs font-semibold text-primary">Nenhuma análise salva ainda</p>
            <p className="text-[11px] text-secondary">
              Gere uma recomendação na aba Aportar e clique em "Salvar" para consultar aqui.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-2.5">
            {aiHistory.map((item) => {
              const isOpen = expandedAiId === item.id;
              return (
                <GlassCard key={item.id} padding="sm" className="rounded-2xl space-y-2">
                  <div
                    onClick={() => setExpandedAiId(isOpen ? null : item.id)}
                    className="flex items-start justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        {item.createdAt} • Aporte R$ {item.amount.toLocaleString('pt-BR')}
                      </p>
                      <p className="font-display font-bold text-sm text-primary">{item.title}</p>
                    </div>
                    <button
                      type="button"
                      className="text-secondary p-1 cursor-pointer"
                      aria-label="Expandir análise"
                    >
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="pt-2 border-t glass-divider space-y-2 animate-enter">
                      <p className="text-xs text-secondary leading-relaxed">{item.summary}</p>
                      {item.allocations && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.allocations.map((s) => (
                            <span
                              key={s.category}
                              className="text-[10px] font-semibold px-2 py-1 rounded-full glass-pill text-primary tabular-nums"
                            >
                              {s.category}: {s.percent}% (R$ {s.amount.toLocaleString('pt-BR')})
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => deleteAiAnalysis(item.id)}
                          className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remover do histórico
                        </button>
                      </div>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

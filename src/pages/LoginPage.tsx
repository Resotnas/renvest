import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Sun, Moon, Sparkles, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { GlassCard } from '../components/GlassCard';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const { theme, toggleTheme, setScreen, updateUserProfile } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('renato@renvest.app');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register') {
      updateUserProfile({
        name: name.trim() || 'Novo Investidor',
        email: email.trim() || 'investidor@renvest.app',
        onboardingCompleted: false,
      });
      setScreen('onboarding');
    } else {
      setScreen('app');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-5 py-7 animate-enter">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full glass-pill text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Protótipo Visual • Fase 1
        </span>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-primary cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Main Auth Content */}
      <div className="my-auto py-8 space-y-6">
        <div className="flex flex-col items-center text-center">
          <BrandLogo size="lg" showTagline />
          <p className="text-sm text-secondary mt-4 max-w-[300px] leading-relaxed">
            Análise de investimentos em tempo real com recomendações de aporte guiadas por Inteligência Artificial.
          </p>
        </div>

        <GlassCard variant="elevated" padding="lg" className="space-y-5">
          {/* Segmented Toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl glass-card-subtle">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">
                  Seu nome
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como prefere ser chamado?"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glass-pill text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl glass-pill text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl glass-pill text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl liquid-btn font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {mode === 'login' ? 'Acessar minha conta' : 'Criar conta e definir perfil'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setScreen('app')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Entrar direto na conta Demo →
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Footer Note */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-muted">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Dados isolados por usuário • Pronto para Supabase Auth</span>
      </div>
    </div>
  );
};

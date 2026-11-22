import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Shield, Scale, Flame, Sparkles, ArrowRight } from 'lucide-react';
import { ONBOARDING_QUESTIONS, calculateInvestorProfile } from '../data/onboardingQuestions';
import { GlassCard } from '../components/GlassCard';
import { BrandLogo } from '../components/BrandLogo';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { InvestorProfile } from '../types';

const PROFILE_META: Record<
  InvestorProfile,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    description: string;
    split: string;
  }
> = {
  Conservador: {
    icon: Shield,
    color: 'text-sky-500',
    bg: 'bg-sky-500/15 border-sky-500/30',
    description:
      'Seu foco é preservação de patrimônio e previsibilidade. A IA vai priorizar Tesouro Direto e CDBs de alta liquidez, com pequena dose de renda passiva.',
    split: '80% Renda Fixa • 15% FIIs • 5% Ações',
  },
  Moderado: {
    icon: Scale,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/15 border-emerald-500/30',
    description:
      'Você busca o ponto ideal entre segurança e crescimento. A IA combina Renda Fixa sólida com FIIs pagadores de dividendos e Ações de empresas líderes.',
    split: '50% Renda Fixa • 25% FIIs • 25% Ações',
  },
  Arrojado: {
    icon: Flame,
    color: 'text-amber-500',
    bg: 'bg-amber-500/15 border-amber-500/30',
    description:
      'Você tem horizonte de longo prazo e tolera volatilidade em busca de maior multiplicação patrimonial, mantendo reserva estratégica em Renda Fixa.',
    split: '25% Renda Fixa • 30% FIIs • 45% Ações',
  },
};

export const OnboardingPage: React.FC = () => {
  const { setInvestorProfile, setScreen } = useApp();
  const { playSuccess } = useSoundEffects();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [resultProfile, setResultProfile] = useState<InvestorProfile | null>(null);

  const currentQuestion = ONBOARDING_QUESTIONS[step];
  const progress = ((step + 1) / ONBOARDING_QUESTIONS.length) * 100;

  const handleSelect = (score: number) => {
    const nextAnswers = [...answers];
    nextAnswers[step] = score;
    setAnswers(nextAnswers);

    if (step < ONBOARDING_QUESTIONS.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 160);
    } else {
      const profile = calculateInvestorProfile(nextAnswers);
      setInvestorProfile(profile);
      setResultProfile(profile);
      playSuccess();
    }
  };

  if (resultProfile) {
    const meta = PROFILE_META[resultProfile];
    const Icon = meta.icon;

    return (
      <div className="min-h-screen flex flex-col justify-between px-5 py-8 animate-enter">
        <div className="flex justify-center">
          <BrandLogo size="sm" />
        </div>

        <GlassCard variant="elevated" padding="lg" className="text-center space-y-5 my-auto">
          <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border ${meta.bg}`}>
            <Icon className={`w-8 h-8 ${meta.color}`} />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Perfil Definido pela IA
            </span>
            <h2 className="text-2xl font-display font-extrabold text-primary">
              Investidor {resultProfile}
            </h2>
          </div>

          <p className="text-sm text-secondary leading-relaxed">{meta.description}</p>

          <div className="glass-card-subtle rounded-2xl p-3.5">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">
              Alocação Base Sugerida
            </p>
            <p className="text-xs font-bold text-primary">{meta.split}</p>
          </div>

          <button
            type="button"
            onClick={() => setScreen('app')}
            className="w-full py-3.5 rounded-2xl liquid-btn font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            Liberar meu RenVest
            <ArrowRight className="w-4 h-4" />
          </button>
        </GlassCard>

        <p className="text-center text-[11px] text-muted">
          Você pode refazer este questionário a qualquer momento na aba Perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-5 py-7 animate-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => (step > 0 ? setStep((s) => s - 1) : setScreen('app'))}
          className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-primary cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-secondary tabular-nums">
          Pergunta {step + 1} de {ONBOARDING_QUESTIONS.length}
        </span>
        <button
          type="button"
          onClick={() => setScreen('app')}
          className="text-xs font-semibold text-muted hover:text-primary cursor-pointer"
        >
          Pular
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full glass-card-subtle overflow-hidden mb-8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div key={currentQuestion.id} className="space-y-6 flex-1 animate-enter">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Perfil de Investidor
          </span>
          <h1 className="text-2xl font-display font-bold text-primary leading-snug">
            {currentQuestion.title}
          </h1>
          <p className="text-sm text-secondary mt-2">{currentQuestion.subtitle}</p>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = answers[step] === opt.score;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => handleSelect(opt.score)}
                className={`w-full text-left p-4 rounded-3xl transition-all duration-200 cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'glass-accent-card ring-2 ring-emerald-500/60'
                    : 'glass-card hover:border-emerald-500/35'
                }`}
              >
                <div>
                  <p className="font-display font-bold text-sm text-primary">{opt.label}</p>
                  <p className="text-xs text-secondary mt-1 leading-relaxed">{opt.description}</p>
                </div>
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 mt-0.5 transition-colors ${
                    isSelected ? 'text-emerald-500' : 'text-muted/40'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

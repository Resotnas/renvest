import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Search,
  ChevronRight,
  SlidersHorizontal,
  Wand2,
  Target,
  Loader2,
  Menu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { DeepDiveSheet } from '../components/DeepDiveSheet';
import { AiAnalysisResult, AiMode } from '../types';
import {
  generateAutoAllocation,
  generateFilteredAllocation,
  generateSpecificAssetAnalysis,
} from '../services/mockAiEngine';
import { MARKET_ASSETS } from '../data/mockMarket';

const QUICK_AMOUNTS = [500, 1000, 2500, 5000];
const FILTER_OPTIONS: ('Ações' | 'FIIs' | 'Tesouro Direto' | 'CDBs' | 'LCI/LCA')[] = [
  'Ações',
  'FIIs',
  'Tesouro Direto',
  'CDBs',
  'LCI/LCA',
];

export const AiInvestPage: React.FC = () => {
  const { user, portfolio, saveAiAnalysis, aiPreset, clearAiPreset, navLayout, setSidebarOpen } = useApp();

  const [mode, setMode] = useState<AiMode>('auto');
  const [amountInput, setAmountInput] = useState<string>('1000');
  const [selectedFilters, setSelectedFilters] = useState<
    ('Ações' | 'FIIs' | 'Tesouro Direto' | 'CDBs' | 'LCI/LCA')[]
  >(['FIIs', 'CDBs']);
  const [tickerInput, setTickerInput] = useState<string>('PETR4');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AiAnalysisResult | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [deepDiveCategory, setDeepDiveCategory] = useState<string | null>(null);

  // Handle cross-screen shortcut from Explore ("Analisar com IA")
  useEffect(() => {
    if (aiPreset) {
      setMode(aiPreset.mode);
      if (aiPreset.ticker) {
        setTickerInput(aiPreset.ticker);
        runAnalysis('specific', Number(amountInput) || 1000, selectedFilters, aiPreset.ticker);
      }
      clearAiPreset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiPreset]);

  const toggleFilter = (cat: 'Ações' | 'FIIs' | 'Tesouro Direto' | 'CDBs' | 'LCI/LCA') => {
    setSelectedFilters((prev) =>
      prev.includes(cat) ? (prev.length > 1 ? prev.filter((c) => c !== cat) : prev) : [...prev, cat]
    );
  };

  const runAnalysis = (
    targetMode: AiMode = mode,
    targetAmount: number = parseFloat(amountInput.replace(',', '.')) || 1000,
    targetFilters = selectedFilters,
    targetTicker = tickerInput
  ) => {
    if (targetAmount <= 0) return;
    setIsLoading(true);
    setSavedId(null);

    setTimeout(() => {
      let generated: AiAnalysisResult;
      if (targetMode === 'auto') {
        generated = generateAutoAllocation(targetAmount, user.investorProfile, portfolio);
      } else if (targetMode === 'filtered') {
        generated = generateFilteredAllocation(targetAmount, targetFilters, user.investorProfile);
      } else {
        generated = generateSpecificAssetAnalysis(targetAmount, targetTicker, user.investorProfile);
      }
      setResult(generated);
      setIsLoading(false);
    }, 520);
  };

  const handleSave = () => {
    if (!result) return;
    saveAiAnalysis(result);
    setSavedId(result.id);
  };

  const verdictStyle = (verdict?: AiAnalysisResult['verdict']) => {
    if (verdict === 'Boa opção agora')
      return 'bg-emerald-500/18 text-emerald-600 dark:text-emerald-300 border-emerald-500/35';
    if (verdict === 'Aporte fracionado')
      return 'bg-amber-500/18 text-amber-600 dark:text-amber-300 border-amber-500/35';
    return 'bg-rose-500/18 text-rose-600 dark:text-rose-300 border-rose-500/35';
  };

  return (
    <div className="space-y-5 pb-28 animate-enter">
      {/* Header */}
      <header className="pt-2 flex items-start gap-2.5">
        {navLayout !== 'bottom' && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu lateral"
            className="tap-press mt-1 w-10 h-10 rounded-2xl glass-pill flex items-center justify-center text-primary shrink-0 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            RenVest IA • Gemini Engine (Simulado)
          </div>
          <h1 className="text-2xl font-display font-extrabold text-primary leading-tight">
            Aporte Inteligente
          </h1>
          <p className="text-xs text-secondary mt-1">
            Baseado no seu perfil <strong className="text-primary">{user.investorProfile}</strong> e nos{' '}
            <strong className="text-primary">{portfolio.length} ativos</strong> da sua carteira.
          </p>
        </div>
      </header>

      {/* 3-Mode Segmented Control */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl glass-card-subtle">
        {(
          [
            { id: 'auto', label: 'Automático', icon: Wand2 },
            { id: 'filtered', label: 'Com Filtro', icon: SlidersHorizontal },
            { id: 'specific', label: 'Ativo Único', icon: Target },
          ] as { id: AiMode; label: string; icon: React.ComponentType<{ className?: string }> }[]
        ).map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setResult(null);
              }}
              className={`py-2.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                active
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Card */}
      <GlassCard variant="elevated" padding="lg" className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-secondary mb-2">
            Quanto você deseja aportar?
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-emerald-500">
              R$
            </span>
            <input
              type="number"
              min="50"
              step="50"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass-pill text-xl font-display font-extrabold tabular-nums text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div className="flex items-center gap-2 mt-2.5 overflow-x-auto no-scrollbar">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmountInput(String(val))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tabular-nums shrink-0 cursor-pointer transition-all ${
                  Number(amountInput) === val
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40'
                    : 'glass-pill text-secondary hover:text-primary'
                }`}
              >
                R$ {val.toLocaleString('pt-BR')}
              </button>
            ))}
          </div>
        </div>

        {/* Mode 2: Category Filter Chips */}
        {mode === 'filtered' && (
          <div className="pt-1">
            <label className="block text-xs font-semibold text-secondary mb-2">
              Escolha onde quer concentrar este aporte
            </label>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((cat) => {
                const selected = selectedFilters.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleFilter(cat)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer border ${
                      selected
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-300'
                        : 'glass-pill text-secondary hover:text-primary'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mode 3: Specific Ticker Input */}
        {mode === 'specific' && (
          <div className="pt-1 space-y-2.5">
            <label className="block text-xs font-semibold text-secondary">
              Digite o ticker da Ação ou FII (B3)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value.toUpperCase())}
                placeholder="Ex: PETR4, MXRF11, WEGE3"
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-pill text-sm font-bold uppercase text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {MARKET_ASSETS.slice(0, 7).map((a) => (
                <button
                  key={a.ticker}
                  type="button"
                  onClick={() => setTickerInput(a.ticker)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 cursor-pointer ${
                    tickerInput === a.ticker
                      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40'
                      : 'glass-pill text-secondary'
                  }`}
                >
                  {a.ticker}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={isLoading}
          onClick={() => runAnalysis()}
          className="w-full py-3.5 rounded-2xl liquid-btn font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analisando cenário e carteira...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {mode === 'auto'
                ? 'Gerar Divisão Ideal com IA'
                : mode === 'filtered'
                  ? 'Gerar Aporte Filtrado'
                  : `Analisar ${tickerInput || 'Ativo'} com IA`}
            </>
          )}
        </button>
      </GlassCard>

      {/* AI Result Section */}
      {result && !isLoading && (
        <div className="space-y-4 animate-enter">
          {/* Summary + Save */}
          <GlassCard variant="accent" padding="lg" className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Recomendação Gerada • {result.createdAt}
                </p>
                <h2 className="text-lg font-display font-bold text-primary mt-0.5">
                  {result.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleSave}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                  savedId === result.id
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40'
                    : 'glass-pill text-primary hover:border-emerald-500/40'
                }`}
              >
                {savedId === result.id ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    Salvo
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    Salvar
                  </>
                )}
              </button>
            </div>

            {result.verdict && (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${verdictStyle(
                  result.verdict
                )}`}
              >
                Veredito IA: {result.verdict}
              </div>
            )}

            <p className="text-xs text-secondary leading-relaxed">{result.summary}</p>
          </GlassCard>

          {/* Allocations Donut + Cards (Modes 1 & 2) */}
          {result.allocations && (
            <GlassCard padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-display font-bold text-primary">Distribuição Sugerida</h3>
                <span className="text-xs font-bold text-emerald-500 tabular-nums">
                  R$ {result.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={result.allocations}
                      dataKey="percent"
                      nameKey="category"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {result.allocations.map((slice) => (
                        <Cell key={slice.category} fill={slice.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.92)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '14px',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2.5">
                {result.allocations.map((slice) => (
                  <div
                    key={slice.category}
                    className="glass-card-subtle rounded-2xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: slice.color }}
                        />
                        <span className="font-display font-bold text-sm text-primary">
                          {slice.category}
                        </span>
                        <span className="text-xs font-bold text-secondary tabular-nums">
                          {slice.percent}%
                        </span>
                      </div>
                      <span className="font-display font-extrabold text-sm text-primary tabular-nums">
                        R$ {slice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <p className="text-[11px] text-secondary leading-relaxed">{slice.rationale}</p>

                    {slice.canDeepDive && (
                      <button
                        type="button"
                        onClick={() => setDeepDiveCategory(slice.category)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-0.5 cursor-pointer"
                      >
                        Aprofundar em {slice.category}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Long-Term Projection Chart (Mode 3) */}
          {result.projections && (
            <GlassCard padding="lg" className="space-y-3">
              <div>
                <h3 className="text-sm font-display font-bold text-primary">
                  Projeção de Longo Prazo (5 Anos)
                </h3>
                <p className="text-[11px] text-secondary">
                  Cenários Conservador, Base e Otimista reinvestindo dividendos.
                </p>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.projections} margin={{ top: 8, right: 6, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="projOpt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="projBase" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.16)" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val: number) => [
                        `R$ ${val.toLocaleString('pt-BR')}`,
                        '',
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.92)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '14px',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Area type="monotone" dataKey="otimista" name="Otimista" stroke="#06b6d4" strokeWidth={2} fill="url(#projOpt)" />
                    <Area type="monotone" dataKey="base" name="Base" stroke="#10b981" strokeWidth={2.5} fill="url(#projBase)" />
                    <Area type="monotone" dataKey="conservador" name="Conservador" stroke="#94a3b8" strokeWidth={1.8} strokeDasharray="4 4" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {/* Pontos Positivos e Negativos */}
          <div className="grid grid-cols-1 gap-3">
            <GlassCard padding="md" className="space-y-2.5 border-emerald-500/25">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <h3 className="text-xs font-display font-bold uppercase tracking-wider">
                  Pontos Positivos
                </h3>
              </div>
              <ul className="space-y-2">
                {result.pros.map((p, idx) => (
                  <li key={idx} className="text-xs text-secondary leading-relaxed flex gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard padding="md" className="space-y-2.5 border-amber-500/25">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-xs font-display font-bold uppercase tracking-wider">
                  Pontos de Atenção
                </h3>
              </div>
              <ul className="space-y-2">
                {result.cons.map((c, idx) => (
                  <li key={idx} className="text-xs text-secondary leading-relaxed flex gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          <p className="text-[10px] text-muted text-center px-4">
            Análise educacional simulada. Não substitui consultoria financeira ou recomendação oficial CVM.
          </p>
        </div>
      )}

      {/* Deep Dive Bottom Sheet */}
      <DeepDiveSheet
        category={deepDiveCategory}
        picks={deepDiveCategory && result?.deepDivePicks ? result.deepDivePicks[deepDiveCategory] || [] : []}
        onClose={() => setDeepDiveCategory(null)}
      />
    </div>
  );
};

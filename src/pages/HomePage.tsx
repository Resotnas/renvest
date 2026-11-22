import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sun,
  Moon,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Landmark,
  ShieldCheck,
  Menu,
  RefreshCw,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { BrandLogo } from '../components/BrandLogo';
import {
  SPRING_PILL,
  STAGGER_CONTAINER,
  STAGGER_ITEM,
  SUBTAB_VARIANTS,
} from '../components/MotionPrimitives';
import { FIXED_INCOME_RATES } from '../data/mockMarket';

type MarketTab = 'acoes' | 'fiis' | 'renda_fixa';

export const HomePage: React.FC = () => {
  const {
    theme,
    toggleTheme,
    navLayout,
    setSidebarOpen,
    user,
    portfolio,
    portfolioHistory,
    hideBalances,
    toggleHideBalances,
    openAssetInExplore,
    setActiveTab,
    macroIndicators,
    marketAssets,
    isMacroLive,
    isRefreshingMarket,
    refreshMarketData,
  } = useApp();

  const [marketTab, setMarketTab] = useState<MarketTab>('acoes');

  const totalInvested = portfolio.reduce((sum, a) => sum + a.investedValue, 0);
  const totalCurrent = portfolio.reduce((sum, a) => sum + a.currentValue, 0);
  const totalProfit = totalCurrent - totalInvested;
  const totalProfitPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  const stocks = marketAssets.filter((a) => a.type === 'Ação');
  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);
  const fiis = marketAssets.filter((a) => a.type === 'FII');

  const formatBRL = (val: number) =>
    hideBalances
      ? 'R$ •••••'
      : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const firstName = user.name.split(' ')[0];

  return (
    <div className="space-y-5 pb-28">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
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
            <BrandLogo size="sm" />
            <p className="text-xs text-secondary mt-0.5">
              Olá, <span className="font-semibold text-primary">{firstName}</span> •{' '}
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                {user.investorProfile}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleHideBalances}
            aria-label="Ocultar ou mostrar valores"
            className="tap-press w-10 h-10 rounded-full glass-pill flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
          >
            {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema Dark/Light"
            className="tap-press w-10 h-10 rounded-full glass-pill flex items-center justify-center text-primary cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </header>

      {/* Portfolio Hero Card */}
      <GlassCard variant="accent" padding="lg" className="relative overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-secondary">Patrimônio cadastrado</p>
            <h1 className="text-3xl font-display font-extrabold text-primary tabular-nums mt-1 tracking-tight">
              {formatBRL(totalCurrent)}
            </h1>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tabular-nums ${
                  totalProfit >= 0
                    ? 'bg-emerald-500/18 text-emerald-600 dark:text-emerald-300'
                    : 'bg-rose-500/18 text-rose-600 dark:text-rose-300'
                }`}
              >
                {totalProfit >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {hideBalances
                  ? '••••'
                  : `${totalProfit >= 0 ? '+' : ''}${totalProfitPct.toFixed(2)}% (${
                      totalProfit >= 0 ? '+' : ''
                    }${totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`}
              </span>
              <span className="text-[11px] text-secondary tabular-nums">
                Aportado: {formatBRL(totalInvested)}
              </span>
            </div>
          </div>

          {/* Mini Sparkline */}
          <div className="w-24 h-16 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioHistory}>
                <defs>
                  <linearGradient id="miniSpark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="#10b981"
                  strokeWidth={2.2}
                  fill="url(#miniSpark)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions inside Hero */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t glass-divider">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className="tap-press py-2.5 px-3 rounded-2xl liquid-btn text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simular Aporte IA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('portfolio')}
            className="tap-press py-2.5 px-3 rounded-2xl glass-pill text-xs font-semibold text-primary flex items-center justify-center gap-1 hover:border-emerald-500/40 cursor-pointer"
          >
            Minha Carteira
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </GlassCard>

      {/* Macro Real-Time Cards: Dólar, Selic, CDI */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-display font-bold text-primary">Indicadores em Tempo Real</h2>
          <button
            type="button"
            onClick={() => void refreshMarketData()}
            className="tap-press inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 cursor-pointer"
            title="Atualizar cotações"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isMacroLive ? 'BCB + AwesomeAPI' : 'Referência'}</span>
            <RefreshCw className={`w-3 h-3 ${isRefreshingMarket ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <motion.div
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-2.5"
        >
          {macroIndicators.map((ind) => (
            <GlassCard key={ind.id} variants={STAGGER_ITEM} padding="sm" className="rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-secondary">{ind.label}</span>
                <span className="text-[10px] text-muted">{ind.sublabel}</span>
              </div>
              <p className="text-base font-display font-extrabold text-primary tabular-nums mt-1.5">
                {ind.value}
              </p>
              <p
                className={`text-[10px] font-semibold mt-0.5 tabular-nums ${
                  ind.id === 'usd'
                    ? ind.change < 0
                      ? 'text-emerald-500'
                      : 'text-rose-500'
                    : 'text-secondary'
                }`}
              >
                {ind.changeLabel}
              </p>
            </GlassCard>
          ))}
        </motion.div>
      </section>

      {/* Market Overview Tabs */}
      <section className="space-y-3.5">
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl glass-card-subtle">
          {(
            [
              { id: 'acoes', label: 'Ações' },
              { id: 'fiis', label: 'FIIs' },
              { id: 'renda_fixa', label: 'Renda Fixa' },
            ] as { id: MarketTab; label: string }[]
          ).map((tab) => {
            const active = marketTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setMarketTab(tab.id)}
                className={`relative py-2.5 rounded-xl text-xs font-bold transition-colors duration-200 cursor-pointer ${
                  active
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="home-market-tab"
                    transition={SPRING_PILL}
                    className="absolute inset-0 rounded-xl bg-emerald-500/18 border border-emerald-500/30 shadow-sm"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Ações: Maiores Altas e Baixas */}
          {marketTab === 'acoes' && (
            <motion.div
              key="tab-acoes"
              variants={SUBTAB_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Maiores Altas do Dia
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('explore')}
                    className="text-[11px] font-semibold text-secondary hover:text-primary cursor-pointer"
                  >
                    Explorar todas →
                  </button>
                </div>
                <motion.div
                  variants={STAGGER_CONTAINER}
                  initial="hidden"
                  animate="show"
                  className="space-y-2"
                >
                  {topGainers.map((stock) => (
                    <GlassCard
                      key={stock.ticker}
                      variants={STAGGER_ITEM}
                      interactive
                      padding="sm"
                      onClick={() => openAssetInExplore(stock.ticker)}
                      className="rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-500/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/14 border border-emerald-500/25 flex items-center justify-center font-display font-bold text-xs text-emerald-600 dark:text-emerald-300">
                          {stock.ticker.slice(0, 4)}
                        </div>
                        <div>
                          <p className="font-display font-bold text-sm text-primary">{stock.ticker}</p>
                          <p className="text-[11px] text-secondary">{stock.name}</p>
                        </div>
                      </div>
                      <div className="text-right tabular-nums">
                        <p className="font-bold text-sm text-primary">
                          R$ {stock.price.toFixed(2).replace('.', ',')}
                        </p>
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-500">
                          <ArrowUpRight className="w-3 h-3" />+{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </motion.div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 px-1">
                  Maiores Baixas do Dia
                </h3>
                <motion.div
                  variants={STAGGER_CONTAINER}
                  initial="hidden"
                  animate="show"
                  className="space-y-2"
                >
                  {topLosers.map((stock) => (
                    <GlassCard
                      key={stock.ticker}
                      variants={STAGGER_ITEM}
                      interactive
                      padding="sm"
                      onClick={() => openAssetInExplore(stock.ticker)}
                      className="rounded-2xl flex items-center justify-between cursor-pointer hover:border-rose-500/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-500/12 border border-rose-500/25 flex items-center justify-center font-display font-bold text-xs text-rose-500">
                          {stock.ticker.slice(0, 4)}
                        </div>
                        <div>
                          <p className="font-display font-bold text-sm text-primary">{stock.ticker}</p>
                          <p className="text-[11px] text-secondary">{stock.name}</p>
                        </div>
                      </div>
                      <div className="text-right tabular-nums">
                        <p className="font-bold text-sm text-primary">
                          R$ {stock.price.toFixed(2).replace('.', ',')}
                        </p>
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-500">
                          <TrendingDown className="w-3 h-3" />
                          {stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* FIIs: Destaques & Dividend Yield */}
          {marketTab === 'fiis' && (
            <motion.div
              key="tab-fiis"
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
              className="space-y-2.5"
            >
              {fiis.map((fii) => (
                <GlassCard
                  key={fii.ticker}
                  variants={STAGGER_ITEM}
                  interactive
                  padding="sm"
                  onClick={() => openAssetInExplore(fii.ticker)}
                  className="rounded-2xl flex items-center justify-between cursor-pointer hover:border-cyan-500/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/14 border border-cyan-500/25 flex items-center justify-center font-display font-bold text-[11px] text-cyan-600 dark:text-cyan-300">
                      {fii.ticker.slice(0, 4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-display font-bold text-sm text-primary">{fii.ticker}</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/14 text-emerald-700 dark:text-emerald-300 tabular-nums">
                          DY {fii.dividendYield.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-secondary">
                        {fii.sector} • P/VP {fii.pvp?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right tabular-nums">
                    <p className="font-bold text-sm text-primary">
                      R$ {fii.price.toFixed(2).replace('.', ',')}
                    </p>
                    <span
                      className={`text-[11px] font-bold ${
                        fii.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {fii.changePercent >= 0 ? '+' : ''}
                      {fii.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}

          {/* Renda Fixa: Tesouro Direto & CDBs */}
          {marketTab === 'renda_fixa' && (
            <motion.div
              key="tab-rf"
              variants={STAGGER_CONTAINER}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -6, transition: { duration: 0.14 } }}
              className="space-y-2.5"
            >
              {FIXED_INCOME_RATES.map((rf) => (
                <GlassCard key={rf.id} variants={STAGGER_ITEM} padding="sm" className="rounded-2xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-blue-500/14 border border-blue-500/25 flex items-center justify-center text-blue-500 shrink-0">
                        {rf.category === 'Tesouro Direto' ? (
                          <Landmark className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-display font-bold text-sm text-primary">{rf.name}</p>
                        <p className="text-[11px] text-secondary">
                          {rf.category} • {rf.liquidity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums text-right">
                      {rf.rate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted pt-1.5 border-t glass-divider">
                    <span>Vencimento: {rf.maturity}</span>
                    <span>Mín: {rf.minInvestment}</span>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

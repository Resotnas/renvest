import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Sparkles, PlusCircle, Menu } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ChartPeriod, MarketAsset, PricePoint } from '../types';
import { GlassCard } from '../components/GlassCard';
import { RenVestLoader } from '../components/RenVestLoader';
import { SPRING_PILL } from '../components/MotionPrimitives';
import { useApp } from '../context/AppContext';
import { fetchBrapiAssetDetail, searchB3Tickers } from '../services/marketApi';

const PERIODS: ChartPeriod[] = ['1M', '6M', '1A', '5A'];

export const ExplorePage: React.FC = () => {
  const {
    exploreTicker,
    openAssetInAi,
    setQuickAddTicker,
    setActiveTab,
    navLayout,
    setSidebarOpen,
    marketAssets,
  } = useApp();

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Ação' | 'FII'>('Todos');
  const [selectedTicker, setSelectedTicker] = useState<string>(exploreTicker || 'PETR4');
  const [period, setPeriod] = useState<ChartPeriod>('1A');
  const [liveDetail, setLiveDetail] = useState<{
    asset: MarketAsset;
    points: PricePoint[];
    isLive: boolean;
  } | null>(null);
  const [loadingChart, setLoadingChart] = useState<boolean>(false);
  const [remoteSearchTickers, setRemoteSearchTickers] = useState<string[]>([]);

  useEffect(() => {
    if (exploreTicker) {
      setSelectedTicker(exploreTicker);
    }
  }, [exploreTicker]);

  // Fetch real Brapi historical chart when ticker or period changes
  useEffect(() => {
    let active = true;
    setLoadingChart(true);
    fetchBrapiAssetDetail(selectedTicker, period)
      .then((res) => {
        if (!active) return;
        setLiveDetail(res);
      })
      .finally(() => {
        if (active) setLoadingChart(false);
      });
    return () => {
      active = false;
    };
  }, [selectedTicker, period]);

  // Optional live B3 ticker search via Brapi when user types
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setRemoteSearchTickers([]);
      return;
    }
    const timer = setTimeout(() => {
      searchB3Tickers(q).then(setRemoteSearchTickers);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredAssets = useMemo(() => {
    return marketAssets.filter((asset) => {
      const matchesType = filterType === 'Todos' || asset.type === filterType;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        asset.ticker.toLowerCase().includes(q) ||
        asset.name.toLowerCase().includes(q) ||
        asset.sector.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [query, filterType, marketAssets]);

  const fallbackAsset: MarketAsset =
    marketAssets.find((a) => a.ticker === selectedTicker) || marketAssets[0];

  const activeAsset: MarketAsset =
    liveDetail && liveDetail.asset.ticker === selectedTicker ? liveDetail.asset : fallbackAsset;

  const chartData =
    liveDetail && liveDetail.asset.ticker === selectedTicker
      ? liveDetail.points
      : activeAsset.history[period];
  const firstPrice = chartData[0]?.price || activeAsset.price;
  const lastPrice = chartData[chartData.length - 1]?.price || activeAsset.price;
  const periodReturn = ((lastPrice - firstPrice) / firstPrice) * 100;
  const isPositive = periodReturn >= 0;

  return (
    <div className="space-y-5 pb-28">
      {/* Header */}
      <header className="pt-2 flex items-center gap-2.5">
        {navLayout !== 'bottom' && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu lateral"
            className="tap-press w-10 h-10 rounded-2xl glass-pill flex items-center justify-center text-primary shrink-0 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-display font-extrabold text-primary leading-tight">
            Explorar B3
          </h1>
          <p className="text-xs text-secondary mt-0.5">
            Pesquise Ações e FIIs, compare retornos e envie direto para a IA.
          </p>
        </div>
      </header>

      {/* Search + Type Filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ticker, empresa ou setor (ex: WEGE3, FII)..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass-card text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['Todos', 'Ação', 'FII'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                filterType === t
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/35'
                  : 'glass-pill text-secondary hover:text-primary'
              }`}
            >
              {t === 'Todos' ? 'Todos' : t === 'Ação' ? 'Ações' : 'FIIs'}
            </button>
          ))}
        </div>

        {/* Horizontal Ticker Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {filteredAssets.map((asset) => {
            const active = asset.ticker === activeAsset.ticker;
            return (
              <button
                key={asset.ticker}
                type="button"
                onClick={() => setSelectedTicker(asset.ticker)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all cursor-pointer ${
                  active
                    ? 'glass-accent-card ring-1 ring-emerald-500/50 text-primary'
                    : 'glass-pill text-secondary hover:text-primary'
                }`}
              >
                <span>{asset.ticker}</span>
                <span
                  className={`text-[10px] tabular-nums ${
                    asset.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {asset.changePercent >= 0 ? '+' : ''}
                  {asset.changePercent.toFixed(1)}%
                </span>
              </button>
            );
          })}
          {remoteSearchTickers
            .filter((t) => !filteredAssets.some((a) => a.ticker === t))
            .map((ticker) => (
              <button
                key={ticker}
                type="button"
                onClick={() => setSelectedTicker(ticker)}
                className="px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 glass-pill text-emerald-700 dark:text-emerald-300 border-emerald-500/30 cursor-pointer"
              >
                {ticker} (B3)
              </button>
            ))}
          {filteredAssets.length === 0 && remoteSearchTickers.length === 0 && (
            <span className="text-xs text-muted py-1">Nenhum ativo encontrado para "{query}".</span>
          )}
        </div>
      </div>

      {/* Selected Asset Detail + Interactive Chart */}
      <GlassCard variant="elevated" padding="lg" className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-extrabold text-primary">
                {activeAsset.ticker}
              </h2>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25">
                {activeAsset.type}
              </span>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              {activeAsset.name} • {activeAsset.sector}
            </p>
          </div>
          <div className="text-right tabular-nums">
            <p className="text-xl font-display font-extrabold text-primary">
              R$ {activeAsset.price.toFixed(2).replace('.', ',')}
            </p>
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold ${
                isPositive ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}
              {periodReturn.toFixed(2)}% ({period})
            </span>
          </div>
        </div>

        {/* Interactive Historical Area Chart */}
        <div className="relative h-56 w-full">
          {loadingChart && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl glass-card-subtle">
              <RenVestLoader variant="inline" size="md" message="Buscando histórico B3..." />
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="exploreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isPositive ? '#10b981' : '#f43f5e'}
                    stopOpacity={0.38}
                  />
                  <stop
                    offset="100%"
                    stopColor={isPositive ? '#10b981' : '#f43f5e'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `R$${v}`}
              />
              <Tooltip
                formatter={(val: number) => [`R$ ${val.toFixed(2).replace('.', ',')}`, activeAsset.ticker]}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.92)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '14px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#10b981' : '#f43f5e'}
                strokeWidth={2.5}
                fill="url(#exploreGrad)"
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Period Filter Buttons: 1M, 6M, 1A, 5A */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl glass-card-subtle">
          {PERIODS.map((p) => {
            const active = period === p;
            return (
              <motion.button
                key={p}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setPeriod(p)}
                className={`relative py-2 rounded-xl text-xs font-bold transition-colors duration-200 cursor-pointer ${
                  active
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="explore-period-tab"
                    transition={SPRING_PILL}
                    className="absolute inset-0 rounded-xl bg-emerald-500/20 border border-emerald-500/30"
                  />
                )}
                <span className="relative z-10">{p}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Key Fundamentals */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="glass-card-subtle rounded-2xl p-3 text-center">
            <p className="text-[10px] font-semibold text-muted uppercase">Div. Yield</p>
            <p className="text-sm font-display font-bold text-emerald-500 tabular-nums mt-0.5">
              {activeAsset.dividendYield.toFixed(2)}%
            </p>
          </div>
          <div className="glass-card-subtle rounded-2xl p-3 text-center">
            <p className="text-[10px] font-semibold text-muted uppercase">
              {activeAsset.type === 'FII' ? 'P/VP' : 'P/L'}
            </p>
            <p className="text-sm font-display font-bold text-primary tabular-nums mt-0.5">
              {activeAsset.type === 'FII'
                ? `${activeAsset.pvp?.toFixed(2)}x`
                : `${activeAsset.pl?.toFixed(1)}x`}
            </p>
          </div>
          <div className="glass-card-subtle rounded-2xl p-3 text-center">
            <p className="text-[10px] font-semibold text-muted uppercase">Valor Merc.</p>
            <p className="text-xs font-display font-bold text-primary tabular-nums mt-1">
              {activeAsset.marketCap}
            </p>
          </div>
        </div>

        <p className="text-xs text-secondary leading-relaxed">{activeAsset.summary}</p>

        {/* Cross-Screen Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => openAssetInAi(activeAsset.ticker)}
            className="py-3 px-3 rounded-2xl liquid-btn text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analisar com IA
          </button>
          <button
            type="button"
            onClick={() => {
              setQuickAddTicker({ ticker: activeAsset.ticker, type: activeAsset.type });
              setActiveTab('portfolio');
            }}
            className="tap-press py-3 px-3 rounded-2xl glass-pill text-xs font-semibold text-primary hover:border-emerald-500/40 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
            Add à Carteira
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

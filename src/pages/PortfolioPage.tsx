import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Menu,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { GlassCard } from '../components/GlassCard';
import { AssetModal } from '../components/AssetModal';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '../components/MotionPrimitives';
import { PortfolioAsset } from '../types';

export const PortfolioPage: React.FC = () => {
  const {
    portfolio,
    portfolioHistory,
    addAsset,
    updateAsset,
    deleteAsset,
    quickAddTicker,
    setQuickAddTicker,
    hideBalances,
    toggleHideBalances,
    setSidebarOpen,
    navLayout,
  } = useApp();
  const { playSuccess, playRemove } = useSoundEffects();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<PortfolioAsset | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');

  useEffect(() => {
    if (quickAddTicker) {
      setEditingAsset(null);
      setModalOpen(true);
    }
  }, [quickAddTicker]);

  const totalInvested = portfolio.reduce((s, a) => s + a.investedValue, 0);
  const totalCurrent = portfolio.reduce((s, a) => s + a.currentValue, 0);
  const totalDiff = totalCurrent - totalInvested;
  const totalDiffPct = totalInvested > 0 ? (totalDiff / totalInvested) * 100 : 0;

  const categoriesSummary = useMemo(() => {
    const map = new Map<string, number>();
    portfolio.forEach((a) => {
      map.set(a.category, (map.get(a.category) || 0) + a.currentValue);
    });
    return Array.from(map.entries())
      .map(([cat, val]) => ({
        category: cat,
        value: val,
        pct: totalCurrent > 0 ? (val / totalCurrent) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [portfolio, totalCurrent]);

  const filteredPortfolio = useMemo(() => {
    if (categoryFilter === 'Todos') return portfolio;
    return portfolio.filter((a) => a.category === categoryFilter);
  }, [portfolio, categoryFilter]);

  const formatBRL = (val: number) =>
    hideBalances
      ? 'R$ •••••'
      : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAsset(null);
    setQuickAddTicker(null);
  };

  const handleSaveAsset = (data: Omit<PortfolioAsset, 'id' | 'updatedAt'>) => {
    if (editingAsset) {
      updateAsset(editingAsset.id, data);
      playSuccess();
    } else {
      addAsset(data);
      playSuccess();
    }
  };

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
              Minha Carteira
            </h1>
            <p className="text-xs text-secondary">
              Evolução patrimonial e ativos cadastrados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleHideBalances}
            aria-label="Ocultar ou exibir valores"
            className="tap-press w-10 h-10 rounded-full glass-pill flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
          >
            {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingAsset(null);
              setQuickAddTicker(null);
              setModalOpen(true);
            }}
            className="tap-press px-3.5 py-2.5 rounded-2xl liquid-btn text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo
          </button>
        </div>
      </header>

      {/* Main Portfolio Chart + Valor Atual vs Valor Aportado */}
      <GlassCard variant="accent" padding="lg" className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-semibold text-secondary">Valor Atual</p>
            <p className="text-2xl font-display font-extrabold text-primary tabular-nums mt-0.5">
              {formatBRL(totalCurrent)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-secondary">Valor Aportado</p>
            <p className="text-lg font-display font-bold text-primary tabular-nums mt-1">
              {formatBRL(totalInvested)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between glass-card-subtle rounded-2xl px-3.5 py-2.5">
          <span className="text-xs font-medium text-secondary">Rentabilidade acumulada</span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums ${
              totalDiff >= 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {totalDiff >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {hideBalances
              ? '••••'
              : `${totalDiff >= 0 ? '+' : ''}${totalDiffPct.toFixed(2)}% (${
                  totalDiff >= 0 ? '+' : ''
                }${totalDiff.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`}
          </span>
        </div>

        {/* Gráfico da Carteira (Valor Atual vs Aportado) */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-secondary mb-2">
            <span className="font-semibold text-primary">Histórico da Carteira</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Atual
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-slate-400" />
                Aportado
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioHistory} margin={{ top: 8, right: 6, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="walletEvoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.38} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--chart-tick)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--chart-tick)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number, name: string) => [
                    hideBalances
                      ? 'R$ •••••'
                      : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    name === 'current' ? 'Valor Atual' : 'Valor Aportado',
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '14px',
                    fontSize: '12px',
                    color: 'var(--tooltip-text)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="current"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#walletEvoGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="invested"
                  stroke="#64748b"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>

      {/* Category Distribution Pills */}
      {categoriesSummary.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setCategoryFilter('Todos')}
            className={`tap-press px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 cursor-pointer border ${
              categoryFilter === 'Todos'
                ? 'bg-emerald-500/18 border-emerald-600/35 text-emerald-700 dark:text-emerald-300'
                : 'glass-pill text-secondary hover:text-primary'
            }`}
          >
            Todos ({portfolio.length})
          </button>
          {categoriesSummary.map((item) => (
            <button
              key={item.category}
              type="button"
              onClick={() => setCategoryFilter(item.category)}
              className={`tap-press px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 cursor-pointer border tabular-nums ${
                categoryFilter === item.category
                  ? 'bg-emerald-500/18 border-emerald-600/35 text-emerald-700 dark:text-emerald-300'
                  : 'glass-pill text-secondary hover:text-primary'
              }`}
            >
              {item.category} • {item.pct.toFixed(0)}%
            </button>
          ))}
        </div>
      )}

      {/* Investments List */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-display font-bold text-primary">
            Seus Investimentos ({filteredPortfolio.length})
          </h2>
          <span className="text-[11px] text-secondary">Toque em Editar para atualizar saldo</span>
        </div>

        <motion.div
          key={categoryFilter}
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="space-y-2.5"
        >
          {filteredPortfolio.map((item) => {
            const diff = item.currentValue - item.investedValue;
            const diffPct = item.investedValue > 0 ? (diff / item.investedValue) * 100 : 0;

            return (
              <GlassCard
                key={item.id}
                variants={STAGGER_ITEM}
                interactive
                padding="sm"
                className="rounded-2xl space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-primary">{item.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-secondary flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-muted" />
                      {item.institution} • Atualizado {item.updatedAt}
                    </p>
                  </div>

                  <div className="text-right tabular-nums">
                    <p className="font-display font-extrabold text-sm text-primary">
                      {formatBRL(item.currentValue)}
                    </p>
                    <p
                      className={`text-[11px] font-bold ${
                        diff >= 0
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {hideBalances
                        ? '••••'
                        : `${diff >= 0 ? '+' : ''}${diffPct.toFixed(2)}% (${
                            diff >= 0 ? '+' : ''
                          }R$ ${diff.toLocaleString('pt-BR', { minimumFractionDigits: 0 })})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t glass-divider text-[11px]">
                  <span className="text-secondary tabular-nums">
                    Aportado: <strong className="text-primary">{formatBRL(item.investedValue)}</strong>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAsset(item);
                        setModalOpen(true);
                      }}
                      className="tap-press inline-flex items-center gap-1 text-secondary hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteAsset(item.id);
                        playRemove();
                      }}
                      className="tap-press inline-flex items-center gap-1 text-secondary hover:text-rose-600 dark:hover:text-rose-400 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </motion.div>

        {filteredPortfolio.length === 0 && (
          <GlassCard padding="lg" className="text-center space-y-2">
            <Wallet className="w-6 h-6 text-emerald-500 mx-auto opacity-80" />
            <p className="text-xs font-semibold text-primary">Nenhum investimento nesta categoria</p>
            <p className="text-[11px] text-secondary">
              Clique em "Novo" para cadastrar um ativo e acompanhar sua evolução.
            </p>
          </GlassCard>
        )}
      </section>

      <AssetModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAsset}
        editingAsset={editingAsset}
        prefill={quickAddTicker}
      />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { X, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { AssetCategory, PortfolioAsset } from '../types';
import { COMMON_INSTITUTIONS } from '../data/mockMarket';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PortfolioAsset, 'id' | 'updatedAt'>) => void;
  editingAsset?: PortfolioAsset | null;
  prefill?: { ticker: string; type: 'Ação' | 'FII' } | null;
}

const CATEGORIES: AssetCategory[] = [
  'Ação',
  'FII',
  'Tesouro Direto',
  'CDB',
  'LCI/LCA',
  'Outro',
];

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAsset,
  prefill,
}) => {
  const [category, setCategory] = useState<AssetCategory>('Ação');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('Nubank');
  const [customInstitution, setCustomInstitution] = useState('');
  const [investedValue, setInvestedValue] = useState('');
  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => {
    if (editingAsset) {
      setCategory(editingAsset.category);
      setName(editingAsset.name);
      if (COMMON_INSTITUTIONS.includes(editingAsset.institution)) {
        setInstitution(editingAsset.institution);
        setCustomInstitution('');
      } else {
        setInstitution('Outro');
        setCustomInstitution(editingAsset.institution);
      }
      setInvestedValue(String(editingAsset.investedValue));
      setCurrentValue(String(editingAsset.currentValue));
    } else if (prefill) {
      setCategory(prefill.type);
      setName(prefill.ticker);
      setInstitution('XP Investimentos');
      setCustomInstitution('');
      setInvestedValue('');
      setCurrentValue('');
    } else {
      setCategory('Ação');
      setName('');
      setInstitution('Nubank');
      setCustomInstitution('');
      setInvestedValue('');
      setCurrentValue('');
    }
  }, [editingAsset, prefill, isOpen]);

  if (!isOpen) return null;

  const investedNum = parseFloat(investedValue.replace(',', '.')) || 0;
  const currentNum = parseFloat(currentValue.replace(',', '.')) || 0;
  const diff = currentNum - investedNum;
  const diffPct = investedNum > 0 ? (diff / investedNum) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || investedNum <= 0) return;
    const finalInstitution =
      institution === 'Outro' ? customInstitution.trim() || 'Outra Instituição' : institution;
    onSave({
      category,
      name: category === 'Ação' || category === 'FII' ? name.trim().toUpperCase() : name.trim(),
      institution: finalInstitution,
      investedValue: investedNum,
      currentValue: currentNum > 0 ? currentNum : investedNum,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-md p-0 sm:p-4">
      <div className="glass-card-elevated w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] p-5 pb-7 max-h-[90vh] overflow-y-auto animate-enter">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-display font-bold text-primary">
              {editingAsset ? 'Atualizar Investimento' : 'Adicionar à Carteira'}
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Acompanhe se seu patrimônio subiu ou desceu por corretora.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de investimento */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-2">
              Tipo de investimento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer border ${
                      active
                        ? 'bg-emerald-500/18 border-emerald-500/50 text-emerald-600 dark:text-emerald-300'
                        : 'glass-pill text-secondary hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nome ou Ticker */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">
              {category === 'Ação' || category === 'FII' ? 'Ticker do ativo' : 'Nome do investimento'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                category === 'Ação'
                  ? 'Ex: PETR4, ITUB4, WEGE3'
                  : category === 'FII'
                    ? 'Ex: MXRF11, HGLG11'
                    : category === 'Tesouro Direto'
                      ? 'Ex: Tesouro Selic 2029'
                      : 'Ex: CDB 112% CDI'
              }
              className="w-full px-4 py-3 rounded-2xl glass-pill text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Banco ou Corretora */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">
              Banco ou Corretora
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass-pill text-sm text-primary bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {COMMON_INSTITUTIONS.map((inst) => (
                  <option key={inst} value={inst} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {inst}
                  </option>
                ))}
              </select>
            </div>
            {institution === 'Outro' && (
              <input
                type="text"
                value={customInstitution}
                onChange={(e) => setCustomInstitution(e.target.value)}
                placeholder="Digite o nome do banco ou corretora"
                className="mt-2 w-full px-4 py-2.5 rounded-2xl glass-pill text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            )}
          </div>

          {/* Valores: Aportado vs Atual */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Valor aportado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={investedValue}
                onChange={(e) => {
                  setInvestedValue(e.target.value);
                  if (!editingAsset && !currentValue) {
                    setCurrentValue(e.target.value);
                  }
                }}
                placeholder="Ex: 2000"
                className="w-full px-3.5 py-3 rounded-2xl glass-pill text-sm tabular-nums text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">
                Valor atual hoje (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="Ex: 2180"
                className="w-full px-3.5 py-3 rounded-2xl glass-pill text-sm tabular-nums text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Live Rentabilidade Preview */}
          {investedNum > 0 && currentNum > 0 && (
            <div className="rounded-2xl glass-card-subtle px-3.5 py-2.5 flex items-center justify-between text-xs">
              <span className="text-secondary">Variação registrada</span>
              <span
                className={`inline-flex items-center gap-1 font-bold tabular-nums ${
                  diff >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {diff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {diff >= 0 ? '+' : ''}
                R$ {diff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (
                {diff >= 0 ? '+' : ''}
                {diffPct.toFixed(2)}%)
              </span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl liquid-btn font-semibold text-sm cursor-pointer mt-2"
          >
            {editingAsset ? 'Salvar alterações' : 'Adicionar investimento'}
          </button>
        </form>
      </div>
    </div>
  );
};

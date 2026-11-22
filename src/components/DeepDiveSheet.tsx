import React from 'react';
import { X, ArrowUpRight, Sparkles } from 'lucide-react';
import { DeepDivePick } from '../types';
import { useApp } from '../context/AppContext';

interface DeepDiveSheetProps {
  category: string | null;
  picks: DeepDivePick[];
  onClose: () => void;
}

export const DeepDiveSheet: React.FC<DeepDiveSheetProps> = ({ category, picks, onClose }) => {
  const { openAssetInExplore, openAssetInAi } = useApp();

  if (!category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-md">
      <div className="glass-card-elevated w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] p-5 pb-7 max-h-[85vh] overflow-y-auto animate-enter">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Seleção IA • Aprofundamento
            </div>
            <h3 className="text-lg font-display font-bold text-primary">
              Destaques em {category}
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Ativos interessantes para estudar neste momento segundo fundamentos e dividendos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-secondary hover:text-primary shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {picks.map((pick) => (
            <div key={pick.ticker} className="glass-card-subtle rounded-2xl p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-primary text-base">
                      {pick.ticker}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                      {pick.tag}
                    </span>
                  </div>
                  <p className="text-xs text-secondary">{pick.name}</p>
                </div>
                <div className="text-right tabular-nums">
                  <p className="font-bold text-sm text-primary">
                    R$ {pick.price.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-500">
                    DY {pick.dividendYield.toFixed(2)}%
                  </p>
                </div>
              </div>

              <p className="text-xs text-secondary leading-relaxed">{pick.reason}</p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAssetInExplore(pick.ticker);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl glass-pill text-xs font-semibold text-primary hover:border-emerald-500/40 flex items-center justify-center gap-1 cursor-pointer"
                >
                  Ver gráfico
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAssetInAi(pick.ticker);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/16 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Analisar ativo
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted text-center mt-4">
          Conteúdo educacional gerado por IA. Não constitui recomendação oficial de compra ou venda.
        </p>
      </div>
    </div>
  );
};

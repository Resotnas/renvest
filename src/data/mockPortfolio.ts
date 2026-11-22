import { PortfolioAsset, PortfolioSnapshot } from '../types';

export const INITIAL_PORTFOLIO: PortfolioAsset[] = [
  {
    id: 'asset-1',
    category: 'Tesouro Direto',
    name: 'Tesouro Selic 2029',
    institution: 'Nubank',
    investedValue: 6500,
    currentValue: 7120,
    updatedAt: '22/11/2026',
  },
  {
    id: 'asset-2',
    category: 'CDB',
    name: 'CDB 112% CDI',
    institution: 'Banco Inter',
    investedValue: 4000,
    currentValue: 4310,
    updatedAt: '22/11/2026',
  },
  {
    id: 'asset-3',
    category: 'FII',
    name: 'MXRF11',
    institution: 'XP Investimentos',
    investedValue: 3200,
    currentValue: 3440,
    updatedAt: '22/11/2026',
  },
  {
    id: 'asset-4',
    category: 'FII',
    name: 'HGLG11',
    institution: 'XP Investimentos',
    investedValue: 2600,
    currentValue: 2785,
    updatedAt: '22/11/2026',
  },
  {
    id: 'asset-5',
    category: 'Ação',
    name: 'PETR4',
    institution: 'BTG Pactual',
    investedValue: 2400,
    currentValue: 2690,
    updatedAt: '22/11/2026',
  },
  {
    id: 'asset-6',
    category: 'Ação',
    name: 'ITUB4',
    institution: 'BTG Pactual',
    investedValue: 2100,
    currentValue: 2295,
    updatedAt: '22/11/2026',
  },
];

export const INITIAL_PORTFOLIO_HISTORY: PortfolioSnapshot[] = [
  { date: 'Jun', invested: 15800, current: 16120 },
  { date: 'Jul', invested: 16800, current: 17410 },
  { date: 'Ago', invested: 17800, current: 18190 },
  { date: 'Set', invested: 18800, current: 19680 },
  { date: 'Out', invested: 19800, current: 20950 },
  { date: 'Nov', invested: 20800, current: 22640 },
];

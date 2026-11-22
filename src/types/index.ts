export type ThemeMode = 'dark' | 'light';
export type NavLayout = 'bottom' | 'sidebar' | 'both';

export type MainTab = 'home' | 'portfolio' | 'ai' | 'explore' | 'profile' | 'chat';
export type AppScreen = 'app' | 'login' | 'onboarding';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type InvestorProfile = 'Conservador' | 'Moderado' | 'Arrojado';

export type AssetCategory =
  | 'Ação'
  | 'FII'
  | 'Tesouro Direto'
  | 'CDB'
  | 'LCI/LCA'
  | 'Outro';

export interface UserProfile {
  name: string;
  email: string;
  investorProfile: InvestorProfile;
  onboardingCompleted: boolean;
}

export interface PortfolioAsset {
  id: string;
  category: AssetCategory;
  name: string;        // Ticker ou nome (ex: PETR4, MXRF11, Tesouro Selic 2029)
  institution: string; // Banco ou Corretora (ex: Nubank, XP, Inter, BTG)
  investedValue: number; // Valor total aportado (custo)
  currentValue: number;  // Valor atual na corretora (para acompanhar alta/baixa)
  updatedAt: string;
}

export interface PortfolioSnapshot {
  date: string;         // ex: 'Jun', 'Jul', 'Ago', ... ou '22/11'
  invested: number;
  current: number;
}

export interface MacroIndicator {
  id: 'usd' | 'selic' | 'cdi';
  label: string;
  sublabel: string;
  value: string;
  change: number;
  changeLabel: string;
}

export type ChartPeriod = '1M' | '6M' | '1A' | '5A';

export interface PricePoint {
  date: string;
  price: number;
}

export interface MarketAsset {
  ticker: string;
  name: string;
  type: 'Ação' | 'FII';
  sector: string;
  price: number;
  changePercent: number;
  dividendYield: number; // % a.a.
  pvp?: number;          // para FIIs
  pl?: number;           // para Ações
  marketCap: string;
  summary: string;
  history: Record<ChartPeriod, PricePoint[]>;
}

export interface FixedIncomeRate {
  id: string;
  name: string;
  category: 'Tesouro Direto' | 'CDB' | 'LCI/LCA';
  rate: string;
  maturity: string;
  liquidity: string;
  risk: 'Baixíssimo' | 'Baixo';
  minInvestment: string;
  highlight?: boolean;
}

export type AiMode = 'auto' | 'filtered' | 'specific';

export interface AllocationSlice {
  category: 'Ações' | 'FIIs' | 'Tesouro Direto' | 'CDBs' | 'LCI/LCA';
  percent: number;
  amount: number;
  color: string;
  rationale: string;
  canDeepDive: boolean;
}

export interface DeepDivePick {
  ticker: string;
  name: string;
  type: 'Ação' | 'FII';
  price: number;
  dividendYield: number;
  reason: string;
  tag: string;
}

export interface ProjectionPoint {
  year: string;
  conservador: number;
  base: number;
  otimista: number;
}

export interface AiAnalysisResult {
  id: string;
  createdAt: string;
  mode: AiMode;
  amount: number;
  investorProfile: InvestorProfile;
  title: string;
  summary: string;
  allocations?: AllocationSlice[];
  selectedFilters?: string[];
  specificTicker?: string;
  verdict?: 'Boa opção agora' | 'Aporte fracionado' | 'Aguardar correção';
  projections?: ProjectionPoint[];
  pros: string[];
  cons: string[];
  deepDivePicks?: Record<string, DeepDivePick[]>;
}

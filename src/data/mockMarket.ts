import { ChartPeriod, FixedIncomeRate, MacroIndicator, MarketAsset, PricePoint } from '../types';

export const MACRO_INDICATORS: MacroIndicator[] = [
  {
    id: 'usd',
    label: 'Dólar',
    sublabel: 'USD/BRL',
    value: 'R$ 5,74',
    change: -0.42,
    changeLabel: '-0,42% hoje',
  },
  {
    id: 'selic',
    label: 'Selic',
    sublabel: 'Meta BCB',
    value: '11,25%',
    change: 0.25,
    changeLabel: 'a.a. vigente',
  },
  {
    id: 'cdi',
    label: 'CDI',
    sublabel: 'Taxa DI',
    value: '11,15%',
    change: 0.0,
    changeLabel: 'a.a. diário',
  },
];

function generateHistory(
  currentPrice: number,
  seed: number,
  drift1M: number,
  drift6M: number,
  drift1A: number,
  drift5A: number,
  volatility: number
): Record<ChartPeriod, PricePoint[]> {
  const buildSeries = (labels: string[], startMultiplier: number, vol: number): PricePoint[] => {
    const startPrice = currentPrice / startMultiplier;
    const n = labels.length;
    const points: PricePoint[] = [];
    for (let i = 0; i < n; i++) {
      const progress = i / (n - 1);
      if (i === n - 1) {
        points.push({ date: labels[i], price: Number(currentPrice.toFixed(2)) });
      } else {
        const trend = startPrice + (currentPrice - startPrice) * progress;
        const wave =
          Math.sin((i + seed) * 1.45) * vol * 0.55 +
          Math.cos((i * 0.8 + seed * 2.1)) * vol * 0.45;
        const val = Math.max(1, trend * (1 + wave * (1 - progress * 0.35)));
        points.push({ date: labels[i], price: Number(val.toFixed(2)) });
      }
    }
    return points;
  };

  return {
    '1M': buildSeries(
      ['24/10', '28/10', '01/11', '05/11', '09/11', '13/11', '17/11', '22/11'],
      1 + drift1M,
      volatility * 0.45
    ),
    '6M': buildSeries(
      ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'],
      1 + drift6M,
      volatility * 0.7
    ),
    '1A': buildSeries(
      ['Dez/25', 'Fev/26', 'Abr/26', 'Jun/26', 'Ago/26', 'Out/26', 'Nov/26'],
      1 + drift1A,
      volatility * 0.9
    ),
    '5A': buildSeries(
      ['2022', '2023', '2024', '2025', '2026'],
      1 + drift5A,
      volatility * 1.15
    ),
  };
}

export const MARKET_ASSETS: MarketAsset[] = [
  {
    ticker: 'WEGE3',
    name: 'WEG S.A.',
    type: 'Ação',
    sector: 'Bens Industriais',
    price: 54.82,
    changePercent: 3.45,
    dividendYield: 1.48,
    pl: 34.2,
    marketCap: 'R$ 230,1 bi',
    summary: 'Líder global em motores elétricos e automação industrial, com forte receita dolarizada e margens consistentes.',
    history: generateHistory(54.82, 1.2, 0.052, 0.19, 0.38, 1.18, 0.045),
  },
  {
    ticker: 'PETR4',
    name: 'Petrobras PN',
    type: 'Ação',
    sector: 'Petróleo & Gás',
    price: 38.64,
    changePercent: 2.18,
    dividendYield: 14.2,
    pl: 5.4,
    marketCap: 'R$ 498,5 bi',
    summary: 'Forte geração de caixa no pré-sal e política robusta de distribuição de dividendos aos acionistas.',
    history: generateHistory(38.64, 2.7, 0.031, 0.09, 0.16, 0.92, 0.06),
  },
  {
    ticker: 'ITUB4',
    name: 'Itaú Unibanco PN',
    type: 'Ação',
    sector: 'Financeiro',
    price: 35.90,
    changePercent: 1.72,
    dividendYield: 7.45,
    pl: 8.9,
    marketCap: 'R$ 342,0 bi',
    summary: 'Maior banco privado da América Latina, com ROE acima de 21% e inadimplência controlada.',
    history: generateHistory(35.90, 3.4, 0.024, 0.12, 0.21, 0.64, 0.04),
  },
  {
    ticker: 'BBAS3',
    name: 'Banco do Brasil ON',
    type: 'Ação',
    sector: 'Financeiro',
    price: 27.45,
    changePercent: 1.15,
    dividendYield: 9.85,
    pl: 4.3,
    marketCap: 'R$ 157,2 bi',
    summary: 'Múltiplos descontados, liderança no crédito ao agronegócio e pagamentos trimestrais de proventos.',
    history: generateHistory(27.45, 4.1, 0.018, 0.05, 0.14, 0.85, 0.05),
  },
  {
    ticker: 'VALE3',
    name: 'Vale S.A. ON',
    type: 'Ação',
    sector: 'Mineração',
    price: 61.18,
    changePercent: -1.84,
    dividendYield: 8.9,
    pl: 6.1,
    marketCap: 'R$ 277,4 bi',
    summary: 'Referência mundial em minério de ferro de alta qualidade; sensível ao ritmo econômico da China.',
    history: generateHistory(61.18, 5.5, -0.034, -0.06, -0.08, 0.28, 0.065),
  },
  {
    ticker: 'MGLU3',
    name: 'Magazine Luiza ON',
    type: 'Ação',
    sector: 'Varejo',
    price: 9.42,
    changePercent: -3.28,
    dividendYield: 0.0,
    pl: 28.4,
    marketCap: 'R$ 6,9 bi',
    summary: 'Varejista omnichannel em fase de recuperação de margens; alta sensibilidade ao ciclo de juros (Selic).',
    history: generateHistory(9.42, 6.2, -0.075, -0.18, -0.26, -0.58, 0.095),
  },
  {
    ticker: 'PRIO3',
    name: 'PRIO S.A. ON',
    type: 'Ação',
    sector: 'Petróleo & Gás',
    price: 43.15,
    changePercent: -1.12,
    dividendYield: 0.4,
    pl: 8.2,
    marketCap: 'R$ 38,6 bi',
    summary: 'Maior petroleira independente do Brasil, focada em revitalização de campos maduros com baixo lifting cost.',
    history: generateHistory(43.15, 7.8, -0.02, 0.04, 0.09, 1.45, 0.07),
  },
  {
    ticker: 'MXRF11',
    name: 'Maxi Renda FII',
    type: 'FII',
    sector: 'Papel (CRI)',
    price: 10.18,
    changePercent: 0.69,
    dividendYield: 12.15,
    pvp: 1.02,
    marketCap: 'R$ 4,4 bi',
    summary: 'FII de papel mais popular da B3, com carteira pulverizada em CRIs indexados ao CDI e IPCA.',
    history: generateHistory(10.18, 8.3, 0.012, 0.03, 0.05, 0.14, 0.022),
  },
  {
    ticker: 'HGLG11',
    name: 'Pátria Logística FII',
    type: 'FII',
    sector: 'Logística',
    price: 161.40,
    changePercent: 0.94,
    dividendYield: 8.62,
    pvp: 1.01,
    marketCap: 'R$ 5,5 bi',
    summary: 'Referência em galpões logísticos triple-A com inquilinos de primeira linha e baixa vacância histórica.',
    history: generateHistory(161.40, 9.1, 0.015, 0.045, 0.07, 0.22, 0.028),
  },
  {
    ticker: 'XPML11',
    name: 'XP Malls FII',
    type: 'FII',
    sector: 'Shoppings',
    price: 112.85,
    changePercent: 1.24,
    dividendYield: 9.48,
    pvp: 0.97,
    marketCap: 'R$ 6,1 bi',
    summary: 'Participação nos principais shopping centers do país, combinando renda mensal e ganho de capital.',
    history: generateHistory(112.85, 10.4, 0.021, 0.06, 0.11, 0.31, 0.032),
  },
  {
    ticker: 'KNRI11',
    name: 'Kinea Renda Imobiliária',
    type: 'FII',
    sector: 'Híbrido (Lajes & Log)',
    price: 148.20,
    changePercent: -0.35,
    dividendYield: 8.15,
    pvp: 0.94,
    marketCap: 'R$ 4,1 bi',
    summary: 'Portfólio equilibrado entre edifícios corporativos em São Paulo/Rio e galpões logísticos com gestão Kinea.',
    history: generateHistory(148.20, 11.2, -0.008, 0.02, 0.04, 0.18, 0.026),
  },
  {
    ticker: 'BTLG11',
    name: 'BTG Pactual Logística',
    type: 'FII',
    sector: 'Logística',
    price: 101.90,
    changePercent: 0.52,
    dividendYield: 9.18,
    pvp: 0.99,
    marketCap: 'R$ 4,3 bi',
    summary: 'Forte presença no raio 30km de São Paulo com contratos atípicos e reciclagem eficiente de ativos.',
    history: generateHistory(101.90, 12.6, 0.011, 0.038, 0.065, 0.24, 0.025),
  },
];

export const FIXED_INCOME_RATES: FixedIncomeRate[] = [
  {
    id: 'td-selic-2029',
    name: 'Tesouro Selic 2029',
    category: 'Tesouro Direto',
    rate: 'SELIC + 0,14%',
    maturity: '01/03/2029',
    liquidity: 'Diária (D+0/D+1)',
    risk: 'Baixíssimo',
    minInvestment: 'R$ 154,00',
    highlight: true,
  },
  {
    id: 'td-ipca-2035',
    name: 'Tesouro IPCA+ 2035',
    category: 'Tesouro Direto',
    rate: 'IPCA + 6,62% a.a.',
    maturity: '15/05/2035',
    liquidity: 'Diária (Marcação)',
    risk: 'Baixíssimo',
    minInvestment: 'R$ 45,20',
    highlight: true,
  },
  {
    id: 'td-pre-2028',
    name: 'Tesouro Prefixado 2028',
    category: 'Tesouro Direto',
    rate: '12,48% a.a.',
    maturity: '01/01/2028',
    liquidity: 'Diária (Marcação)',
    risk: 'Baixíssimo',
    minInvestment: 'R$ 36,80',
  },
  {
    id: 'cdb-112-cdi',
    name: 'CDB Banco Digital 112% CDI',
    category: 'CDB',
    rate: '112% do CDI (~12,49%)',
    maturity: '2 anos',
    liquidity: 'No vencimento (FGC)',
    risk: 'Baixo',
    minInvestment: 'R$ 100,00',
    highlight: true,
  },
  {
    id: 'cdb-105-liq',
    name: 'CDB Liquidez Diária 105% CDI',
    category: 'CDB',
    rate: '105% do CDI (~11,71%)',
    maturity: '3 anos',
    liquidity: 'Diária (FGC)',
    risk: 'Baixo',
    minInvestment: 'R$ 1,00',
  },
  {
    id: 'lci-95-cdi',
    name: 'LCI Isenta de IR 95% CDI',
    category: 'LCI/LCA',
    rate: '95% CDI (equiv. 115% CDB)',
    maturity: '1 ano',
    liquidity: 'Após 9 meses (FGC)',
    risk: 'Baixo',
    minInvestment: 'R$ 500,00',
  },
];

export const COMMON_INSTITUTIONS = [
  'Nubank',
  'XP Investimentos',
  'Banco Inter',
  'BTG Pactual',
  'Rico',
  'Itaú / Íon',
  'Santander',
  'C6 Bank',
  'Clear',
  'Outro',
];

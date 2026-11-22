import {
  AiAnalysisResult,
  AllocationSlice,
  DeepDivePick,
  InvestorProfile,
  PortfolioAsset,
  ProjectionPoint,
} from '../types';
import { MARKET_ASSETS } from '../data/mockMarket';

const TARGET_WEIGHTS: Record<
  InvestorProfile,
  { Ações: number; FIIs: number; 'Tesouro Direto': number; CDBs: number }
> = {
  Conservador: {
    'Tesouro Direto': 45,
    CDBs: 35,
    FIIs: 15,
    Ações: 5,
  },
  Moderado: {
    'Tesouro Direto': 30,
    CDBs: 20,
    FIIs: 25,
    Ações: 25,
  },
  Arrojado: {
    Ações: 45,
    FIIs: 30,
    'Tesouro Direto': 15,
    CDBs: 10,
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Ações: '#10b981',
  FIIs: '#06b6d4',
  'Tesouro Direto': '#3b82f6',
  CDBs: '#8b5cf6',
  'LCI/LCA': '#f59e0b',
};

const DEEP_DIVE_DATABASE: Record<string, DeepDivePick[]> = {
  Ações: [
    {
      ticker: 'ITUB4',
      name: 'Itaú Unibanco PN',
      type: 'Ação',
      price: 35.9,
      dividendYield: 7.45,
      tag: 'Qualidade & Dividendos',
      reason: 'ROE acima de 21%, balanço resiliente e forte geração de caixa mesmo com Selic elevada.',
    },
    {
      ticker: 'WEGE3',
      name: 'WEG S.A.',
      type: 'Ação',
      price: 54.82,
      dividendYield: 1.48,
      tag: 'Crescimento Global',
      reason: 'Receita dolarizada e expansão internacional em eletrificação e energia limpa.',
    },
    {
      ticker: 'BBAS3',
      name: 'Banco do Brasil ON',
      type: 'Ação',
      price: 27.45,
      dividendYield: 9.85,
      tag: 'Valor Descontado',
      reason: 'Negociado a ~4,3x lucro com pagamentos trimestrais recorrentes de proventos.',
    },
  ],
  FIIs: [
    {
      ticker: 'HGLG11',
      name: 'Pátria Logística FII',
      type: 'FII',
      price: 161.4,
      dividendYield: 8.62,
      tag: 'Tijolo Logístico',
      reason: 'Galpões triple-A com baixa vacância e contratos longos com grandes empresas.',
    },
    {
      ticker: 'MXRF11',
      name: 'Maxi Renda FII',
      type: 'FII',
      price: 10.18,
      dividendYield: 12.15,
      tag: 'Renda Mensal (CRI)',
      reason: 'Alta liquidez e carteira diversificada atrelada ao CDI e IPCA com dividendos isentos.',
    },
    {
      ticker: 'XPML11',
      name: 'XP Malls FII',
      type: 'FII',
      price: 112.85,
      dividendYield: 9.48,
      tag: 'Shoppings Premium',
      reason: 'P/VP abaixo de 1,00 com participação nos shoppings mais rentáveis do Brasil.',
    },
  ],
};

function formatNow(): string {
  const now = new Date();
  return now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCurrentBreakdown(portfolio: PortfolioAsset[]) {
  const total = portfolio.reduce((sum, item) => sum + item.currentValue, 0);
  const buckets = {
    Ações: 0,
    FIIs: 0,
    'Tesouro Direto': 0,
    CDBs: 0,
  };
  for (const item of portfolio) {
    if (item.category === 'Ação') buckets.Ações += item.currentValue;
    else if (item.category === 'FII') buckets.FIIs += item.currentValue;
    else if (item.category === 'Tesouro Direto') buckets['Tesouro Direto'] += item.currentValue;
    else buckets.CDBs += item.currentValue;
  }
  return { total, buckets };
}

export function generateAutoAllocation(
  amount: number,
  profile: InvestorProfile,
  portfolio: PortfolioAsset[]
): AiAnalysisResult {
  const targets = TARGET_WEIGHTS[profile];
  const { total, buckets } = getCurrentBreakdown(portfolio);

  // Rebalance subtly towards target profile weights
  const rawScores: Record<keyof typeof targets, number> = {
    Ações: targets.Ações,
    FIIs: targets.FIIs,
    'Tesouro Direto': targets['Tesouro Direto'],
    CDBs: targets.CDBs,
  };

  if (total > 0) {
    (Object.keys(targets) as (keyof typeof targets)[]).forEach((cat) => {
      const currentPct = (buckets[cat] / total) * 100;
      const gap = targets[cat] - currentPct;
      rawScores[cat] = Math.max(5, Math.round(targets[cat] + gap * 0.35));
    });
  }

  const scoreSum = Object.values(rawScores).reduce((a, b) => a + b, 0);
  const categories = Object.keys(rawScores) as (keyof typeof targets)[];

  let remainingPct = 100;
  const allocations: AllocationSlice[] = categories.map((cat, idx) => {
    const pct =
      idx === categories.length - 1
        ? remainingPct
        : Math.round((rawScores[cat] / scoreSum) * 100);
    remainingPct -= pct;

    const rationaleMap: Record<keyof typeof targets, string> = {
      Ações: 'Potencial de valorização no longo prazo e dividendos crescentes.',
      FIIs: 'Fluxo de renda passiva mensal isento de IR para reinvestimento.',
      'Tesouro Direto': 'Segurança soberana com juros reais atrativos (Selic/IPCA+).',
      CDBs: 'Rentabilidade acima do CDI protegida pelo FGC para estabilidade.',
    };

    return {
      category: cat,
      percent: pct,
      amount: Number(((amount * pct) / 100).toFixed(2)),
      color: CATEGORY_COLORS[cat],
      rationale: rationaleMap[cat],
      canDeepDive: cat === 'Ações' || cat === 'FIIs',
    };
  });

  const sorted = [...allocations].sort((a, b) => b.percent - a.percent);

  return {
    id: `ai-${Date.now()}`,
    createdAt: formatNow(),
    mode: 'auto',
    amount,
    investorProfile: profile,
    title: `Divisão Automática • Perfil ${profile}`,
    summary: `Considerando seu perfil ${profile} e sua carteira atual (${total > 0 ? `R$ ${total.toLocaleString('pt-BR')}` : 'iniciando agora'}), a IA rebalanceou o aporte de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} priorizando ${sorted[0].category} (${sorted[0].percent}%) e ${sorted[1].category} (${sorted[1].percent}%) para otimizar retorno ajustado ao risco.`,
    allocations: sorted,
    pros: [
      `Alinhamento automático ao seu perfil ${profile} com rebalanceamento da carteira atual.`,
      'Aproveita juros altos da Renda Fixa (Selic 11,25%) sem perder exposição a ativos geradores de renda.',
      'Diversificação entre 4 classes reduz a volatilidade mensal do patrimônio.',
    ],
    cons: [
      'Aportes muito fracionados exigem atenção à liquidez mínima de alguns títulos bancários.',
      'A parcela de Renda Variável (Ações e FIIs) está sujeita a oscilações de curto prazo.',
    ],
    deepDivePicks: DEEP_DIVE_DATABASE,
  };
}

export function generateFilteredAllocation(
  amount: number,
  selectedCategories: ('Ações' | 'FIIs' | 'Tesouro Direto' | 'CDBs' | 'LCI/LCA')[],
  profile: InvestorProfile
): AiAnalysisResult {
  const baseWeight: Record<string, number> = {
    Ações: profile === 'Arrojado' ? 40 : profile === 'Moderado' ? 28 : 15,
    FIIs: profile === 'Arrojado' ? 30 : profile === 'Moderado' ? 30 : 20,
    'Tesouro Direto': profile === 'Conservador' ? 45 : 25,
    CDBs: profile === 'Conservador' ? 35 : 22,
    'LCI/LCA': profile === 'Conservador' ? 30 : 20,
  };

  const sumWeights = selectedCategories.reduce((acc, c) => acc + (baseWeight[c] || 20), 0);
  let remainingPct = 100;

  const allocations: AllocationSlice[] = selectedCategories.map((cat, idx) => {
    const pct =
      idx === selectedCategories.length - 1
        ? remainingPct
        : Math.round(((baseWeight[cat] || 20) / sumWeights) * 100);
    remainingPct -= pct;

    const rationaleMap: Record<string, string> = {
      Ações: 'Foco em empresas líderes com boa governança e caixa sólido.',
      FIIs: 'Equilíbrio entre fundos de papel (CDI/IPCA) e tijolo descontado.',
      'Tesouro Direto': 'Proteção contra inflação (IPCA+) e liquidez no Tesouro Selic.',
      CDBs: 'Emissores sólidos pagando entre 108% e 114% do CDI com FGC.',
      'LCI/LCA': 'Isenção de Imposto de Renda aumenta o ganho líquido no médio prazo.',
    };

    return {
      category: cat,
      percent: pct,
      amount: Number(((amount * pct) / 100).toFixed(2)),
      color: CATEGORY_COLORS[cat] || '#10b981',
      rationale: rationaleMap[cat],
      canDeepDive: cat === 'Ações' || cat === 'FIIs',
    };
  });

  return {
    id: `ai-${Date.now()}`,
    createdAt: formatNow(),
    mode: 'filtered',
    amount,
    investorProfile: profile,
    selectedFilters: selectedCategories,
    title: `Aporte Direcionado (${selectedCategories.join(' + ')})`,
    summary: `Distribuição otimizada de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} exclusivamente nas classes selecionadas, respeitando o teto de risco do seu perfil ${profile}.`,
    allocations,
    pros: [
      `Concentração intencional nas ${selectedCategories.length} classe(s) escolhida(s) para acelerar metas específicas.`,
      'Mantém disciplina de alocação proporcional sem precisar pesquisar tudo manualmente.',
      selectedCategories.includes('FIIs') || selectedCategories.includes('LCI/LCA')
        ? 'Inclui eficiência tributária com rendimentos isentos de IR.'
        : 'Alta liquidez e facilidade de acompanhamento na corretora.',
    ],
    cons: [
      selectedCategories.length === 1
        ? 'Concentrar 100% do aporte em uma única classe reduz o efeito de proteção entre ativos.'
        : 'Ignora temporariamente as demais classes da carteira — lembre de rebalancear nos próximos meses.',
      'Rentabilidade passada não garante retorno futuro.',
    ],
    deepDivePicks: DEEP_DIVE_DATABASE,
  };
}

export function generateSpecificAssetAnalysis(
  amount: number,
  tickerInput: string,
  profile: InvestorProfile
): AiAnalysisResult {
  const cleanTicker = tickerInput.trim().toUpperCase();
  const asset =
    MARKET_ASSETS.find((a) => a.ticker === cleanTicker) || {
      ticker: cleanTicker || 'PETR4',
      name: `${cleanTicker || 'PETR4'} B3`,
      type: cleanTicker.endsWith('11') ? ('FII' as const) : ('Ação' as const),
      sector: 'Mercado B3',
      price: 32.5,
      changePercent: 0.85,
      dividendYield: 8.5,
      marketCap: 'R$ 24,0 bi',
      summary: 'Ativo negociado na B3 com liquidez regular e acompanhamento de fundamentos.',
      history: MARKET_ASSETS[0].history,
    };

  const estimatedCotas = Math.floor(amount / asset.price);
  const annualDividendEst = Number(((amount * asset.dividendYield) / 100).toFixed(2));

  let verdict: AiAnalysisResult['verdict'] = 'Boa opção agora';
  if (asset.changePercent < -2.5 || (asset.pl && asset.pl > 25 && asset.dividendYield < 1)) {
    verdict = 'Aporte fracionado';
  }
  if (asset.ticker === 'MGLU3') {
    verdict = 'Aguardar correção';
  }

  const baseRate = asset.type === 'FII' ? 0.115 : asset.dividendYield > 7 ? 0.135 : 0.15;
  const consRate = baseRate * 0.55;
  const optRate = baseRate * 1.45;

  const projections: ProjectionPoint[] = [0, 1, 2, 3, 4, 5].map((yr) => ({
    year: yr === 0 ? 'Hoje' : `${yr}A`,
    conservador: Math.round(amount * Math.pow(1 + consRate, yr)),
    base: Math.round(amount * Math.pow(1 + baseRate, yr)),
    otimista: Math.round(amount * Math.pow(1 + optRate, yr)),
  }));

  return {
    id: `ai-${Date.now()}`,
    createdAt: formatNow(),
    mode: 'specific',
    amount,
    investorProfile: profile,
    specificTicker: asset.ticker,
    verdict,
    title: `Análise ${asset.ticker} • ${asset.name}`,
    summary: `Com R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, você adquire cerca de ${estimatedCotas} ${asset.type === 'FII' ? 'cotas' : 'ações'} de ${asset.ticker} (cotação ref. R$ ${asset.price.toFixed(2)}). ${asset.summary} Projeção estimada de proventos anuais: ~R$ ${annualDividendEst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (DY ${asset.dividendYield.toFixed(2)}%).`,
    projections,
    pros: [
      `Setor ${asset.sector} com boa liquidez diária na B3 e fundamentos acompanhados.`,
      asset.dividendYield >= 7
        ? `Dividend Yield atrativo de ${asset.dividendYield.toFixed(2)}% a.a., gerando renda recorrente.`
        : `Forte potencial de valorização de capital no horizonte de 3 a 5 anos.`,
      asset.pvp
        ? `P/VP atual em ${asset.pvp.toFixed(2)}x indica precificação equilibrada frente ao valor patrimonial.`
        : `Múltiplo P/L de ${asset.pl ?? 9.5}x compatível com a geração de caixa da companhia.`,
    ],
    cons: [
      profile === 'Conservador'
        ? `Para o perfil Conservador, recomenda-se limitar exposição individual em renda variável a no máximo 5% da carteira.`
        : 'Risco específico de empresa/fundo: evite concentrar grande parte do patrimônio em um único ticker.',
      'Sensível ao cenário macroeconômico brasileiro (juros, inflação e câmbio).',
    ],
  };
}

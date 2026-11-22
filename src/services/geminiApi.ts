import {
  AiAnalysisResult,
  AiMode,
  ChatMessage,
  InvestorProfile,
  MacroIndicator,
  MarketAsset,
  PortfolioAsset,
} from '../types';
import {
  generateAutoAllocation,
  generateFilteredAllocation,
  generateSpecificAssetAnalysis,
} from './mockAiEngine';

const VITE_GEMINI_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
export const isGeminiClientConfigured = Boolean(
  VITE_GEMINI_KEY && !VITE_GEMINI_KEY.includes('sua-chave')
);

/**
 * Chama o Google Gemini 2.5 Flash:
 * 1) Tenta primeiro /api/gemini (Vercel Serverless Function — seguro em produção)
 * 2) Se indisponível localmente, usa VITE_GEMINI_API_KEY direto do .env.local
 */
async function callGemini(params: {
  prompt: string;
  systemInstruction?: string;
  responseMimeType?: string;
}): Promise<string | null> {
  // 1. Try serverless proxy (Vercel)
  try {
    const proxyRes = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json?.text) return json.text as string;
    }
  } catch {
    // Ignore locally when /api/gemini doesn't exist
  }

  // 2. Fallback to direct client call for local Vite dev if VITE_GEMINI_API_KEY is set
  if (!isGeminiClientConfigured) return null;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
      VITE_GEMINI_KEY!
    )}`;
    const body: Record<string, unknown> = {
      contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
      generationConfig: {
        temperature: 0.4,
        ...(params.responseMimeType ? { responseMimeType: params.responseMimeType } : {}),
      },
    };
    if (params.systemInstruction) {
      body.systemInstruction = { parts: [{ text: params.systemInstruction }] };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.candidates?.[0]?.content?.parts?.[0]?.text as string) || null;
  } catch {
    return null;
  }
}

export async function generateSmartAllocation(params: {
  mode: AiMode;
  amount: number;
  profile: InvestorProfile;
  portfolio: PortfolioAsset[];
  selectedFilters: ('Ações' | 'FIIs' | 'Tesouro Direto' | 'CDBs' | 'LCI/LCA')[];
  ticker: string;
  macro: MacroIndicator[];
}): Promise<{ result: AiAnalysisResult; usedRealAi: boolean }> {
  const { mode, amount, profile, portfolio, selectedFilters, ticker, macro } = params;

  // Compute deterministic baseline first (ensures valid charts/picks/fallback always)
  const baseline =
    mode === 'auto'
      ? generateAutoAllocation(amount, profile, portfolio)
      : mode === 'filtered'
        ? generateFilteredAllocation(amount, selectedFilters, profile)
        : generateSpecificAssetAnalysis(amount, ticker, profile);

  const portfolioSummary =
    portfolio.length > 0
      ? portfolio
          .map(
            (p) =>
              `${p.name} (${p.category}, ${p.institution}): aportado R$${p.investedValue}, atual R$${p.currentValue}`
          )
          .join('; ')
      : 'Carteira ainda vazia.';

  const macroSummary = macro.map((m) => `${m.label}: ${m.value}`).join(', ');

  const systemInstruction =
    'Você é a IA especialista em investimentos do app RenVest (mercado brasileiro B3, Tesouro Direto e CDBs). Responda SEMPRE em português do Brasil claro, objetivo e educacional (sem prometer lucro garantido). Retorne APENAS JSON válido.';

  const prompt =
    mode === 'specific'
      ? `Analise um aporte de R$ ${amount} especificamente no ativo ${ticker} para um investidor de perfil ${profile}.
Indicadores atuais: ${macroSummary}.
Carteira atual do usuário: ${portfolioSummary}.
Retorne JSON com exatamente as chaves:
{
  "title": "string curta",
  "summary": "parágrafo objetivo de 3 a 4 linhas avaliando o momento e encaixe na carteira",
  "verdict": "Boa opção agora" | "Aporte fracionado" | "Aguardar correção",
  "pros": ["3 pontos positivos objetivos"],
  "cons": ["2 ou 3 pontos de atenção/riscos"]
}`
      : `Monte uma recomendação de aporte de R$ ${amount} no modo ${
          mode === 'auto'
            ? 'Divisão Automática (Ações, FIIs, Tesouro Direto, CDBs)'
            : `Aporte com Filtro apenas em: ${selectedFilters.join(', ')}`
        } para um investidor de perfil ${profile}.
Indicadores atuais: ${macroSummary}.
Carteira atual do usuário: ${portfolioSummary}.
Retorne JSON com exatamente as chaves:
{
  "title": "string curta",
  "summary": "parágrafo objetivo explicando a estratégia considerando perfil e carteira atual",
  "allocations": [
    { "category": "Ações" | "FIIs" | "Tesouro Direto" | "CDBs" | "LCI/LCA", "percent": numero_inteiro_somando_100, "rationale": "justificativa curta de 1 linha" }
  ],
  "pros": ["3 pontos positivos objetivos"],
  "cons": ["2 pontos de atenção"]
}`;

  const rawText = await callGemini({
    prompt,
    systemInstruction,
    responseMimeType: 'application/json',
  });

  if (!rawText) {
    return { result: baseline, usedRealAi: false };
  }

  try {
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const CATEGORY_COLORS: Record<string, string> = {
      Ações: '#10b981',
      FIIs: '#06b6d4',
      'Tesouro Direto': '#3b82f6',
      CDBs: '#8b5cf6',
      'LCI/LCA': '#f59e0b',
    };

    const mergedAllocations =
      Array.isArray(parsed.allocations) && parsed.allocations.length > 0
        ? parsed.allocations.map((s: any) => {
            const pct = Number(s.percent) || 0;
            const cat = s.category as 'Ações' | 'FIIs' | 'Tesouro Direto' | 'CDBs' | 'LCI/LCA';
            return {
              category: cat,
              percent: pct,
              amount: Number(((amount * pct) / 100).toFixed(2)),
              color: CATEGORY_COLORS[cat] || '#10b981',
              rationale: String(s.rationale || ''),
              canDeepDive: cat === 'Ações' || cat === 'FIIs',
            };
          })
        : baseline.allocations;

    const merged: AiAnalysisResult = {
      ...baseline,
      title: typeof parsed.title === 'string' && parsed.title ? parsed.title : baseline.title,
      summary:
        typeof parsed.summary === 'string' && parsed.summary ? parsed.summary : baseline.summary,
      verdict:
        parsed.verdict === 'Boa opção agora' ||
        parsed.verdict === 'Aporte fracionado' ||
        parsed.verdict === 'Aguardar correção'
          ? parsed.verdict
          : baseline.verdict,
      allocations: mergedAllocations,
      pros: Array.isArray(parsed.pros) && parsed.pros.length > 0 ? parsed.pros : baseline.pros,
      cons: Array.isArray(parsed.cons) && parsed.cons.length > 0 ? parsed.cons : baseline.cons,
    };

    return { result: merged, usedRealAi: true };
  } catch {
    return { result: baseline, usedRealAi: false };
  }
}

export async function askDonaRe(params: {
  question: string;
  profile: InvestorProfile;
  portfolio: PortfolioAsset[];
  macro: MacroIndicator[];
  marketAssets: MarketAsset[];
  recentHistory: ChatMessage[];
}): Promise<{ text: string; usedRealAi: boolean }> {
  const { question, profile, portfolio, macro, marketAssets, recentHistory } = params;

  const totalInvested = portfolio.reduce((s, a) => s + a.investedValue, 0);
  const totalCurrent = portfolio.reduce((s, a) => s + a.currentValue, 0);

  const systemInstruction = `Você é a Dona Rê, assistente virtual simpática, elegante e especialista em investimentos do app RenVest (mercado brasileiro: Ações, FIIs, Tesouro Direto e CDBs).
Responda sempre em português do Brasil, de forma clara, acolhedora e objetiva (máximo 2 a 3 parágrafos curtos ou tópicos com negrito **assim**).
Nunca prometa retornos garantidos e lembre quando oportuno que a análise é educacional.`;

  const contextBlock = `
Perfil do investidor: ${profile}
Patrimônio atual: R$ ${totalCurrent.toFixed(2)} (Aportado: R$ ${totalInvested.toFixed(2)})
Carteira: ${portfolio.map((p) => `${p.name} (${p.category}, ${p.institution}): atual R$${p.currentValue}`).join('; ') || 'vazia'}
Indicadores macro hoje: ${macro.map((m) => `${m.label} ${m.value}`).join(' | ')}
Amostra de cotações B3: ${marketAssets
    .slice(0, 8)
    .map((a) => `${a.ticker} R$${a.price} (${a.changePercent >= 0 ? '+' : ''}${a.changePercent}%, DY ${a.dividendYield}%)`)
    .join(', ')}
Histórico recente:
${recentHistory
  .slice(-4)
  .map((m) => `${m.role === 'user' ? 'Usuário' : 'Dona Rê'}: ${m.content}`)
  .join('\n')}
`;

  const rawText = await callGemini({
    prompt: `${contextBlock}\nPergunta atual do usuário: ${question}`,
    systemInstruction,
  });

  if (rawText) {
    return { text: rawText.trim(), usedRealAi: true };
  }

  return { text: '', usedRealAi: false };
}

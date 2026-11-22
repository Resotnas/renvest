import { ChartPeriod, MacroIndicator, MarketAsset, PricePoint } from '../types';
import { MACRO_INDICATORS, MARKET_ASSETS } from '../data/mockMarket';

const BRAPI_TOKEN = (import.meta.env.VITE_BRAPI_TOKEN as string | undefined)?.trim();
const HAS_BRAPI_TOKEN = Boolean(BRAPI_TOKEN && !BRAPI_TOKEN.includes('seu-token'));

// Free public Brapi tickers that work even without a token
const FREE_PUBLIC_TICKERS = ['PETR4', 'MGLU3', 'VALE3', 'ITUB4'];

export interface MacroFetchResult {
  indicators: MacroIndicator[];
  isLive: boolean;
  updatedAt: string;
}

export interface MarketFetchResult {
  assets: MarketAsset[];
  isLive: boolean;
  sourceLabel: string;
}

function formatTimeNow(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Busca Dólar (AwesomeAPI), Selic (BCB SGS 432) e CDI (BCB SGS 4389) em tempo real.
 * 100% gratuito e sem necessidade de chave de API.
 */
export async function fetchMacroIndicators(): Promise<MacroFetchResult> {
  const result = MACRO_INDICATORS.map((item) => ({ ...item }));
  let liveCount = 0;

  const [usdRes, selicRes, cdiRes] = await Promise.allSettled([
    fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL').then((r) =>
      r.ok ? r.json() : Promise.reject(new Error('AwesomeAPI error'))
    ),
    fetch(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json'
    ).then((r) => (r.ok ? r.json() : Promise.reject(new Error('BCB Selic error')))),
    fetch(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json'
    ).then((r) => (r.ok ? r.json() : Promise.reject(new Error('BCB CDI error')))),
  ]);

  if (usdRes.status === 'fulfilled' && usdRes.value?.USDBRL) {
    const usd = usdRes.value.USDBRL;
    const bid = parseFloat(usd.bid);
    const pct = parseFloat(usd.pctChange);
    if (!Number.isNaN(bid)) {
      result[0] = {
        id: 'usd',
        label: 'Dólar',
        sublabel: 'USD/BRL',
        value: `R$ ${bid.toFixed(2).replace('.', ',')}`,
        change: Number.isNaN(pct) ? 0 : pct,
        changeLabel: `${pct >= 0 ? '+' : ''}${(pct || 0).toFixed(2).replace('.', ',')}% hoje`,
      };
      liveCount++;
    }
  }

  if (selicRes.status === 'fulfilled' && Array.isArray(selicRes.value) && selicRes.value[0]) {
    const val = parseFloat(selicRes.value[0].valor);
    if (!Number.isNaN(val)) {
      result[1] = {
        id: 'selic',
        label: 'Selic',
        sublabel: 'Meta BCB',
        value: `${val.toFixed(2).replace('.', ',')}%`,
        change: 0,
        changeLabel: 'a.a. vigente',
      };
      liveCount++;
    }
  }

  if (cdiRes.status === 'fulfilled' && Array.isArray(cdiRes.value) && cdiRes.value[0]) {
    const val = parseFloat(cdiRes.value[0].valor);
    if (!Number.isNaN(val)) {
      result[2] = {
        id: 'cdi',
        label: 'CDI',
        sublabel: 'Taxa DI',
        value: `${val.toFixed(2).replace('.', ',')}%`,
        change: 0,
        changeLabel: 'a.a. BCB',
      };
      liveCount++;
    }
  }

  return {
    indicators: result,
    isLive: liveCount > 0,
    updatedAt: formatTimeNow(),
  };
}

/**
 * Busca cotações em tempo real da B3 via Brapi API.
 * Com VITE_BRAPI_TOKEN busca todos os ativos; sem token atualiza os 4 ativos públicos gratuitos.
 */
export async function fetchB3MarketAssets(): Promise<MarketFetchResult> {
  const baseAssets = MARKET_ASSETS.map((a) => ({ ...a }));
  const tickersToFetch = HAS_BRAPI_TOKEN
    ? baseAssets.map((a) => a.ticker)
    : FREE_PUBLIC_TICKERS;

  try {
    const tokenParam = HAS_BRAPI_TOKEN ? `?token=${encodeURIComponent(BRAPI_TOKEN!)}` : '';
    const url = `https://brapi.dev/api/quote/${tickersToFetch.join(',')}${tokenParam}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Brapi HTTP ${res.status}`);

    const data = await res.json();
    const quotes: any[] = data?.results || [];
    if (quotes.length === 0) throw new Error('Empty Brapi results');

    const quoteMap = new Map<string, any>();
    quotes.forEach((q) => {
      if (q?.symbol) quoteMap.set(q.symbol.toUpperCase(), q);
    });

    const merged = baseAssets.map((asset) => {
      const q = quoteMap.get(asset.ticker);
      if (!q || typeof q.regularMarketPrice !== 'number') return asset;

      const updatedHistory = { ...asset.history };
      (['1M', '6M', '1A', '5A'] as ChartPeriod[]).forEach((p) => {
        const pts = [...updatedHistory[p]];
        if (pts.length > 0) {
          pts[pts.length - 1] = {
            ...pts[pts.length - 1],
            price: Number(q.regularMarketPrice.toFixed(2)),
          };
        }
        updatedHistory[p] = pts;
      });

      return {
        ...asset,
        name: q.shortName || q.longName || asset.name,
        price: Number(q.regularMarketPrice.toFixed(2)),
        changePercent:
          typeof q.regularMarketChangePercent === 'number'
            ? Number(q.regularMarketChangePercent.toFixed(2))
            : asset.changePercent,
        pl:
          typeof q.priceEarnings === 'number' && q.priceEarnings > 0
            ? Number(q.priceEarnings.toFixed(1))
            : asset.pl,
        marketCap:
          typeof q.marketCap === 'number' && q.marketCap > 0
            ? `R$ ${(q.marketCap / 1e9).toFixed(1).replace('.', ',')} bi`
            : asset.marketCap,
        history: updatedHistory,
      };
    });

    return {
      assets: merged,
      isLive: true,
      sourceLabel: HAS_BRAPI_TOKEN ? 'Brapi B3 • Ao vivo' : 'Brapi B3 (Demo Público)',
    };
  } catch {
    return {
      assets: baseAssets,
      isLive: false,
      sourceLabel: 'Dados de referência',
    };
  }
}

const BRAPI_RANGE_MAP: Record<ChartPeriod, { range: string; interval: string }> = {
  '1M': { range: '1mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1wk' },
  '1A': { range: '1y', interval: '1wk' },
  '5A': { range: '5y', interval: '1mo' },
};

/**
 * Busca histórico real de um ticker específico na Brapi para o gráfico do Explorar.
 */
export async function fetchBrapiAssetDetail(
  ticker: string,
  period: ChartPeriod
): Promise<{ asset: MarketAsset; points: PricePoint[]; isLive: boolean } | null> {
  const clean = ticker.trim().toUpperCase();
  if (!clean) return null;

  const canFetch = HAS_BRAPI_TOKEN || FREE_PUBLIC_TICKERS.includes(clean);
  if (!canFetch) return null;

  try {
    const { range, interval } = BRAPI_RANGE_MAP[period];
    const params = new URLSearchParams({ range, interval });
    if (HAS_BRAPI_TOKEN) params.set('token', BRAPI_TOKEN!);

    const res = await fetch(`https://brapi.dev/api/quote/${encodeURIComponent(clean)}?${params}`);
    if (!res.ok) return null;

    const data = await res.json();
    const q = data?.results?.[0];
    if (!q || typeof q.regularMarketPrice !== 'number') return null;

    const rawHist: any[] = q.historicalDataPrice || [];
    const points: PricePoint[] = rawHist
      .filter((pt) => typeof pt.close === 'number' && pt.close > 0)
      .map((pt) => {
        const d = new Date(pt.date * 1000);
        const label =
          period === '5A'
            ? d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
            : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        return { date: label, price: Number(pt.close.toFixed(2)) };
      });

    const fallbackMock = MARKET_ASSETS.find((a) => a.ticker === clean);
    const isFii = clean.endsWith('11');

    const asset: MarketAsset = {
      ticker: clean,
      name: q.shortName || q.longName || fallbackMock?.name || clean,
      type: fallbackMock?.type || (isFii ? 'FII' : 'Ação'),
      sector: fallbackMock?.sector || 'B3',
      price: Number(q.regularMarketPrice.toFixed(2)),
      changePercent:
        typeof q.regularMarketChangePercent === 'number'
          ? Number(q.regularMarketChangePercent.toFixed(2))
          : fallbackMock?.changePercent || 0,
      dividendYield: fallbackMock?.dividendYield || 0,
      pvp: fallbackMock?.pvp,
      pl:
        typeof q.priceEarnings === 'number' && q.priceEarnings > 0
          ? Number(q.priceEarnings.toFixed(1))
          : fallbackMock?.pl,
      marketCap:
        typeof q.marketCap === 'number' && q.marketCap > 0
          ? `R$ ${(q.marketCap / 1e9).toFixed(1).replace('.', ',')} bi`
          : fallbackMock?.marketCap || '—',
      summary:
        fallbackMock?.summary ||
        `Ativo ${clean} listado na B3 com cotação atualizada via Brapi API.`,
      history: fallbackMock?.history || {
        '1M': points,
        '6M': points,
        '1A': points,
        '5A': points,
      },
    };

    return {
      asset,
      points: points.length >= 2 ? points : asset.history[period],
      isLive: true,
    };
  } catch {
    return null;
  }
}

/**
 * Pesquisa qualquer ticker na B3 via Brapi /api/quote/list (quando houver token).
 */
export async function searchB3Tickers(query: string): Promise<string[]> {
  const q = query.trim().toUpperCase();
  if (q.length < 2 || !HAS_BRAPI_TOKEN) return [];
  try {
    const res = await fetch(
      `https://brapi.dev/api/quote/list?search=${encodeURIComponent(q)}&limit=8&token=${encodeURIComponent(
        BRAPI_TOKEN!
      )}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const stocks: any[] = data?.stocks || [];
    return stocks.map((s) => s.stock).filter(Boolean);
  } catch {
    return [];
  }
}

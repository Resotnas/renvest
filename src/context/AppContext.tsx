import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  AiAnalysisResult,
  AiMode,
  AppScreen,
  InvestorProfile,
  MacroIndicator,
  MainTab,
  MarketAsset,
  NavLayout,
  PortfolioAsset,
  PortfolioSnapshot,
  ThemeMode,
  UserProfile,
} from '../types';
import { INITIAL_PORTFOLIO, INITIAL_PORTFOLIO_HISTORY } from '../data/mockPortfolio';
import { MACRO_INDICATORS, MARKET_ASSETS } from '../data/mockMarket';
import { fetchB3MarketAssets, fetchMacroIndicators } from '../services/marketApi';
import {
  deletePortfolioAssetDb,
  deleteUserAiAnalysis,
  fetchPortfolioSnapshots,
  fetchUserAiAnalyses,
  fetchUserPortfolio,
  fetchUserProfile,
  insertPortfolioAsset,
  insertPortfolioSnapshot,
  insertUserAiAnalysis,
  isSupabaseConfigured,
  supabase,
  updatePortfolioAssetDb,
  upsertUserProfile,
} from '../lib/supabase';

interface AppContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  navLayout: NavLayout;
  setNavLayout: (layout: NavLayout) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  screen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  activeTab: MainTab;
  previousTab: MainTab;
  tabDirection: number;
  setActiveTab: (tab: MainTab) => void;
  user: UserProfile;
  authUserId: string | null;
  isCloudConnected: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateUserProfile: (partial: Partial<UserProfile>) => void;
  setInvestorProfile: (profile: InvestorProfile) => void;
  portfolio: PortfolioAsset[];
  portfolioHistory: PortfolioSnapshot[];
  addAsset: (asset: Omit<PortfolioAsset, 'id' | 'updatedAt'>) => void;
  updateAsset: (id: string, asset: Omit<PortfolioAsset, 'id' | 'updatedAt'>) => void;
  deleteAsset: (id: string) => void;
  aiHistory: AiAnalysisResult[];
  saveAiAnalysis: (result: AiAnalysisResult) => void;
  deleteAiAnalysis: (id: string) => void;
  // Live Market Data (BCB + AwesomeAPI + Brapi)
  macroIndicators: MacroIndicator[];
  marketAssets: MarketAsset[];
  isMacroLive: boolean;
  isMarketLive: boolean;
  marketSourceLabel: string;
  isRefreshingMarket: boolean;
  refreshMarketData: () => Promise<void>;
  // Cross-screen navigation helpers
  exploreTicker: string;
  openAssetInExplore: (ticker: string) => void;
  aiPreset: { mode: AiMode; ticker?: string } | null;
  openAssetInAi: (ticker: string) => void;
  clearAiPreset: () => void;
  quickAddTicker: { ticker: string; type: 'Ação' | 'FII' } | null;
  setQuickAddTicker: (data: { ticker: string; type: 'Ação' | 'FII' } | null) => void;
  hideBalances: boolean;
  toggleHideBalances: () => void;
  soundEnabled: boolean;
  toggleSoundEnabled: () => void;
}

const STORAGE_KEYS = {
  theme: 'renvest_theme_v1',
  navLayout: 'renvest_nav_layout_v1',
  user: 'renvest_user_v1',
  portfolio: 'renvest_portfolio_v1',
  history: 'renvest_portfolio_history_v1',
  aiHistory: 'renvest_ai_history_v1',
  hideBalances: 'renvest_hide_balances_v1',
  soundEnabled: 'renvest_sound_enabled_v1',
};

const DEFAULT_USER: UserProfile = {
  name: 'Renato Silva',
  email: 'renato@renvest.app',
  investorProfile: 'Moderado',
  onboardingCompleted: true,
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const AppContext = createContext<AppContextValue | undefined>(undefined);
const TAB_ORDER: MainTab[] = ['home', 'portfolio', 'ai', 'explore', 'profile', 'chat'];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() =>
    readStorage<ThemeMode>(STORAGE_KEYS.theme, 'dark')
  );
  const [navLayout, setNavLayout] = useState<NavLayout>(() =>
    readStorage<NavLayout>(STORAGE_KEYS.navLayout, 'both')
  );
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [screen, setScreen] = useState<AppScreen>(isSupabaseConfigured ? 'login' : 'app');
  const [activeTab, setActiveTabState] = useState<MainTab>('home');
  const [previousTab, setPreviousTab] = useState<MainTab>('home');
  const [tabDirection, setTabDirection] = useState<number>(1);

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile>(() =>
    readStorage<UserProfile>(STORAGE_KEYS.user, DEFAULT_USER)
  );
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>(() =>
    readStorage<PortfolioAsset[]>(STORAGE_KEYS.portfolio, INITIAL_PORTFOLIO)
  );
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioSnapshot[]>(() =>
    readStorage<PortfolioSnapshot[]>(STORAGE_KEYS.history, INITIAL_PORTFOLIO_HISTORY)
  );
  const [aiHistory, setAiHistory] = useState<AiAnalysisResult[]>(() =>
    readStorage<AiAnalysisResult[]>(STORAGE_KEYS.aiHistory, [])
  );

  // Live Market Data state
  const [macroIndicators, setMacroIndicators] = useState<MacroIndicator[]>(MACRO_INDICATORS);
  const [marketAssets, setMarketAssets] = useState<MarketAsset[]>(MARKET_ASSETS);
  const [isMacroLive, setIsMacroLive] = useState<boolean>(false);
  const [isMarketLive, setIsMarketLive] = useState<boolean>(false);
  const [marketSourceLabel, setMarketSourceLabel] = useState<string>('Carregando cotações...');
  const [isRefreshingMarket, setIsRefreshingMarket] = useState<boolean>(false);

  const [exploreTicker, setExploreTicker] = useState<string>('PETR4');
  const [aiPreset, setAiPreset] = useState<{ mode: AiMode; ticker?: string } | null>(null);
  const [quickAddTicker, setQuickAddTicker] = useState<{
    ticker: string;
    type: 'Ação' | 'FII';
  } | null>(null);
  const [hideBalances, setHideBalances] = useState<boolean>(() =>
    readStorage<boolean>(STORAGE_KEYS.hideBalances, false)
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() =>
    readStorage<boolean>(STORAGE_KEYS.soundEnabled, true)
  );

  const isCloudConnected = Boolean(isSupabaseConfigured && authUserId);

  // Fetch real-time Macro (BCB + AwesomeAPI) & B3 Quotes (Brapi)
  const refreshMarketData = useCallback(async () => {
    setIsRefreshingMarket(true);
    try {
      const [macroRes, b3Res] = await Promise.all([
        fetchMacroIndicators(),
        fetchB3MarketAssets(),
      ]);
      setMacroIndicators(macroRes.indicators);
      setIsMacroLive(macroRes.isLive);
      setMarketAssets(b3Res.assets);
      setIsMarketLive(b3Res.isLive);
      setMarketSourceLabel(b3Res.sourceLabel);
    } finally {
      setIsRefreshingMarket(false);
    }
  }, []);

  useEffect(() => {
    void refreshMarketData();
  }, [refreshMarketData]);

  // Hydrate cloud user data when Supabase Auth session is active
  const hydrateCloudData = useCallback(async (uid: string, fallbackEmail?: string) => {
    const [cloudProfile, cloudPortfolio, cloudSnapshots, cloudAnalyses] = await Promise.all([
      fetchUserProfile(uid),
      fetchUserPortfolio(uid),
      fetchPortfolioSnapshots(uid),
      fetchUserAiAnalyses(uid),
    ]);

    if (cloudProfile) {
      setUser(cloudProfile);
      setScreen(cloudProfile.onboardingCompleted ? 'app' : 'onboarding');
    } else {
      const freshProfile: UserProfile = {
        name: fallbackEmail ? fallbackEmail.split('@')[0] : 'Investidor',
        email: fallbackEmail || '',
        investorProfile: 'Moderado',
        onboardingCompleted: false,
      };
      setUser(freshProfile);
      await upsertUserProfile(uid, freshProfile);
      setScreen('onboarding');
    }

    setPortfolio(cloudPortfolio);
    if (cloudSnapshots.length > 0) {
      setPortfolioHistory(cloudSnapshots);
    } else {
      setPortfolioHistory([{ date: 'Início', invested: 0, current: 0 }]);
    }
    setAiHistory(cloudAnalyses);
  }, []);

  // Listen to Supabase Auth state changes
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        setAuthUserId(sessionUser.id);
        void hydrateCloudData(sessionUser.id, sessionUser.email);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      if (sessionUser) {
        setAuthUserId(sessionUser.id);
        void hydrateCloudData(sessionUser.id, sessionUser.email);
      } else {
        setAuthUserId(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [hydrateCloudData]);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!supabase) {
      setScreen('app');
      return {};
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    if (!supabase) {
      updateUserProfile({ name, email, onboardingCompleted: false });
      setScreen('onboarding');
      return {};
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { error: error.message };
    if (data.user && !data.session) {
      return {
        error: 'Conta criada! Confirme o e-mail enviado pelo Supabase para entrar.',
      };
    }
    return {};
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAuthUserId(null);
    setScreen('login');
  };

  const setActiveTab = (tab: MainTab) => {
    if (tab !== activeTab) {
      const fromIdx = TAB_ORDER.indexOf(activeTab);
      const toIdx = TAB_ORDER.indexOf(tab);
      setTabDirection(toIdx >= fromIdx ? 1 : -1);
      if (activeTab !== 'chat') {
        setPreviousTab(activeTab);
      }
    }
    setActiveTabState(tab);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#070B12' : '#EEF4F8');
    }
    localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.navLayout, JSON.stringify(navLayout));
  }, [navLayout]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.hideBalances, JSON.stringify(hideBalances));
  }, [hideBalances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.soundEnabled, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    if (!isCloudConnected) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    }
  }, [user, isCloudConnected]);

  useEffect(() => {
    if (!isCloudConnected) {
      localStorage.setItem(STORAGE_KEYS.portfolio, JSON.stringify(portfolio));
    }
  }, [portfolio, isCloudConnected]);

  useEffect(() => {
    if (!isCloudConnected) {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(portfolioHistory));
    }
  }, [portfolioHistory, isCloudConnected]);

  useEffect(() => {
    if (!isCloudConnected) {
      localStorage.setItem(STORAGE_KEYS.aiHistory, JSON.stringify(aiHistory));
    }
  }, [aiHistory, isCloudConnected]);

  const recordPortfolioSnapshot = (nextPortfolio: PortfolioAsset[]) => {
    const totalInvested = nextPortfolio.reduce((s, a) => s + a.investedValue, 0);
    const totalCurrent = nextPortfolio.reduce((s, a) => s + a.currentValue, 0);
    const todayLabel = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });

    const snap: PortfolioSnapshot = {
      date: todayLabel,
      invested: totalInvested,
      current: totalCurrent,
    };

    setPortfolioHistory((prev) => {
      const copy = [...prev];
      if (copy.length > 0 && copy[copy.length - 1].date === todayLabel) {
        copy[copy.length - 1] = snap;
      } else {
        copy.push(snap);
      }
      return copy.slice(-8);
    });

    if (authUserId) {
      void insertPortfolioSnapshot(authUserId, snap);
    }
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const updateUserProfile = (partial: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...partial }));
    if (authUserId) {
      void upsertUserProfile(authUserId, partial);
    }
  };

  const setInvestorProfile = (investorProfile: InvestorProfile) => {
    setUser((prev) => ({ ...prev, investorProfile, onboardingCompleted: true }));
    if (authUserId) {
      void upsertUserProfile(authUserId, { investorProfile, onboardingCompleted: true });
    }
  };

  const addAsset = (asset: Omit<PortfolioAsset, 'id' | 'updatedAt'>) => {
    const today = new Date().toLocaleDateString('pt-BR');
    const tempId = `asset-${Date.now()}`;
    const newAsset: PortfolioAsset = {
      ...asset,
      id: tempId,
      updatedAt: today,
    };
    setPortfolio((prev) => {
      const next = [newAsset, ...prev];
      recordPortfolioSnapshot(next);
      return next;
    });

    if (authUserId) {
      void insertPortfolioAsset(authUserId, asset).then((saved) => {
        if (saved) {
          setPortfolio((prev) => prev.map((a) => (a.id === tempId ? saved : a)));
        }
      });
    }
  };

  const updateAsset = (id: string, asset: Omit<PortfolioAsset, 'id' | 'updatedAt'>) => {
    const today = new Date().toLocaleDateString('pt-BR');
    setPortfolio((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, ...asset, updatedAt: today } : item
      );
      recordPortfolioSnapshot(next);
      return next;
    });
    if (authUserId) {
      void updatePortfolioAssetDb(authUserId, id, asset);
    }
  };

  const deleteAsset = (id: string) => {
    setPortfolio((prev) => {
      const next = prev.filter((item) => item.id !== id);
      recordPortfolioSnapshot(next);
      return next;
    });
    if (authUserId) {
      void deletePortfolioAssetDb(authUserId, id);
    }
  };

  const saveAiAnalysis = (result: AiAnalysisResult) => {
    setAiHistory((prev) => {
      if (prev.some((r) => r.id === result.id)) return prev;
      return [result, ...prev];
    });
    if (authUserId) {
      void insertUserAiAnalysis(authUserId, result).then((dbId) => {
        if (dbId) {
          setAiHistory((prev) =>
            prev.map((item) => (item.id === result.id ? { ...item, id: dbId } : item))
          );
        }
      });
    }
  };

  const deleteAiAnalysis = (id: string) => {
    setAiHistory((prev) => prev.filter((r) => r.id !== id));
    if (authUserId) {
      void deleteUserAiAnalysis(authUserId, id);
    }
  };

  const openAssetInExplore = (ticker: string) => {
    setExploreTicker(ticker);
    setActiveTab('explore');
    setScreen('app');
  };

  const openAssetInAi = (ticker: string) => {
    setAiPreset({ mode: 'specific', ticker });
    setActiveTab('ai');
    setScreen('app');
  };

  const clearAiPreset = () => setAiPreset(null);
  const toggleHideBalances = () => setHideBalances((prev) => !prev);
  const toggleSoundEnabled = () => setSoundEnabled((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        navLayout,
        setNavLayout,
        sidebarOpen,
        setSidebarOpen,
        screen,
        setScreen,
        activeTab,
        previousTab,
        tabDirection,
        setActiveTab,
        user,
        authUserId,
        isCloudConnected,
        signIn,
        signUp,
        signOut,
        updateUserProfile,
        setInvestorProfile,
        portfolio,
        portfolioHistory,
        addAsset,
        updateAsset,
        deleteAsset,
        aiHistory,
        saveAiAnalysis,
        deleteAiAnalysis,
        macroIndicators,
        marketAssets,
        isMacroLive,
        isMarketLive,
        marketSourceLabel,
        isRefreshingMarket,
        refreshMarketData,
        exploreTicker,
        openAssetInExplore,
        aiPreset,
        openAssetInAi,
        clearAiPreset,
        quickAddTicker,
        setQuickAddTicker,
        hideBalances,
        toggleHideBalances,
        soundEnabled,
        toggleSoundEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

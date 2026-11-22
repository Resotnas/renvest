import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AiAnalysisResult,
  AiMode,
  AppScreen,
  InvestorProfile,
  MainTab,
  NavLayout,
  PortfolioAsset,
  PortfolioSnapshot,
  ThemeMode,
  UserProfile,
} from '../types';
import { INITIAL_PORTFOLIO, INITIAL_PORTFOLIO_HISTORY } from '../data/mockPortfolio';

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
  setActiveTab: (tab: MainTab) => void;
  user: UserProfile;
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
  exploreTicker: string;
  openAssetInExplore: (ticker: string) => void;
  aiPreset: { mode: AiMode; ticker?: string } | null;
  openAssetInAi: (ticker: string) => void;
  clearAiPreset: () => void;
  quickAddTicker: { ticker: string; type: 'Ação' | 'FII' } | null;
  setQuickAddTicker: (data: { ticker: string; type: 'Ação' | 'FII' } | null) => void;
  hideBalances: boolean;
  toggleHideBalances: () => void;
}

const STORAGE_KEYS = {
  theme: 'renvest_theme_v1',
  navLayout: 'renvest_nav_layout_v1',
  user: 'renvest_user_v1',
  portfolio: 'renvest_portfolio_v1',
  history: 'renvest_portfolio_history_v1',
  aiHistory: 'renvest_ai_history_v1',
  hideBalances: 'renvest_hide_balances_v1',
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => readStorage<ThemeMode>(STORAGE_KEYS.theme, 'dark'));
  const [navLayout, setNavLayout] = useState<NavLayout>(() =>
    readStorage<NavLayout>(STORAGE_KEYS.navLayout, 'both')
  );
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [screen, setScreen] = useState<AppScreen>('app');
  const [activeTab, setActiveTabState] = useState<MainTab>('home');
  const [previousTab, setPreviousTab] = useState<MainTab>('home');
  const [user, setUser] = useState<UserProfile>(() => readStorage<UserProfile>(STORAGE_KEYS.user, DEFAULT_USER));
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>(() =>
    readStorage<PortfolioAsset[]>(STORAGE_KEYS.portfolio, INITIAL_PORTFOLIO)
  );
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioSnapshot[]>(() =>
    readStorage<PortfolioSnapshot[]>(STORAGE_KEYS.history, INITIAL_PORTFOLIO_HISTORY)
  );
  const [aiHistory, setAiHistory] = useState<AiAnalysisResult[]>(() =>
    readStorage<AiAnalysisResult[]>(STORAGE_KEYS.aiHistory, [])
  );

  const [exploreTicker, setExploreTicker] = useState<string>('PETR4');
  const [aiPreset, setAiPreset] = useState<{ mode: AiMode; ticker?: string } | null>(null);
  const [quickAddTicker, setQuickAddTicker] = useState<{ ticker: string; type: 'Ação' | 'FII' } | null>(null);
  const [hideBalances, setHideBalances] = useState<boolean>(() =>
    readStorage<boolean>(STORAGE_KEYS.hideBalances, false)
  );

  const setActiveTab = (tab: MainTab) => {
    if (tab !== activeTab && activeTab !== 'chat') {
      setPreviousTab(activeTab);
    }
    setActiveTabState(tab);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.portfolio, JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(portfolioHistory));
  }, [portfolioHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.aiHistory, JSON.stringify(aiHistory));
  }, [aiHistory]);

  const recordPortfolioSnapshot = (nextPortfolio: PortfolioAsset[]) => {
    const totalInvested = nextPortfolio.reduce((s, a) => s + a.investedValue, 0);
    const totalCurrent = nextPortfolio.reduce((s, a) => s + a.currentValue, 0);
    const todayLabel = 'Hoje';

    setPortfolioHistory((prev) => {
      const copy = [...prev];
      if (copy.length > 0 && copy[copy.length - 1].date === todayLabel) {
        copy[copy.length - 1] = { date: todayLabel, invested: totalInvested, current: totalCurrent };
      } else {
        copy.push({ date: todayLabel, invested: totalInvested, current: totalCurrent });
      }
      return copy.slice(-8);
    });
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const updateUserProfile = (partial: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...partial }));
  };

  const setInvestorProfile = (investorProfile: InvestorProfile) => {
    setUser((prev) => ({ ...prev, investorProfile, onboardingCompleted: true }));
  };

  const addAsset = (asset: Omit<PortfolioAsset, 'id' | 'updatedAt'>) => {
    const today = new Date().toLocaleDateString('pt-BR');
    const newAsset: PortfolioAsset = {
      ...asset,
      id: `asset-${Date.now()}`,
      updatedAt: today,
    };
    setPortfolio((prev) => {
      const next = [newAsset, ...prev];
      recordPortfolioSnapshot(next);
      return next;
    });
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
  };

  const deleteAsset = (id: string) => {
    setPortfolio((prev) => {
      const next = prev.filter((item) => item.id !== id);
      recordPortfolioSnapshot(next);
      return next;
    });
  };

  const saveAiAnalysis = (result: AiAnalysisResult) => {
    setAiHistory((prev) => {
      if (prev.some((r) => r.id === result.id)) return prev;
      return [result, ...prev];
    });
  };

  const deleteAiAnalysis = (id: string) => {
    setAiHistory((prev) => prev.filter((r) => r.id !== id));
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
        setActiveTab,
        user,
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
        exploreTicker,
        openAssetInExplore,
        aiPreset,
        openAssetInAi,
        clearAiPreset,
        quickAddTicker,
        setQuickAddTicker,
        hideBalances,
        toggleHideBalances,
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

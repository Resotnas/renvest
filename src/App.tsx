import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { SideMenu } from './components/SideMenu';
import { FloatingAiButton } from './components/FloatingAiButton';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AiInvestPage } from './pages/AiInvestPage';
import { ExplorePage } from './pages/ExplorePage';
import { ProfilePage } from './pages/ProfilePage';
import { ChatAssistantPage } from './pages/ChatAssistantPage';

const AppShell: React.FC = () => {
  const { screen, activeTab, navLayout } = useApp();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Ambient Liquid Glass Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb-1 animate-float-slow absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl" />
        <div
          className="ambient-orb-2 animate-float-slow absolute top-1/3 -right-28 w-[26rem] h-[26rem] rounded-full blur-3xl"
          style={{ animationDelay: '-4s' }}
        />
        <div
          className="ambient-orb-3 animate-float-slow absolute -bottom-24 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ animationDelay: '-7s' }}
        />
      </div>

      {/* Mobile-First Fluid Container (NO backdrop-blur on wrapper so fixed BottomNav stays pinned to viewport!) */}
      <div className="relative z-10 mx-auto w-full max-w-[430px] min-h-screen sm:my-4 sm:min-h-[calc(100vh-2rem)] sm:rounded-[38px] sm:border sm:border-slate-900/10 sm:dark:border-white/12 sm:shadow-2xl sm:bg-white/45 sm:dark:bg-slate-950/35">
        {screen === 'login' && <LoginPage />}
        {screen === 'onboarding' && <OnboardingPage />}
        {screen === 'app' && (
          <main key={activeTab} className="px-4 pt-3">
            {activeTab === 'home' && <HomePage />}
            {activeTab === 'portfolio' && <PortfolioPage />}
            {activeTab === 'ai' && <AiInvestPage />}
            {activeTab === 'explore' && <ExplorePage />}
            {activeTab === 'profile' && <ProfilePage />}
            {activeTab === 'chat' && <ChatAssistantPage />}
          </main>
        )}
      </div>

      {/* Truly Viewport-Fixed Floating Dona Rê Button, Bottom Nav & Slide-out Lateral Menu */}
      {screen === 'app' && <FloatingAiButton />}
      {screen === 'app' && (navLayout === 'bottom' || navLayout === 'both') && <BottomNav />}
      {screen === 'app' && <SideMenu />}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;

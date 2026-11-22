import React from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { SideMenu } from './components/SideMenu';
import { FloatingAiButton } from './components/FloatingAiButton';
import { PAGE_VARIANTS, SCREEN_VARIANTS } from './components/MotionPrimitives';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AiInvestPage } from './pages/AiInvestPage';
import { ExplorePage } from './pages/ExplorePage';
import { ProfilePage } from './pages/ProfilePage';
import { ChatAssistantPage } from './pages/ChatAssistantPage';

const AppShell: React.FC = () => {
  const { screen, activeTab, tabDirection, navLayout } = useApp();

  return (
    <MotionConfig reducedMotion="never">
      <div className="relative min-h-screen w-full overflow-x-hidden transition-colors duration-300">
        {/* Ambient Liquid Glass Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="ambient-orb-1 animate-float-slow absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl transition-colors duration-300" />
          <div
            className="ambient-orb-2 animate-float-slow absolute top-1/3 -right-28 w-[26rem] h-[26rem] rounded-full blur-3xl transition-colors duration-300"
            style={{ animationDelay: '-4s' }}
          />
          <div
            className="ambient-orb-3 animate-float-slow absolute -bottom-24 left-1/4 w-96 h-96 rounded-full blur-3xl transition-colors duration-300"
            style={{ animationDelay: '-7s' }}
          />
        </div>

        {/* Mobile-First Fluid Container */}
        <div className="relative z-10 mx-auto w-full max-w-[430px] min-h-screen sm:my-4 sm:min-h-[calc(100vh-2rem)] sm:rounded-[38px] sm:border sm:border-slate-900/10 sm:dark:border-white/12 sm:shadow-2xl sm:bg-white/45 sm:dark:bg-slate-950/35 transition-colors duration-300 overflow-x-clip">
          <AnimatePresence mode="wait">
            {screen === 'login' && (
              <motion.div
                key="screen-login"
                variants={SCREEN_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <LoginPage />
              </motion.div>
            )}

            {screen === 'onboarding' && (
              <motion.div
                key="screen-onboarding"
                variants={SCREEN_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <OnboardingPage />
              </motion.div>
            )}

            {screen === 'app' && (
              <motion.div
                key="screen-app"
                variants={SCREEN_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <main className="px-4 pt-3">
                  <AnimatePresence mode="wait" custom={tabDirection}>
                    <motion.div
                      key={activeTab}
                      custom={tabDirection}
                      variants={PAGE_VARIANTS}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      {activeTab === 'home' && <HomePage />}
                      {activeTab === 'portfolio' && <PortfolioPage />}
                      {activeTab === 'ai' && <AiInvestPage />}
                      {activeTab === 'explore' && <ExplorePage />}
                      {activeTab === 'profile' && <ProfilePage />}
                      {activeTab === 'chat' && <ChatAssistantPage />}
                    </motion.div>
                  </AnimatePresence>
                </main>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Viewport-Fixed Floating Dona Rê Button, Bottom Nav & Slide-out Lateral Menu */}
        {screen === 'app' && <FloatingAiButton />}
        {screen === 'app' && (navLayout === 'bottom' || navLayout === 'both') && <BottomNav />}
        {screen === 'app' && <SideMenu />}
      </div>
    </MotionConfig>
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

import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { NewEntryView } from './components/NewEntryView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { AuthView } from './components/AuthView';
import { NewEntryModal } from './components/NewEntryModal';
import { ReadingDetailModal } from './components/ReadingDetailModal';
import { HelpModal } from './components/HelpModal';
import { LogoutModal } from './components/LogoutModal';
import { ToastContainer } from './components/ToastContainer';

const MainLayout: React.FC = () => {
  const { activeTab, showAuthScreen, isGuest, firebaseUser, isAuthLoading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication check
  const isUserAuthenticated = Boolean(firebaseUser && !firebaseUser.isAnonymous);
  const shouldShowAuth = showAuthScreen || (!isGuest && !isUserAuthenticated);

  // 1. If Firebase Auth state is still resolving on page load/refresh, show clean splash screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center text-[#191c1e] antialiased">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#006a61] to-[#131b2e] flex items-center justify-center shadow-md">
            <Zap className="w-8 h-8 text-[#86f2e4] animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-lg font-bold text-[#191c1e] tracking-tight">HogarMedido</h1>
            <div className="flex items-center gap-2 text-xs text-[#76777d]">
              <div className="w-3.5 h-3.5 border-2 border-[#006a61] border-t-transparent rounded-full animate-spin" />
              <span>Verificando sesión...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. If user is not authenticated and not in guest mode, show AuthView immediately
  if (shouldShowAuth) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
        <AuthView />
        <ToastContainer />
      </div>
    );
  }

  // 3. User is logged in or guest mode active: show main dashboard application
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        setMobileOpen={setMobileMenuOpen} 
      />

      {/* Top Header Bar */}
      <Header 
        onToggleMobileMenu={() => setMobileMenuOpen(true)} 
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pt-20 px-4 md:px-8 pb-12 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'registro' && <NewEntryView />}
        {activeTab === 'historial' && <HistoryView />}
        {activeTab === 'configuracion' && <SettingsView />}
      </main>

      {/* Global Modals & Overlays */}
      <NewEntryModal />
      <ReadingDetailModal />
      <HelpModal />
      <LogoutModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

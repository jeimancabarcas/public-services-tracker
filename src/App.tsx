import React, { useState } from 'react';
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

  // If showing auth view or if not logged in and not guest
  const isAnonymous = firebaseUser?.isAnonymous ?? true;
  const shouldShowAuth = showAuthScreen || (!isGuest && isAnonymous && !firebaseUser);

  if (shouldShowAuth && !isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] antialiased">
        <AuthView />
        <ToastContainer />
      </div>
    );
  }

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

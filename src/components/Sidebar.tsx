import React from 'react';
import { 
  LayoutDashboard, 
  FileEdit, 
  History, 
  Settings, 
  HelpCircle, 
  LogOut,
  Zap,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, setMobileOpen }) => {
  const { activeTab, setActiveTab, setIsHelpModalOpen, setIsLogoutModalOpen } = useApp();

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'registro',
      label: 'Registro de Lectura',
      icon: <FileEdit className="w-5 h-5" />,
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: <History className="w-5 h-5" />,
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#f2f4f6] border-r border-[#c6c6cd]/50 flex flex-col p-4 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006a61] to-[#131b2e] flex items-center justify-center text-white shadow-sm overflow-hidden p-0.5">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFjaUxg2jdExGEa9i64TDYFy2wPo1YnvNBatusr0msDy74Qkow18L1_Jbgu1AoxACfgJW_ug_xTr0SfMlc35gJQyh8FkYKTVP7T4Ofj8oPwHQbYwjbigQ6qDxv44VbUhXLcDM-8k_Sp8tEEzkSH-GvV1MviMoKl8jU6InFRBQImBTQoQGgpnypPOB0qDlcG95sYtg8MpDOUTUVCaWxIl4Mgv7A8ohA-SW5eN5fJKLymkIMW1OoOQDOJQ" 
                alt="HogarMedido" 
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <Zap className="w-5 h-5 text-[#86f2e4]" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#191c1e] tracking-tight leading-none">
                HogarMedido
              </h1>
              <p className="text-xs text-[#45464d] mt-1 font-medium">Utility Tracking</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button 
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="p-1 rounded-lg text-[#45464d] hover:bg-[#e6e8ea] lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col gap-1.5 mt-4">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#86f2e4] text-[#006f66] font-bold shadow-xs'
                    : 'text-[#45464d] hover:bg-[#e6e8ea] hover:text-[#191c1e]'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-[#006f66]' : 'text-[#45464d]'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="flex flex-col gap-1.5 border-t border-[#c6c6cd]/50 pt-4 mt-auto">
          <button
            onClick={() => {
              setIsHelpModalOpen(true);
              if (setMobileOpen) setMobileOpen(false);
            }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-[#45464d] hover:bg-[#e6e8ea] hover:text-[#191c1e] transition-colors text-left"
          >
            <HelpCircle className="w-5 h-5 shrink-0 text-[#45464d]" />
            <span className="font-medium">Ayuda</span>
          </button>

          <button
            onClick={() => {
              setIsLogoutModalOpen(true);
              if (setMobileOpen) setMobileOpen(false);
            }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-[#ba1a1a] hover:bg-[#ffdad6]/60 transition-colors text-left"
          >
            <LogOut className="w-5 h-5 shrink-0 text-[#ba1a1a]" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

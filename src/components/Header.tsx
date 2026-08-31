import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Bell, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  X,
  User,
  Settings,
  ChevronRight,
  Cloud,
  CloudOff,
  RefreshCw,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsNewEntryModalOpen, 
    profile, 
    readings, 
    reminders,
    cloudStatus,
    firebaseUser,
    isGuest,
    setShowAuthScreen,
    setIsLogoutModalOpen
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isUserAuthenticated = firebaseUser && !firebaseUser.isAnonymous;

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Resumen';
      case 'registro':
        return 'Registro de Lectura';
      case 'historial':
        return 'Historial';
      case 'configuracion':
        return 'Configuración';
      case 'ayuda':
        return 'Ayuda & Guía';
      default:
        return 'HogarMedido';
    }
  };

  // Generate alerts / notifications based on current data
  const highConsumptionAlerts = readings.filter(r => r.status === 'alto').slice(0, 2);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 z-30 flex justify-between items-center px-4 md:px-8 py-3.5 bg-white border-b border-[#c6c6cd]/30 shadow-xs h-16 transition-all">
      {/* Mobile Title & Menu button */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-[#45464d] hover:bg-[#eceef0] rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-lg text-[#191c1e] tracking-tight">HogarMedido</span>
      </div>

      {/* Desktop Title */}
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold text-[#191c1e] tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Firebase Cloud Sync Badge */}
        <div 
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#f2f4f6] text-[#45464d] border border-[#c6c6cd]/30"
          title={cloudStatus === 'connected' ? 'Sincronizado con Firebase Firestore (home-tracker-a786f)' : cloudStatus === 'syncing' ? 'Sincronizando con Firebase...' : 'Modo local activo'}
        >
          {cloudStatus === 'connected' ? (
            <>
              <Cloud className="w-3.5 h-3.5 text-[#006a61]" />
              <span className="text-[11px] font-semibold text-[#006a61]">Firebase Cloud</span>
            </>
          ) : cloudStatus === 'syncing' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-[#b97500] animate-spin" />
              <span className="text-[11px] text-[#b97500]">Sincronizando...</span>
            </>
          ) : (
            <>
              <CloudOff className="w-3.5 h-3.5 text-[#76777d]" />
              <span className="text-[11px] text-[#76777d]">Local</span>
            </>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-[#45464d] hover:bg-[#eceef0] hover:text-[#191c1e] rounded-full transition-colors relative"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {highConsumptionAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#c6c6cd]/40 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-[#eceef0]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#006a61]" />
                  <span className="font-semibold text-sm text-[#191c1e]">Notificaciones & Alertas</span>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[#76777d] hover:text-[#191c1e] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#f2f4f6]">
                {highConsumptionAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 hover:bg-[#f7f9fb] transition-colors flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ffdad6] flex items-center justify-center shrink-0 text-[#ba1a1a]">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-[#191c1e]">
                        Consumo Alto en {alert.service.toUpperCase()}
                      </p>
                      <p className="text-[#45464d] mt-0.5">
                        {alert.consumption} {alert.unit} registrados el {alert.date}. Superó el umbral sugerido.
                      </p>
                    </div>
                  </div>
                ))}

                {reminders.pushNotifications && (
                  <div className="p-3 hover:bg-[#f7f9fb] transition-colors flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#86f2e4]/30 flex items-center justify-center shrink-0 text-[#006f66]">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-[#191c1e]">Recordatorio Programado</p>
                      <p className="text-[#45464d] mt-0.5">
                        Toma de lectura mensual programada para el día {reminders.readingReminderDay} de cada mes.
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-3 hover:bg-[#f7f9fb] transition-colors flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#dae2fd] flex items-center justify-center shrink-0 text-[#006a61]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-[#191c1e]">Sistema Sincronizado</p>
                    <p className="text-[#45464d] mt-0.5">
                      Tus medidores de Luz, Agua y Gas están calculando tarifas vigentes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 pt-2 border-t border-[#eceef0] text-center">
                <button 
                  onClick={() => {
                    setActiveTab('configuracion');
                    setNotificationsOpen(false);
                  }}
                  className="text-xs text-[#006a61] hover:underline font-medium"
                >
                  Configurar recordatorios
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Button: New Entry */}
        <button
          onClick={() => {
            if (activeTab === 'registro') {
              // already on page, focus form
            } else {
              setIsNewEntryModalOpen(true);
            }
          }}
          className="flex items-center gap-1.5 bg-[#006a61] text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-[#005049] transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Entry</span>
          <span className="sm:hidden">Nuevo</span>
        </button>

        {/* Profile Avatar Popover */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#86f2e4] transition-all focus:outline-none"
            aria-label="Perfil de usuario"
          >
            <img
              src={firebaseUser?.photoURL || profile.avatarUrl}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-[#c6c6cd] shadow-xs"
              onError={(e) => {
                // Fallback avatar if external URL fails
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
              }}
            />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#c6c6cd]/40 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-[#eceef0]">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-[#191c1e] truncate">{profile.name}</p>
                  <span className="text-[10px] bg-[#e8f5e9] text-[#166534] px-1.5 py-0.5 rounded font-semibold border border-[#a7f3d0]">
                    Firebase Sync
                  </span>
                </div>
                <p className="text-xs text-[#76777d] truncate">{firebaseUser?.email || profile.email}</p>
                <p className="text-xs text-[#006a61] mt-0.5 font-medium truncate">{profile.location} • Estrato {profile.estrato}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab('configuracion');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#45464d] hover:bg-[#f7f9fb] hover:text-[#191c1e]"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="w-4 h-4 text-[#76777d]" />
                    <span>Configuración</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#c6c6cd]" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('registro');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-[#45464d] hover:bg-[#f7f9fb] hover:text-[#191c1e]"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#76777d]" />
                    <span>Registrar Medición</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#c6c6cd]" />
                </button>

                <div className="my-1 border-t border-[#eceef0]" />

                {isUserAuthenticated ? (
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#ba1a1a] hover:bg-[#ffdad6]/40"
                  >
                    <LogOut className="w-4 h-4 text-[#ba1a1a]" />
                    <span className="font-medium">Cerrar Sesión</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setShowAuthScreen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#006a61] hover:bg-[#86f2e4]/20 font-semibold"
                  >
                    <LogIn className="w-4 h-4 text-[#006a61]" />
                    <span>Iniciar Sesión / Registrarse</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

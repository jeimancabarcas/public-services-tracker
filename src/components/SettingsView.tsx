import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Zap, 
  Droplet, 
  Flame, 
  Camera, 
  Save, 
  RotateCcw,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceType } from '../types';

export const SettingsView: React.FC = () => {
  const { 
    profile, 
    updateProfile, 
    reminders, 
    updateReminders, 
    services, 
    updateServiceConfig,
    resetToSampleData 
  } = useApp();

  // Local state for profile form
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [location, setLocation] = useState(profile.location);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);

  // Local state for reminders
  const [pushNotif, setPushNotif] = useState(reminders.pushNotifications);
  const [emailDigest, setEmailDigest] = useState(reminders.emailDigest);
  const [reminderDay, setReminderDay] = useState(reminders.readingReminderDay);

  // Local state for services
  const [luzEnabled, setLuzEnabled] = useState(services.luz?.enabled ?? true);
  const [luzUnit, setLuzUnit] = useState(services.luz?.unit || 'kWh');
  const [luzPrice, setLuzPrice] = useState(services.luz?.defaultUnitPrice || 0.15);

  const [aguaEnabled, setAguaEnabled] = useState(services.agua?.enabled ?? true);
  const [aguaUnit, setAguaUnit] = useState(services.agua?.unit || 'm³');
  const [aguaPrice, setAguaPrice] = useState(services.agua?.defaultUnitPrice || 1.50);

  const [gasEnabled, setGasEnabled] = useState(services.gas?.enabled ?? false);
  const [gasUnit, setGasUnit] = useState(services.gas?.unit || 'Lts');
  const [gasPrice, setGasPrice] = useState(services.gas?.defaultUnitPrice || 0.80);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      location,
      avatarUrl,
    });
  };

  const handleTogglePush = () => {
    const next = !pushNotif;
    setPushNotif(next);
    updateReminders({
      pushNotifications: next,
      emailDigest,
      readingReminderDay: reminderDay,
    });
  };

  const handleToggleEmail = () => {
    const next = !emailDigest;
    setEmailDigest(next);
    updateReminders({
      pushNotifications: pushNotif,
      emailDigest: next,
      readingReminderDay: reminderDay,
    });
  };

  const handleServiceToggle = (svc: ServiceType, enabled: boolean) => {
    if (svc === 'luz') {
      setLuzEnabled(enabled);
      updateServiceConfig('luz', { enabled });
    } else if (svc === 'agua') {
      setAguaEnabled(enabled);
      updateServiceConfig('agua', { enabled });
    } else if (svc === 'gas') {
      setGasEnabled(enabled);
      updateServiceConfig('gas', { enabled });
    }
  };

  const handleUnitBlur = (svc: ServiceType, unitVal: string, priceVal: number) => {
    updateServiceConfig(svc, { unit: unitVal, defaultUnitPrice: priceVal });
  };

  const presetAvatars = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC6KxCqeba0FAV57wxxlyFVD44J1nTLNgt_0oKZce8yk_pFr7pt3T1kma87Kv9eocoJuWr78owlDBhiX6bgDz43OViH6Tjcc4XT1W12sQ6xPYc2s2VoVxSjuxhpcA25J3wZHBTkQYxKcqvyqXNEDO9bqj3mHrctppQaNUO45aZsttXpgAol5jcCRTSkt7CAHr_j_zWthwkr5Bfg1paKo-8kiDhCKDAEpaw35uW2Tp8E11X-nqWZa63VXA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAjzD6rN5fOrZLKB4PzeFZ1l8MGLtx55f18plyTk0CE713mMPquA_YtAYtGR57SkRS4dLw1kK_mN3oXp80TTPBpQcMKnXWSkk0OWlFR6skbEFuNqmX4bvk1BifJMeMbmrEpVBs-16oGciT6zngyG3zLVSMOy3l7qmFsbSpdsbhQuQzUlWFY1c9HoL0tvkP2Ow4Vc_oE5se1qWMnYktxf5OMoynb0WLU4nPhLPpR0I2RhFzwuF2qf2olcA',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight">
          Configuración
        </h1>
        <p className="text-sm text-[#45464d] mt-0.5">
          Administra tu perfil, preferencias de recordatorios y servicios medidos.
        </p>
      </div>

      {/* Top Grid: Profile & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Settings (8 cols) */}
        <section className="lg:col-span-8 bg-white rounded-xl shadow-sm p-6 border border-[#c6c6cd]/30 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#191c1e] mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#006a61]" />
              <span>Perfil Personal</span>
            </h2>

            <form onSubmit={handleSaveProfile} id="profile-form">
              <div className="flex flex-col sm:flex-row gap-6 mb-6 items-start">
                {/* Avatar with hover change */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="relative group cursor-pointer">
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-[#f2f4f6] shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = presetAvatars[0];
                      }}
                    />
                    <div 
                      onClick={() => {
                        const nextIdx = (presetAvatars.indexOf(avatarUrl) + 1) % presetAvatars.length;
                        setAvatarUrl(presetAvatars[nextIdx]);
                      }}
                      className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      title="Cambiar foto de perfil"
                    >
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] font-semibold mt-1">Cambiar</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#76777d]">Click para cambiar</span>
                </div>

                {/* Form fields */}
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#45464d]">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="rounded-lg border border-[#c6c6cd] bg-white px-3.5 py-2.5 text-sm text-[#191c1e] font-medium focus:border-[#006a61] focus:ring-2 focus:ring-[#86f2e4]/30 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#45464d]">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-lg border border-[#c6c6cd] bg-white px-3.5 py-2.5 text-sm text-[#191c1e] font-medium focus:border-[#006a61] focus:ring-2 focus:ring-[#86f2e4]/30 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[#45464d]">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="rounded-lg border border-[#c6c6cd] bg-white px-3.5 py-2.5 text-sm text-[#191c1e] font-medium focus:border-[#006a61] focus:ring-2 focus:ring-[#86f2e4]/30 transition-all"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="flex justify-end border-t border-[#c6c6cd]/30 pt-4 mt-2">
            <button
              type="submit"
              form="profile-form"
              className="bg-[#006a61] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#005049] transition-all shadow-xs flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </section>

        {/* Notifications & Reminders (4 cols) */}
        <section className="lg:col-span-4 bg-white rounded-xl shadow-sm p-6 border border-[#c6c6cd]/30 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#191c1e] mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#006a61]" />
              <span>Recordatorios</span>
            </h2>
            <p className="text-xs text-[#45464d] mb-6">
              Configura recordatorios mensuales para tomar las lecturas a tiempo.
            </p>

            <div className="space-y-4">
              {/* Push Notif */}
              <div className="flex items-center justify-between py-2.5 border-b border-[#eceef0]">
                <div>
                  <h3 className="text-sm font-semibold text-[#191c1e]">
                    Notificaciones Push
                  </h3>
                  <p className="text-xs text-[#76777d]">Recibir alertas en el dispositivo</p>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePush}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    pushNotif ? 'bg-[#006a61]' : 'bg-[#e0e3e5]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      pushNotif ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Email Digest */}
              <div className="flex items-center justify-between py-2.5 border-b border-[#eceef0]">
                <div>
                  <h3 className="text-sm font-semibold text-[#191c1e]">
                    Correos Electrónicos
                  </h3>
                  <p className="text-xs text-[#76777d]">Resumen mensual y alertas</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleEmail}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    emailDigest ? 'bg-[#006a61]' : 'bg-[#e0e3e5]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      emailDigest ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Reminder day */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-sm font-semibold text-[#191c1e]">
                    Día de toma de lectura
                  </h3>
                  <p className="text-xs text-[#76777d]">Día del mes para la alerta</p>
                </div>
                <select
                  value={reminderDay}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setReminderDay(val);
                    updateReminders({
                      pushNotifications: pushNotif,
                      emailDigest,
                      readingReminderDay: val,
                    });
                  }}
                  className="bg-white border border-[#c6c6cd] rounded-lg px-2.5 py-1 text-sm font-semibold text-[#191c1e] focus:outline-none focus:border-[#006a61]"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Día {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-[#eceef0] text-right">
            <span className="text-[11px] text-[#006a61] font-medium flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sincronizado automáticamente
            </span>
          </div>
        </section>
      </div>

      {/* Services Management Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#191c1e] tracking-tight">
            Gestión de Servicios
          </h2>
          <span className="text-xs text-[#76777d]">
            Activa o desactiva los medidores y personaliza sus unidades
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Luz Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-[#F59E0B] border-x border-b border-[#c6c6cd]/30 hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#FEF3C7] rounded-lg text-[#F59E0B]">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#191c1e]">Luz</h3>
              </div>

              <button
                type="button"
                onClick={() => handleServiceToggle('luz', !luzEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  luzEnabled ? 'bg-[#006a61]' : 'bg-[#e0e3e5]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    luzEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className={`space-y-3 transition-opacity ${luzEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#45464d]">
                  Unidad de Medida
                </label>
                <input
                  type="text"
                  value={luzUnit}
                  onChange={(e) => setLuzUnit(e.target.value)}
                  onBlur={() => handleUnitBlur('luz', luzUnit, luzPrice)}
                  className="rounded-lg border border-[#c6c6cd] bg-white px-3 py-1.5 text-sm text-[#191c1e] font-semibold max-w-[120px] focus:border-[#006a61] focus:ring-1 focus:ring-[#006a61]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#45464d]">
                  Tarifa base ($ / {luzUnit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={luzPrice}
                  onChange={(e) => setLuzPrice(parseFloat(e.target.value) || 0)}
                  onBlur={() => handleUnitBlur('luz', luzUnit, luzPrice)}
                  className="rounded-lg border border-[#c6c6cd] bg-white px-3 py-1.5 text-sm text-[#191c1e] font-semibold max-w-[120px] focus:border-[#006a61] focus:ring-1 focus:ring-[#006a61]"
                />
              </div>
            </div>
          </div>

          {/* Agua Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-[#3B82F6] border-x border-b border-[#c6c6cd]/30 hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#DBEAFE] rounded-lg text-[#3B82F6]">
                  <Droplet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#191c1e]">Agua</h3>
              </div>

              <button
                type="button"
                onClick={() => handleServiceToggle('agua', !aguaEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  aguaEnabled ? 'bg-[#006a61]' : 'bg-[#e0e3e5]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    aguaEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className={`space-y-3 transition-opacity ${aguaEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#45464d]">
                  Unidad de Medida
                </label>
                <input
                  type="text"
                  value={aguaUnit}
                  onChange={(e) => setAguaUnit(e.target.value)}
                  onBlur={() => handleUnitBlur('agua', aguaUnit, aguaPrice)}
                  className="rounded-lg border border-[#c6c6cd] bg-white px-3 py-1.5 text-sm text-[#191c1e] font-semibold max-w-[120px] focus:border-[#006a61] focus:ring-1 focus:ring-[#006a61]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#45464d]">
                  Tarifa base ($ / {aguaUnit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={aguaPrice}
                  onChange={(e) => setAguaPrice(parseFloat(e.target.value) || 0)}
                  onBlur={() => handleUnitBlur('agua', aguaUnit, aguaPrice)}
                  className="rounded-lg border border-[#c6c6cd] bg-white px-3 py-1.5 text-sm text-[#191c1e] font-semibold max-w-[120px] focus:border-[#006a61] focus:ring-1 focus:ring-[#006a61]"
                />
              </div>
            </div>
          </div>

          {/* Gas Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-[#EF4444] border-x border-b border-[#c6c6cd]/30 hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#FEE2E2] rounded-lg text-[#EF4444]">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#191c1e]">Gas</h3>
              </div>

              <button
                type="button"
                onClick={() => handleServiceToggle('gas', !gasEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  gasEnabled ? 'bg-[#006a61]' : 'bg-[#e0e3e5]'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    gasEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className={`space-y-3 transition-opacity ${gasEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#45464d]">
                  Unidad de Medida
                </label>
                <input
                  type="text"
                  value={gasUnit}
                  onChange={(e) => setGasUnit(e.target.value)}
                  onBlur={() => handleUnitBlur('gas', gasUnit, gasPrice)}
                  disabled={!gasEnabled}
                  className="rounded-lg border border-[#c6c6cd] bg-white px-3 py-1.5 text-sm text-[#191c1e] font-semibold max-w-[120px] focus:border-[#006a61] focus:ring-1 focus:ring-[#006a61]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#45464d]">
                  Tarifa base ($ / {gasUnit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(parseFloat(e.target.value) || 0)}
                  onBlur={() => handleUnitBlur('gas', gasUnit, gasPrice)}
                  disabled={!gasEnabled}
                  className="rounded-lg border border-[#c6c6cd] bg-white px-3 py-1.5 text-sm text-[#191c1e] font-semibold max-w-[120px] focus:border-[#006a61] focus:ring-1 focus:ring-[#006a61]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced / Maintenance Section */}
      <section className="bg-[#f2f4f6] rounded-xl p-6 border border-[#c6c6cd]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-[#191c1e]">
            Restablecer Datos de Demostración
          </h3>
          <p className="text-xs text-[#45464d] mt-0.5">
            Restaura las 24 lecturas históricas de muestra y restablece la configuración original.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('¿Deseas restaurar los datos de muestra iniciales?')) {
              resetToSampleData();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#c6c6cd] rounded-lg text-xs font-semibold text-[#191c1e] hover:bg-[#e6e8ea] transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#006a61]" />
          <span>Restaurar Datos</span>
        </button>
      </section>
    </div>
  );
};

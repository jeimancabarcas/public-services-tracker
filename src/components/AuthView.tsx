import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Flame, 
  Droplets,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthView: React.FC = () => {
  const { 
    loginWithGoogle,
    loginWithFacebook,
    loginAsGuest, 
    authError, 
    clearAuthError,
    showToast,
    profile
  } = useApp();

  const [estrato, setEstrato] = useState<number>(profile.estrato || 3);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | 'guest' | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    setLoadingProvider('google');
    try {
      await loginWithGoogle(estrato);
      showToast('¡Bienvenido! Sesión iniciada con Google.', 'success');
    } catch (err: any) {
      console.error('Google login error:', err);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleFacebookSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    setLoadingProvider('facebook');
    try {
      await loginWithFacebook(estrato);
      showToast('¡Bienvenido! Sesión iniciada con Facebook.', 'success');
    } catch (err: any) {
      console.error('Facebook login error:', err);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGuestLogin = async () => {
    setLocalError(null);
    clearAuthError();
    setLoadingProvider('guest');
    try {
      await loginAsGuest();
      showToast('Modo demostración activado.', 'info');
    } catch (err) {
      console.error('Guest mode error:', err);
    } finally {
      setLoadingProvider(null);
    }
  };

  const currentError = localError || authError;

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        {/* Brand Icon & Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#006a61] to-[#131b2e] text-white shadow-md mb-3">
          <Zap className="w-8 h-8 text-[#86f2e4]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] tracking-tight">
          HogarMedido
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#45464d] font-medium max-w-xs mx-auto">
          Monitoreo de servicios públicos, cálculo de consumo y subsidios de energía
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-sm border border-[#c6c6cd]/50">
          
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-[#191c1e]">
              Iniciar Sesión o Registrarse
            </h2>
            <p className="text-xs text-[#76777d] mt-1">
              Ingresa con tu cuenta de Google o Facebook para sincronizar tus lecturas en la nube.
            </p>
          </div>

          {/* Estrato Socioeconómico Selector */}
          <div className="mb-6 bg-[#f2f4f6]/70 p-3.5 rounded-xl border border-[#eceef0]">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-[#191c1e]">
                Estrato Residencial de tu Hogar
              </label>
              <span className="text-[11px] font-bold text-[#006a61] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Subsidio CREG</span>
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const isSelected = estrato === num;
                const hasSubsidy = num <= 3;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setEstrato(num)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center border cursor-pointer ${
                      isSelected
                        ? 'bg-[#006a61] text-white border-[#006a61] shadow-xs'
                        : 'bg-white text-[#45464d] border-[#c6c6cd] hover:border-[#006a61]'
                    }`}
                  >
                    <span>{num}</span>
                    {hasSubsidy && (
                      <span className={`text-[9px] ${isSelected ? 'text-[#86f2e4]' : 'text-[#006a61]'}`}>
                        -15%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-[#45464d]">
              {estrato <= 3 ? (
                <span className="text-[#15803d] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  Estrato {estrato}: Aplicarás <strong>15% de subsidio</strong> en consumo de energía.
                </span>
              ) : (
                <span className="text-[#76777d]">
                  Estrato {estrato}: Tarifa plena sin subsidio de subsistencia.
                </span>
              )}
            </p>
          </div>

          {/* Error Banner */}
          {currentError && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#ffdad6]/60 border border-[#ffb4ab] flex items-start gap-2.5 text-xs text-[#ba1a1a] animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-tight font-medium">{currentError}</div>
            </div>
          )}

          {/* Exclusive Social Auth Buttons */}
          <div className="space-y-3">
            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#c6c6cd] bg-white hover:bg-[#f8f9fa] text-[#1f1f1f] text-sm font-semibold shadow-xs transition-all hover:shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loadingProvider === 'google' ? (
                <div className="w-5 h-5 border-2 border-[#006a61] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continuar con Google</span>
            </button>

            {/* Facebook Sign-in Button */}
            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={loadingProvider !== null}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm font-semibold shadow-xs transition-all hover:shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loadingProvider === 'facebook' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              <span>Continuar con Facebook</span>
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#76777d]">
            <Lock className="w-3.5 h-3.5 text-[#006a61]" />
            <span>Autenticación oficial y segura con Firebase Auth</span>
          </div>

          {/* Quick Demo / Guest Access Button */}
          <div className="mt-6 pt-5 border-t border-[#eceef0] text-center">
            <p className="text-xs text-[#76777d] mb-2.5">
              ¿Deseas explorar la plataforma antes de registrarte?
            </p>
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={loadingProvider !== null}
              className="w-full py-2.5 px-4 rounded-xl bg-[#f2f4f6] hover:bg-[#e6e8ea] text-[#191c1e] font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-[#c6c6cd]/50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#006a61]" />
              <span>Ingresar en Modo Invitado / Demo</span>
            </button>
          </div>

        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-[11px] text-[#45464d]">
          <div className="p-2.5 bg-white/60 rounded-xl border border-[#c6c6cd]/30 flex flex-col items-center gap-1">
            <Zap className="w-4 h-4 text-[#eab308]" />
            <span className="font-semibold text-[#191c1e]">Luz & Subsidio</span>
            <span className="text-[10px] text-[#76777d]">15% automático</span>
          </div>
          <div className="p-2.5 bg-white/60 rounded-xl border border-[#c6c6cd]/30 flex flex-col items-center gap-1">
            <Droplets className="w-4 h-4 text-[#3b82f6]" />
            <span className="font-semibold text-[#191c1e]">Agua Potable</span>
            <span className="text-[10px] text-[#76777d]">Métrico m³</span>
          </div>
          <div className="p-2.5 bg-white/60 rounded-xl border border-[#c6c6cd]/30 flex flex-col items-center gap-1">
            <Flame className="w-4 h-4 text-[#ef4444]" />
            <span className="font-semibold text-[#191c1e]">Gas Natural</span>
            <span className="text-[10px] text-[#76777d]">Historial & Alertas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { LogOut, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LogoutModal: React.FC = () => {
  const { isLogoutModalOpen, setIsLogoutModalOpen, logoutUser } = useApp();

  if (!isLogoutModalOpen) return null;

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logoutUser();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-[#c6c6cd]/40 p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-[#191c1e] mb-1">¿Cerrar Sesión?</h3>
        <p className="text-xs text-[#45464d] mb-6">
          Tus datos permanecen guardados localmente en tu navegador de forma segura.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="flex-1 px-4 py-2.5 border border-[#c6c6cd] rounded-lg text-xs font-semibold text-[#45464d] hover:bg-[#f2f4f6] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmLogout}
            className="flex-1 px-4 py-2.5 bg-[#ba1a1a] text-white rounded-lg text-xs font-semibold hover:bg-[#93000a] transition-colors shadow-xs"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

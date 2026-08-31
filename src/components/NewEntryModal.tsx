import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NewEntryView } from './NewEntryView';

export const NewEntryModal: React.FC = () => {
  const { isNewEntryModalOpen, setIsNewEntryModalOpen } = useApp();

  if (!isNewEntryModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#f7f9fb] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#c6c6cd]/40 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#eceef0]">
          <div>
            <h2 className="text-lg font-bold text-[#191c1e]">Nuevo Registro de Lectura</h2>
            <p className="text-xs text-[#76777d]">Ingresa los datos para calcular el consumo</p>
          </div>
          <button
            onClick={() => setIsNewEntryModalOpen(false)}
            className="p-1.5 rounded-lg text-[#76777d] hover:text-[#191c1e] hover:bg-[#f2f4f6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <NewEntryView 
            isModal={true} 
            onSuccess={() => setIsNewEntryModalOpen(false)}
            onCancel={() => setIsNewEntryModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Zap, 
  Droplet, 
  Flame, 
  Lightbulb, 
  Info,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HelpModal: React.FC = () => {
  const { isHelpModalOpen, setIsHelpModalOpen } = useApp();
  const [activeAccordion, setActiveAccordion] = useState<string>('luz');

  if (!isHelpModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#c6c6cd]/40 overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-[#f7f9fb] border-b border-[#eceef0]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#86f2e4]/30 text-[#006f66] rounded-xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#191c1e]">Guía de Uso y Ahorro en el Hogar</h2>
              <p className="text-xs text-[#76777d]">Aprende a tomar lecturas y optimizar tus consumos</p>
            </div>
          </div>
          <button
            onClick={() => setIsHelpModalOpen(false)}
            className="p-1.5 rounded-lg text-[#76777d] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#191c1e]">
          {/* Section: Cómo leer medidores */}
          <div>
            <h3 className="font-bold text-base text-[#191c1e] mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#006a61]" />
              <span>¿Cómo leer tu medidor?</span>
            </h3>

            <div className="space-y-3">
              {/* Luz */}
              <div className="border border-[#eceef0] rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'luz' ? '' : 'luz')}
                  className="w-full flex items-center justify-between p-4 bg-[#f7f9fb] hover:bg-[#f2f4f6] text-left font-semibold"
                >
                  <div className="flex items-center gap-2 text-[#F59E0B]">
                    <Zap className="w-4 h-4" />
                    <span className="text-[#191c1e]">Medidor de Luz (Electricidad - kWh)</span>
                  </div>
                  {activeAccordion === 'luz' ? <ChevronUp className="w-4 h-4 text-[#76777d]" /> : <ChevronDown className="w-4 h-4 text-[#76777d]" />}
                </button>
                {activeAccordion === 'luz' && (
                  <div className="p-4 space-y-2 bg-white text-xs text-[#45464d] border-t border-[#eceef0]">
                    <p>• <strong>Medidor digital:</strong> Anota los dígitos numéricos en la pantalla LCD antes del símbolo "kWh".</p>
                    <p>• <strong>Medidor electromecánico (relojes):</strong> Lee las manecillas de izquierda a derecha. Si la manecilla está entre dos números, anota el número menor.</p>
                    <p>• <strong>Consumo del periodo:</strong> Es simplemente la resta de la lectura actual menos la lectura anterior.</p>
                  </div>
                )}
              </div>

              {/* Agua */}
              <div className="border border-[#eceef0] rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'agua' ? '' : 'agua')}
                  className="w-full flex items-center justify-between p-4 bg-[#f7f9fb] hover:bg-[#f2f4f6] text-left font-semibold"
                >
                  <div className="flex items-center gap-2 text-[#3B82F6]">
                    <Droplet className="w-4 h-4" />
                    <span className="text-[#191c1e]">Medidor de Agua (m³)</span>
                  </div>
                  {activeAccordion === 'agua' ? <ChevronUp className="w-4 h-4 text-[#76777d]" /> : <ChevronDown className="w-4 h-4 text-[#76777d]" />}
                </button>
                {activeAccordion === 'agua' && (
                  <div className="p-4 space-y-2 bg-white text-xs text-[#45464d] border-t border-[#eceef0]">
                    <p>• Los números con fondo <strong>negro</strong> representan metros cúbicos (1 m³ = 1,000 litros). Son los que se cobran en la factura.</p>
                    <p>• Los números con fondo <strong>rojo</strong> o manecillas pequeñas representan fracciones de litro.</p>
                  </div>
                )}
              </div>

              {/* Gas */}
              <div className="border border-[#eceef0] rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'gas' ? '' : 'gas')}
                  className="w-full flex items-center justify-between p-4 bg-[#f7f9fb] hover:bg-[#f2f4f6] text-left font-semibold"
                >
                  <div className="flex items-center gap-2 text-[#EF4444]">
                    <Flame className="w-4 h-4" />
                    <span className="text-[#191c1e]">Medidor de Gas Natural / Tanque Estacionario</span>
                  </div>
                  {activeAccordion === 'gas' ? <ChevronUp className="w-4 h-4 text-[#76777d]" /> : <ChevronDown className="w-4 h-4 text-[#76777d]" />}
                </button>
                {activeAccordion === 'gas' && (
                  <div className="p-4 space-y-2 bg-white text-xs text-[#45464d] border-t border-[#eceef0]">
                    <p>• <strong>Gas natural:</strong> Registra los números sobre fondo blanco o la pantalla digital (m³).</p>
                    <p>• <strong>Tanque estacionario:</strong> Lee el porcentaje del reloj del tanque o los litros surtidos por nota.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Consejos de Ahorro */}
          <div>
            <h3 className="font-bold text-base text-[#191c1e] mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
              <span>Consejos Prácticos de Ahorro</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#FEF3C7]/40 rounded-xl border border-[#F59E0B]/30 text-xs">
                <p className="font-bold text-[#92400E] mb-1">Ahorro de Luz</p>
                <p className="text-[#45464d]">Desconecta aparatos en modo espera ("vampiros energéticos") y aprovecha iluminación LED.</p>
              </div>

              <div className="p-3.5 bg-[#DBEAFE]/40 rounded-xl border border-[#3B82F6]/30 text-xs">
                <p className="font-bold text-[#1E40AF] mb-1">Ahorro de Agua</p>
                <p className="text-[#45464d]">Revisa fugas en sanitarios y coloca aireadores en grifos para reducir hasta 40% el caudal.</p>
              </div>

              <div className="p-3.5 bg-[#FEE2E2]/40 rounded-xl border border-[#EF4444]/30 text-xs">
                <p className="font-bold text-[#991B1B] mb-1">Ahorro de Gas</p>
                <p className="text-[#45464d]">Ajusta el termostato del calentador en modo tibio/medio y tapa ollas al cocinar.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f7f9fb] border-t border-[#eceef0] flex justify-end">
          <button
            onClick={() => setIsHelpModalOpen(false)}
            className="px-5 py-2 bg-[#006a61] text-white rounded-lg text-xs font-semibold hover:bg-[#005049] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

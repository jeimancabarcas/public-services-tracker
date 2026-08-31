import React from 'react';
import { 
  X, 
  Zap, 
  Droplet, 
  Flame, 
  Calendar, 
  FileText, 
  DollarSign, 
  Activity, 
  Edit3, 
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReadingDetailModal: React.FC = () => {
  const { 
    selectedReadingForDetail, 
    setSelectedReadingForDetail, 
    setEditingReading, 
    setActiveTab, 
    deleteReading, 
    services 
  } = useApp();

  if (!selectedReadingForDetail) return null;

  const reading = selectedReadingForDetail;
  const cfg = services[reading.service];

  const getIcon = () => {
    switch (reading.service) {
      case 'luz':
        return <Zap className="w-6 h-6 text-[#F59E0B]" />;
      case 'agua':
        return <Droplet className="w-6 h-6 text-[#3B82F6]" />;
      case 'gas':
        return <Flame className="w-6 h-6 text-[#EF4444]" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getStatusBadge = () => {
    switch (reading.status) {
      case 'alto':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffdad6] text-[#93000a]">Consumo Alto</span>;
      case 'optimo':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#065F46]">Consumo Óptimo</span>;
      case 'moderado':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E]">Consumo Moderado</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#c6c6cd]/40 overflow-hidden">
        {/* Header with service styling */}
        <div className="flex items-center justify-between p-6 bg-[#f7f9fb] border-b border-[#eceef0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-[#c6c6cd]/40">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#191c1e] capitalize">
                  {cfg?.name || reading.service}
                </h3>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-[#76777d] mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Fecha: {reading.date}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedReadingForDetail(null)}
            className="p-1.5 rounded-lg text-[#76777d] hover:text-[#191c1e] hover:bg-[#eceef0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content details */}
        <div className="p-6 space-y-6">
          {/* Main Stat Block */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#f2f4f6] rounded-xl">
              <span className="text-xs font-medium text-[#76777d]">Consumo Neto</span>
              <p className="text-2xl font-extrabold text-[#191c1e] mt-1">
                {reading.consumption.toLocaleString('es-MX')} <span className="text-sm font-medium text-[#45464d]">{reading.unit}</span>
              </p>
            </div>

            <div className="p-4 bg-[#dae2fd]/40 rounded-xl">
              <span className="text-xs font-medium text-[#006a61]">Costo Calculado</span>
              <p className="text-2xl font-extrabold text-[#006a61] mt-1">
                ${reading.totalCost.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Reading Breakdown Table */}
          <div className="border border-[#eceef0] rounded-xl overflow-hidden text-sm">
            <div className="flex justify-between py-2.5 px-4 bg-[#f7f9fb] border-b border-[#eceef0] font-medium text-xs text-[#76777d]">
              <span>Detalle de Mediciones</span>
              <span>Valores</span>
            </div>
            <div className="divide-y divide-[#eceef0]">
              <div className="flex justify-between py-2.5 px-4">
                <span className="text-[#45464d]">Lectura Anterior</span>
                <span className="font-semibold text-[#191c1e]">{reading.prevReading.toLocaleString('es-MX')} {reading.unit}</span>
              </div>
              <div className="flex justify-between py-2.5 px-4">
                <span className="text-[#45464d]">Lectura Actual</span>
                <span className="font-semibold text-[#191c1e]">{reading.currReading.toLocaleString('es-MX')} {reading.unit}</span>
              </div>
              <div className="flex justify-between py-2.5 px-4">
                <span className="text-[#45464d]">Diferencia de Consumo</span>
                <span className="font-bold text-[#006a61]">+{reading.consumption} {reading.unit}</span>
              </div>
              <div className="flex justify-between py-2.5 px-4">
                <span className="text-[#45464d]">Tarifa Unitaria Aplicada</span>
                <span className="font-semibold text-[#191c1e]">${reading.unitPrice.toFixed(3)} / {reading.unit}</span>
              </div>
            </div>
          </div>

          {/* Notes if present */}
          {reading.notes && (
            <div className="p-3 bg-[#f7f9fb] rounded-lg text-xs text-[#45464d] flex items-start gap-2">
              <FileText className="w-4 h-4 text-[#76777d] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#191c1e]">Nota: </span>
                <span>{reading.notes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f7f9fb] border-t border-[#eceef0]">
          <button
            onClick={() => {
              if (window.confirm('¿Seguro que deseas eliminar este registro?')) {
                deleteReading(reading.id);
                setSelectedReadingForDetail(null);
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/70 px-3 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Eliminar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingReading(reading);
                setSelectedReadingForDetail(null);
                setActiveTab('registro');
              }}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#c6c6cd] rounded-lg text-xs font-semibold text-[#191c1e] hover:bg-[#eceef0] transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar</span>
            </button>

            <button
              onClick={() => setSelectedReadingForDetail(null)}
              className="px-4 py-2 bg-[#006a61] text-white rounded-lg text-xs font-semibold hover:bg-[#005049] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

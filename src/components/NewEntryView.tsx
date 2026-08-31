import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Droplet, 
  Flame, 
  Calendar, 
  Save, 
  X, 
  Activity, 
  Info,
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceType, ConsumptionStatus } from '../types';

interface NewEntryViewProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const NewEntryView: React.FC<NewEntryViewProps> = ({ onSuccess, onCancel, isModal = false }) => {
  const { 
    services, 
    addReading, 
    updateReading, 
    editingReading, 
    setEditingReading, 
    getLatestReadingForService,
    setActiveTab 
  } = useApp();

  const [service, setService] = useState<ServiceType>(editingReading?.service || 'luz');
  const [date, setDate] = useState<string>(
    editingReading?.date || new Date().toISOString().split('T')[0]
  );
  const [prevReading, setPrevReading] = useState<string>(
    editingReading ? editingReading.prevReading.toString() : '14500'
  );
  const [currReading, setCurrReading] = useState<string>(
    editingReading ? editingReading.currReading.toString() : '14750'
  );
  const [unitPrice, setUnitPrice] = useState<string>(
    editingReading ? editingReading.unitPrice.toString() : '0.15'
  );
  const [notes, setNotes] = useState<string>(editingReading?.notes || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-populate when switching services if not in edit mode
  const handleServiceChange = (newService: ServiceType) => {
    setService(newService);
    if (!editingReading) {
      const cfg = services[newService];
      if (cfg) {
        setUnitPrice(cfg.defaultUnitPrice.toString());
      }
      const last = getLatestReadingForService(newService);
      if (last) {
        setPrevReading(last.currReading.toString());
        // Suggest a plausible current reading based on previous consumption
        const plausible = last.currReading + (last.consumption > 0 ? last.consumption : 10);
        setCurrReading(plausible.toString());
      } else {
        if (newService === 'luz') {
          setPrevReading('14500');
          setCurrReading('14750');
        } else if (newService === 'agua') {
          setPrevReading('452');
          setCurrReading('460');
        } else {
          setPrevReading('890');
          setCurrReading('912');
        }
      }
    }
  };

  const prevNum = parseFloat(prevReading) || 0;
  const currNum = parseFloat(currReading) || 0;
  const priceNum = parseFloat(unitPrice) || 0;

  // Real-time Calculations
  const calculatedConsumption = Math.max(0, currNum - prevNum);
  const calculatedCost = Number((calculatedConsumption * priceNum).toFixed(2));

  // Determine status & gauge
  const currentConfig = services[service] || services.luz;
  const unit = currentConfig?.unit || 'kWh';

  const getCalculatedStatus = (cons: number): { status: ConsumptionStatus; label: string; progressPct: number; colorClass: string } => {
    const optimoMax = currentConfig.thresholds.optimoMax;
    const moderadoMax = currentConfig.thresholds.moderadoMax;

    if (cons <= optimoMax) {
      const pct = Math.min(100, (cons / optimoMax) * 40);
      return { status: 'optimo', label: 'Óptimo', progressPct: Math.max(10, pct), colorClass: 'bg-[#10b981]' };
    } else if (cons <= moderadoMax) {
      const pct = 40 + ((cons - optimoMax) / (moderadoMax - optimoMax)) * 35;
      return { status: 'moderado', label: 'Moderado', progressPct: pct, colorClass: 'bg-[#f59e0b]' };
    } else {
      const pct = Math.min(100, 75 + ((cons - moderadoMax) / moderadoMax) * 25);
      return { status: 'alto', label: 'Alto', progressPct: pct, colorClass: 'bg-[#ef4444]' };
    }
  };

  const statusInfo = getCalculatedStatus(calculatedConsumption);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (currNum < prevNum) {
      setErrorMessage('La lectura actual no puede ser menor a la lectura anterior.');
      return;
    }

    if (currNum === 0 && prevNum === 0) {
      setErrorMessage('Por favor ingresa valores de lectura válidos.');
      return;
    }

    if (editingReading) {
      updateReading(editingReading.id, {
        service,
        date,
        prevReading: prevNum,
        currReading: currNum,
        unitPrice: priceNum,
        unit,
        notes,
      });
      setEditingReading(null);
    } else {
      addReading({
        service,
        date,
        prevReading: prevNum,
        currReading: currNum,
        unit,
        unitPrice: priceNum,
        totalCost: calculatedCost,
        notes,
      });
    }

    if (onSuccess) {
      onSuccess();
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleCancel = () => {
    if (editingReading) {
      setEditingReading(null);
    }
    if (onCancel) {
      onCancel();
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <div className={`max-w-7xl mx-auto w-full ${isModal ? '' : 'pb-12'}`}>
      {/* Header if not in modal */}
      {!isModal && (
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-[#191c1e] tracking-tight mb-1">
            {editingReading ? 'Editar Registro' : 'Nuevo Registro'}
          </h2>
          <p className="text-sm text-[#45464d]">
            Ingresa los datos actuales del medidor para calcular tu consumo.
          </p>
        </header>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-[#ffdad6] text-[#93000a] rounded-xl text-sm font-medium flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-[#ffdad6]/80 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Columns: Form Fields */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* 1. Selecciona el Servicio */}
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-[#eceef0]">
            <h3 className="text-base font-bold text-[#191c1e] mb-4">
              1. Selecciona el Servicio
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {/* Luz */}
              <button
                type="button"
                onClick={() => handleServiceChange('luz')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                  service === 'luz'
                    ? 'border-[#006a61] bg-[#86f2e4]/15 shadow-sm'
                    : 'border-[#c6c6cd]/50 hover:bg-[#f7f9fb]'
                }`}
              >
                <div className={`p-2.5 rounded-full mb-2 ${service === 'luz' ? 'bg-[#006a61] text-white' : 'bg-[#f2f4f6] text-[#F59E0B]'}`}>
                  <Zap className="w-6 h-6" />
                </div>
                <span className={`text-sm ${service === 'luz' ? 'text-[#006f66] font-bold' : 'text-[#45464d] font-medium'}`}>
                  Luz
                </span>
              </button>

              {/* Agua */}
              <button
                type="button"
                onClick={() => handleServiceChange('agua')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                  service === 'agua'
                    ? 'border-[#006a61] bg-[#86f2e4]/15 shadow-sm'
                    : 'border-[#c6c6cd]/50 hover:bg-[#f7f9fb]'
                }`}
              >
                <div className={`p-2.5 rounded-full mb-2 ${service === 'agua' ? 'bg-[#006a61] text-white' : 'bg-[#f2f4f6] text-[#3B82F6]'}`}>
                  <Droplet className="w-6 h-6" />
                </div>
                <span className={`text-sm ${service === 'agua' ? 'text-[#006f66] font-bold' : 'text-[#45464d] font-medium'}`}>
                  Agua
                </span>
              </button>

              {/* Gas */}
              <button
                type="button"
                onClick={() => handleServiceChange('gas')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                  service === 'gas'
                    ? 'border-[#006a61] bg-[#86f2e4]/15 shadow-sm'
                    : 'border-[#c6c6cd]/50 hover:bg-[#f7f9fb]'
                }`}
              >
                <div className={`p-2.5 rounded-full mb-2 ${service === 'gas' ? 'bg-[#006a61] text-white' : 'bg-[#f2f4f6] text-[#EF4444]'}`}>
                  <Flame className="w-6 h-6" />
                </div>
                <span className={`text-sm ${service === 'gas' ? 'text-[#006f66] font-bold' : 'text-[#45464d] font-medium'}`}>
                  Gas
                </span>
              </button>
            </div>
          </div>

          {/* 2. Datos de Lectura */}
          <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-[#eceef0] flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#191c1e]">
                2. Datos de Lectura
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#dae2fd] text-[#006a61] rounded-full">
                Unidad: {unit}
              </span>
            </div>

            {/* Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#191c1e]">
                  Fecha de lectura
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#76777d]">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] text-sm focus:border-[#006a61] focus:ring-2 focus:ring-[#86f2e4]/30 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Lectura Anterior & Lectura Actual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#191c1e]">
                    Última lectura (en la factura)
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={prevReading}
                    onChange={(e) => setPrevReading(e.target.value)}
                    required
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] text-lg font-bold focus:border-[#006a61] focus:ring-2 focus:ring-[#86f2e4]/30 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#76777d]">
                    {unit}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#191c1e]">
                  Lectura actual
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={currReading}
                    onChange={(e) => setCurrReading(e.target.value)}
                    required
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-[#006a61] bg-white text-[#191c1e] text-lg font-bold focus:ring-2 focus:ring-[#86f2e4]/30 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#006a61]">
                    {unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Precio Unitario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#191c1e]">
                  Precio unitario (ej. $/ {unit})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#76777d]">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] text-base font-bold focus:border-[#006a61] focus:ring-2 focus:ring-[#86f2e4]/30 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#45464d]">
                  Notas u Observaciones (Opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Medición al final del ciclo..."
                  className="w-full px-4 py-2.5 rounded-lg border border-[#c6c6cd] bg-white text-[#191c1e] text-sm focus:border-[#006a61] focus:ring-2 focus:ring-[#86f2e4]/30 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[#c6c6cd] text-[#45464d] hover:bg-[#f2f4f6] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#006a61] text-white hover:bg-[#005049] shadow-sm hover:shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{editingReading ? 'Actualizar Registro' : 'Guardar Registro'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Calculation Sticky Card */}
        <div className="xl:col-span-1">
          <div className="bg-[#131b2e] text-white p-6 rounded-xl shadow-lg sticky top-24 border-t-4 border-[#86f2e4] flex flex-col gap-6">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Activity className="w-5 h-5 text-[#86f2e4]" />
              <h3 className="font-bold text-base text-white">Resumen Calculado</h3>
            </div>

            <div className="flex flex-col gap-4">
              {/* Consumo total block */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-white/70 mb-1">Consumo total</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {calculatedConsumption.toLocaleString('es-MX')}
                  </span>
                  <span className="text-sm font-medium text-[#86f2e4]">{unit}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/10 h-2.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${statusInfo.colorClass}`} 
                    style={{ width: `${Math.min(100, statusInfo.progressPct)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-2 text-xs">
                  <span className="text-white/60">Nivel de uso</span>
                  <span className={`font-bold ${
                    statusInfo.status === 'alto' ? 'text-[#fca5a5]' : statusInfo.status === 'optimo' ? 'text-[#6ee7b7]' : 'text-[#fde68a]'
                  }`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {/* Costo estimado block */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-white/70 mb-1">Costo estimado</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white/80">$</span>
                  <span className="text-4xl font-extrabold text-white tracking-tight">
                    {calculatedCost.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <p className="text-[11px] text-white/60 mt-3 flex items-center gap-1.5 leading-tight">
                  <Info className="w-3.5 h-3.5 shrink-0 text-[#86f2e4]" />
                  <span>No incluye cargos fijos, subsidios ni impuestos aplicables.</span>
                </p>
              </div>

              {/* Service info summary */}
              <div className="p-3 bg-white/5 rounded-lg text-xs text-white/80 flex items-center justify-between">
                <span>Tarifa Base:</span>
                <span className="font-semibold text-white">${priceNum.toFixed(3)} / {unit}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

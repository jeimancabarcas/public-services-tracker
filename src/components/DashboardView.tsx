import React, { useState } from 'react';
import { 
  Zap, 
  Droplet, 
  Flame, 
  MoreHorizontal, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UtilityReading } from '../types';

export const DashboardView: React.FC = () => {
  const { 
    readings, 
    services, 
    setActiveTab, 
    setIsNewEntryModalOpen, 
    setSelectedReadingForDetail,
    getLatestReadingForService,
    getComparisonForService,
    getMonthlyTrends 
  } = useApp();

  const [chartMetric, setChartMetric] = useState<'consumption' | 'cost'>('consumption');
  const [activeBarHover, setActiveBarHover] = useState<number | null>(null);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);

  // Latest readings and comparisons for the 3 services
  const luzComp = getComparisonForService('luz');
  const aguaComp = getComparisonForService('agua');
  const gasComp = getComparisonForService('gas');

  const monthlyTrends = getMonthlyTrends();

  // Sort and pick latest 4 readings for the list widget
  const recentReadings = [...readings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const getServiceIcon = (service: string, className = "w-5 h-5") => {
    switch (service) {
      case 'luz':
        return <Zap className={`${className} text-[#F59E0B]`} />;
      case 'agua':
        return <Droplet className={`${className} text-[#3B82F6]`} />;
      case 'gas':
        return <Flame className={`${className} text-[#EF4444]`} />;
      default:
        return <Zap className={className} />;
    }
  };

  const getServiceBadge = (status: string) => {
    switch (status) {
      case 'alto':
        return (
          <span className="bg-[#ffdad6] text-[#93000a] px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide">
            Alto
          </span>
        );
      case 'optimo':
        return (
          <span className="bg-[#D1FAE5] text-[#065F46] px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide">
            Óptimo
          </span>
        );
      case 'moderado':
      default:
        return (
          <span className="bg-[#FEF3C7] text-[#92400E] px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide">
            Moderado
          </span>
        );
    }
  };

  const formatDateDisplay = (dateString: string) => {
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const m = parseInt(parts[1], 10) - 1;
        return `${parseInt(parts[2], 10)} ${months[m] || ''} ${parts[0]}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const getMonthTitleForReading = (reading: UtilityReading) => {
    try {
      const parts = reading.date.split('-');
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const m = parseInt(parts[1], 10) - 1;
      const svcName = services[reading.service]?.name || reading.service;
      return `${svcName} - ${months[m] || ''}`;
    } catch {
      return `${reading.service} - ${reading.date}`;
    }
  };

  // Find maximum values for chart relative heights
  const maxLuz = Math.max(...monthlyTrends.map(m => chartMetric === 'consumption' ? m.luz : m.luzCost), 1);
  const maxAgua = Math.max(...monthlyTrends.map(m => chartMetric === 'consumption' ? m.agua : m.aguaCost), 1);
  const maxGas = Math.max(...monthlyTrends.map(m => chartMetric === 'consumption' ? m.gas : m.gasCost), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Mobile Quick Action button */}
      <div className="md:hidden flex justify-end">
        <button
          onClick={() => setIsNewEntryModalOpen(true)}
          className="bg-[#006a61] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#005049] transition-all shadow-sm flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Lectura</span>
        </button>
      </div>

      {/* 3 Summary Cards Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Luz Card */}
        <div className="bg-white rounded-xl p-6 ambient-shadow hover:shadow-md transition-all luz-accent relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5 text-[#191c1e]">
                <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <h3 className="font-bold text-sm text-[#191c1e]">Luz</h3>
              </div>
              {getServiceBadge(luzComp.status)}
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-[#191c1e] tracking-tight">
                {luzComp.current ? luzComp.current.consumption.toLocaleString('es-MX') : '342'}
              </span>
              <span className="text-sm font-medium text-[#45464d]">
                {services.luz?.unit || 'kWh'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#f2f4f6]">
            <p className="text-xs text-[#45464d] flex items-center gap-1">
              <span>Mes anterior:</span>
              <span className="font-semibold">
                {luzComp.previous ? `${luzComp.previous.consumption} ${services.luz?.unit || 'kWh'}` : '290 kWh'}
              </span>
              <span className={`font-bold ml-1 flex items-center ${luzComp.percentageDiff >= 0 ? 'text-[#ba1a1a]' : 'text-[#059669]'}`}>
                {luzComp.percentageDiff >= 0 ? '+' : ''}{luzComp.previous ? `${luzComp.percentageDiff}%` : '(+18%)'}
              </span>
            </p>
          </div>
        </div>

        {/* Agua Card */}
        <div className="bg-white rounded-xl p-6 ambient-shadow hover:shadow-md transition-all agua-accent relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5 text-[#191c1e]">
                <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] flex items-center justify-center">
                  <Droplet className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <h3 className="font-bold text-sm text-[#191c1e]">Agua</h3>
              </div>
              {getServiceBadge(aguaComp.status || 'optimo')}
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-[#191c1e] tracking-tight">
                {aguaComp.current ? aguaComp.current.consumption.toLocaleString('es-MX') : '12.5'}
              </span>
              <span className="text-sm font-medium text-[#45464d]">
                {services.agua?.unit || 'm³'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#f2f4f6]">
            <p className="text-xs text-[#45464d] flex items-center gap-1">
              <span>Mes anterior:</span>
              <span className="font-semibold">
                {aguaComp.previous ? `${aguaComp.previous.consumption} ${services.agua?.unit || 'm³'}` : '14.0 m³'}
              </span>
              <span className={`font-bold ml-1 flex items-center ${aguaComp.percentageDiff <= 0 ? 'text-[#059669]' : 'text-[#ba1a1a]'}`}>
                {aguaComp.previous ? `${aguaComp.percentageDiff > 0 ? '+' : ''}${aguaComp.percentageDiff}%` : '(-10%)'}
              </span>
            </p>
          </div>
        </div>

        {/* Gas Card */}
        <div className="bg-white rounded-xl p-6 ambient-shadow hover:shadow-md transition-all gas-accent relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2.5 text-[#191c1e]">
                <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center">
                  <Flame className="w-4 h-4 text-[#EF4444]" />
                </div>
                <h3 className="font-bold text-sm text-[#191c1e]">Gas</h3>
              </div>
              {getServiceBadge(gasComp.status || 'moderado')}
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-[#191c1e] tracking-tight">
                {gasComp.current ? gasComp.current.consumption.toLocaleString('es-MX') : '45'}
              </span>
              <span className="text-sm font-medium text-[#45464d]">
                {services.gas?.unit || 'm³'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#f2f4f6]">
            <p className="text-xs text-[#45464d] flex items-center gap-1">
              <span>Mes anterior:</span>
              <span className="font-semibold">
                {gasComp.previous ? `${gasComp.previous.consumption} ${services.gas?.unit || 'm³'}` : '42 m³'}
              </span>
              <span className={`font-bold ml-1 flex items-center ${gasComp.percentageDiff >= 0 ? 'text-[#D97706]' : 'text-[#059669]'}`}>
                {gasComp.previous ? `${gasComp.percentageDiff > 0 ? '+' : ''}${gasComp.percentageDiff}%` : '(+7%)'}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: 8 cols Chart + 4 cols Actions & Readings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Section (8 cols) */}
        <section className="lg:col-span-8 bg-white rounded-xl p-6 ambient-shadow flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#191c1e] tracking-tight">
                Tendencia de Consumo (6 Meses)
              </h2>
              <p className="text-xs text-[#76777d] mt-0.5">
                Comparativa histórica mensual por servicio
              </p>
            </div>

            <div className="relative">
              <button 
                onClick={() => setOptionsMenuOpen(!optionsMenuOpen)}
                className="text-[#45464d] hover:text-[#191c1e] p-1.5 rounded-lg hover:bg-[#f2f4f6] transition-colors"
                aria-label="Opciones del gráfico"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {optionsMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#c6c6cd]/40 py-1.5 z-30">
                  <button
                    onClick={() => {
                      setChartMetric('consumption');
                      setOptionsMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2 ${
                      chartMetric === 'consumption' ? 'text-[#006a61] bg-[#86f2e4]/20 font-bold' : 'text-[#45464d] hover:bg-[#f2f4f6]'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Ver Consumo Físico (Unidades)</span>
                  </button>
                  <button
                    onClick={() => {
                      setChartMetric('cost');
                      setOptionsMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center gap-2 ${
                      chartMetric === 'cost' ? 'text-[#006a61] bg-[#86f2e4]/20 font-bold' : 'text-[#45464d] hover:bg-[#f2f4f6]'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Ver Gasto Estimado ($)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="relative pt-6">
            {/* Tooltip Overlay */}
            {activeBarHover !== null && monthlyTrends[activeBarHover] && (
              <div className="mb-3 p-3 bg-[#131b2e] text-white rounded-lg text-xs shadow-md flex items-center justify-between animate-in fade-in duration-150">
                <span className="font-bold text-[#86f2e4]">
                  {monthlyTrends[activeBarHover].monthName} ({monthlyTrends[activeBarHover].monthKey})
                </span>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                    Luz: {chartMetric === 'consumption' ? `${monthlyTrends[activeBarHover].luz} kWh` : `$${monthlyTrends[activeBarHover].luzCost.toFixed(2)}`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
                    Agua: {chartMetric === 'consumption' ? `${monthlyTrends[activeBarHover].agua} m³` : `$${monthlyTrends[activeBarHover].aguaCost.toFixed(2)}`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
                    Gas: {chartMetric === 'consumption' ? `${monthlyTrends[activeBarHover].gas} m³` : `$${monthlyTrends[activeBarHover].gasCost.toFixed(2)}`}
                  </span>
                </div>
              </div>
            )}

            <div className="h-60 w-full relative flex items-end justify-between px-2 gap-2 pb-6 border-b border-[#c6c6cd]/40">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[11px] font-medium text-[#76777d] pb-6">
                <span>{chartMetric === 'consumption' ? '100%' : '$50'}</span>
                <span>{chartMetric === 'consumption' ? '50%' : '$25'}</span>
                <span>0</span>
              </div>

              {/* Multi-bars for each month */}
              {monthlyTrends.map((m, idx) => {
                // Calculate proportional bar heights (max 95%, min 12%)
                const luzH = Math.min(95, Math.max(15, (chartMetric === 'consumption' ? m.luz / maxLuz : m.luzCost / maxLuz) * 85));
                const aguaH = Math.min(95, Math.max(15, (chartMetric === 'consumption' ? m.agua / maxAgua : m.aguaCost / maxAgua) * 80));
                const gasH = Math.min(95, Math.max(15, (chartMetric === 'consumption' ? m.gas / maxGas : m.gasCost / maxGas) * 82));

                const isHovered = activeBarHover === idx;

                return (
                  <div
                    key={m.monthKey || idx}
                    className={`flex-1 flex gap-1.5 h-full items-end group ml-6 sm:ml-8 cursor-pointer rounded-t-md p-1 transition-colors ${
                      isHovered ? 'bg-[#f2f4f6]' : 'hover:bg-[#f7f9fb]'
                    }`}
                    onMouseEnter={() => setActiveBarHover(idx)}
                    onMouseLeave={() => setActiveBarHover(null)}
                  >
                    {/* Luz bar */}
                    <div 
                      className={`w-1/3 rounded-t-sm transition-all duration-300 ${
                        idx === monthlyTrends.length - 1 ? 'bg-[#F59E0B]' : isHovered ? 'bg-[#F59E0B]' : 'bg-[#FDE68A]'
                      }`}
                      style={{ height: `${luzH}%` }}
                      title={`Luz: ${m.luz} kWh ($${m.luzCost.toFixed(2)})`}
                    />
                    {/* Agua bar */}
                    <div 
                      className={`w-1/3 rounded-t-sm transition-all duration-300 ${
                        idx === monthlyTrends.length - 1 ? 'bg-[#3B82F6]' : isHovered ? 'bg-[#3B82F6]' : 'bg-[#BFDBFE]'
                      }`}
                      style={{ height: `${aguaH}%` }}
                      title={`Agua: ${m.agua} m³ ($${m.aguaCost.toFixed(2)})`}
                    />
                    {/* Gas bar */}
                    <div 
                      className={`w-1/3 rounded-t-sm transition-all duration-300 ${
                        idx === monthlyTrends.length - 1 ? 'bg-[#EF4444]' : isHovered ? 'bg-[#EF4444]' : 'bg-[#FECACA]'
                      }`}
                      style={{ height: `${gasH}%` }}
                      title={`Gas: ${m.gas} m³ ($${m.gasCost.toFixed(2)})`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis Month labels */}
            <div className="flex justify-between ml-10 mt-2 text-xs font-semibold text-[#45464d] pr-3">
              {monthlyTrends.map((m) => (
                <span key={m.monthKey || m.monthName} className="text-center">
                  {m.monthName}
                </span>
              ))}
            </div>

            {/* Chart Legend */}
            <div className="flex justify-center gap-6 mt-6 pt-2">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <span className="text-xs font-medium text-[#45464d]">Luz (kWh)</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
                <span className="text-xs font-medium text-[#45464d]">Agua (m³)</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="text-xs font-medium text-[#45464d]">Gas (m³)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar Content (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl p-6 ambient-shadow hidden md:flex flex-col gap-4">
            <h2 className="text-base font-bold text-[#191c1e] tracking-tight">
              Acciones Rápidas
            </h2>
            <button
              onClick={() => setActiveTab('registro')}
              className="w-full bg-[#006a61] text-white py-3.5 px-4 rounded-lg text-sm font-semibold hover:bg-[#005049] transition-all shadow-xs flex items-center justify-center gap-2 active:scale-98"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Registrar Nueva Lectura</span>
            </button>
          </div>

          {/* Recent Readings List */}
          <div className="bg-white rounded-xl p-6 ambient-shadow flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-[#191c1e] tracking-tight">
                Últimas Lecturas
              </h2>
              <button
                onClick={() => setActiveTab('historial')}
                className="text-[#006a61] text-xs font-semibold hover:underline flex items-center gap-0.5"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#eceef0] flex-1 flex flex-col justify-around">
              {recentReadings.map((reading) => (
                <div
                  key={reading.id}
                  onClick={() => setSelectedReadingForDetail(reading)}
                  className="flex items-center justify-between py-3 group cursor-pointer hover:bg-[#f7f9fb] px-2 rounded-lg transition-colors -mx-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#f2f4f6] flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getServiceIcon(reading.service)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#191c1e]">
                        {getMonthTitleForReading(reading)}
                      </p>
                      <p className="text-xs text-[#76777d]">
                        {formatDateDisplay(reading.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-[#191c1e]">
                      ${reading.totalCost.toFixed(2)}
                    </p>
                    <p className="text-xs text-[#45464d]">
                      {reading.consumption} {reading.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

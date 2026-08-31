import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Droplet, 
  Flame, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ArrowDown, 
  ArrowUp,
  Download,
  Trash2,
  Edit2,
  Eye,
  Search,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceType, UtilityReading } from '../types';

export const HistoryView: React.FC = () => {
  const { 
    readings, 
    deleteReading, 
    setSelectedReadingForDetail, 
    setEditingReading, 
    setActiveTab,
    setIsNewEntryModalOpen 
  } = useApp();

  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('30');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Filter logic
  const filteredReadings = useMemo(() => {
    return readings.filter((item) => {
      // Service filter
      if (selectedService !== 'all' && item.service !== selectedService) {
        return false;
      }

      // Search query filter (notes, service, date)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesService = item.service.toLowerCase().includes(query);
        const matchesDate = item.date.includes(query);
        const matchesNotes = item.notes?.toLowerCase().includes(query);
        if (!matchesService && !matchesDate && !matchesNotes) {
          return false;
        }
      }

      // Date range filter
      if (selectedDateRange !== 'all') {
        const itemDate = new Date(item.date).getTime();
        const now = new Date('2023-10-31').getTime(); // anchored to data timeline or current

        if (selectedDateRange === '30') {
          const thirtyDaysAgo = now - 35 * 24 * 60 * 60 * 1000;
          if (itemDate < thirtyDaysAgo) return false;
        } else if (selectedDateRange === '90') {
          const ninetyDaysAgo = now - 100 * 24 * 60 * 60 * 1000;
          if (itemDate < ninetyDaysAgo) return false;
        } else if (selectedDateRange === 'year') {
          const startOfYear = new Date('2023-01-01').getTime();
          if (itemDate < startOfYear) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortDirection === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [readings, selectedService, selectedDateRange, searchQuery, sortDirection]);

  // Pagination calculation
  const totalEntries = filteredReadings.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const currentEntries = filteredReadings.slice(startIndex, endIndex);

  const handleSortToggle = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const exportCSV = () => {
    const headers = ['ID', 'Servicio', 'Fecha', 'Lectura Anterior', 'Lectura Actual', 'Consumo', 'Unidad', 'Precio Unitario', 'Costo Total', 'Estado', 'Notas'];
    const rows = filteredReadings.map(r => [
      r.id,
      r.service,
      r.date,
      r.prevReading,
      r.currReading,
      r.consumption,
      r.unit,
      r.unitPrice,
      r.totalCost,
      r.status,
      `"${r.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hogarmedido_historial_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getServiceVisual = (service: ServiceType) => {
    switch (service) {
      case 'luz':
        return {
          name: 'Luz',
          icon: <Zap className="w-4 h-4 text-[#92400E]" />,
          bg: 'bg-[#FEF3C7]',
        };
      case 'agua':
        return {
          name: 'Agua',
          icon: <Droplet className="w-4 h-4 text-[#1E40AF]" />,
          bg: 'bg-[#DBEAFE]',
        };
      case 'gas':
        return {
          name: 'Gas',
          icon: <Flame className="w-4 h-4 text-[#991B1B]" />,
          bg: 'bg-[#FEE2E2]',
        };
      default:
        return {
          name: service,
          icon: <Zap className="w-4 h-4 text-[#191c1e]" />,
          bg: 'bg-[#f2f4f6]',
        };
    }
  };

  const formatDateDisplay = (dateString: string) => {
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const m = parseInt(parts[1], 10) - 1;
        return `${months[m] || ''} ${parseInt(parts[2], 10)}, ${parts[0]}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Filters Section matching HTML/Screenshot */}
      <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] p-6 border border-[#c6c6cd]/30 flex flex-col md:flex-row gap-4 items-stretch md:items-end justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Service Type */}
          <div className="flex flex-col gap-1.5 w-full sm:w-48">
            <label className="text-xs font-semibold text-[#45464d]">
              Service Type
            </label>
            <div className="relative">
              <select
                value={selectedService}
                onChange={(e) => {
                  setSelectedService(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-white border border-[#76777d] rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#006a61] focus:ring-2 focus:ring-[#86f2e4]/20 transition-all cursor-pointer font-medium"
              >
                <option value="all">All Services</option>
                <option value="luz">Luz</option>
                <option value="agua">Agua</option>
                <option value="gas">Gas</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45464d] pointer-events-none text-xs">
                ▼
              </span>
            </div>
          </div>

          {/* Date Range */}
          <div className="flex flex-col gap-1.5 w-full sm:w-48">
            <label className="text-xs font-semibold text-[#45464d]">
              Date Range
            </label>
            <div className="relative">
              <select
                value={selectedDateRange}
                onChange={(e) => {
                  setSelectedDateRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-white border border-[#76777d] rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#006a61] focus:ring-2 focus:ring-[#86f2e4]/20 transition-all cursor-pointer font-medium"
              >
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45464d] pointer-events-none text-xs">
                ▼
              </span>
            </div>
          </div>

          {/* Search box */}
          <div className="flex flex-col gap-1.5 w-full sm:w-56">
            <label className="text-xs font-semibold text-[#45464d]">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar fecha o notas..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-[#76777d] rounded-lg pl-9 pr-3 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#006a61] focus:ring-2 focus:ring-[#86f2e4]/20 transition-all font-medium"
              />
              <Search className="w-4 h-4 text-[#76777d] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedService('all');
              setSelectedDateRange('all');
              setSearchQuery('');
            }}
            className="flex items-center justify-center gap-1.5 bg-white border border-[#76777d] text-[#191c1e] px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-[#f2f4f6] transition-colors"
            title="Restablecer filtros"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 bg-[#006a61] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#005049] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.05)] border border-[#c6c6cd]/30 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#f2f4f6] border-b border-[#c6c6cd]/50 text-xs font-bold text-[#45464d]">
                <th className="px-6 py-3.5 cursor-pointer hover:text-[#191c1e] transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Service</span>
                  </div>
                </th>
                <th 
                  onClick={handleSortToggle}
                  className="px-6 py-3.5 cursor-pointer hover:text-[#191c1e] transition-colors select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    {sortDirection === 'desc' ? (
                      <ArrowDown className="w-3.5 h-3.5 text-[#006a61]" />
                    ) : (
                      <ArrowUp className="w-3.5 h-3.5 text-[#006a61]" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3.5 text-right">Prev. Reading</th>
                <th className="px-6 py-3.5 text-right">Curr. Reading</th>
                <th className="px-6 py-3.5 text-right">Consumption</th>
                <th className="px-6 py-3.5 text-right">Unit Price</th>
                <th className="px-6 py-3.5 text-right">Total Cost</th>
                <th className="px-6 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#191c1e] divide-y divide-[#c6c6cd]/30">
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#76777d]">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                currentEntries.map((reading) => {
                  const visual = getServiceVisual(reading.service);

                  // Consumption text color based on status/service
                  let consumptionColorClass = 'text-[#191c1e]';
                  if (reading.status === 'alto') {
                    consumptionColorClass = 'text-[#ba1a1a] font-bold';
                  } else if (reading.status === 'optimo') {
                    consumptionColorClass = 'text-[#006a61] font-bold';
                  }

                  return (
                    <tr
                      key={reading.id}
                      className="hover:bg-[#f2f4f6]/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedReadingForDetail(reading)}
                    >
                      {/* Service column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${visual.bg} flex items-center justify-center shrink-0`}>
                            {visual.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[#191c1e]">
                                {visual.name}
                              </span>
                              {reading.service === 'luz' && (reading.subsidizedKwh ?? (reading.consumption > 0 ? 1 : 0)) > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#d1fae5] text-[#065f46]">
                                  Subsidio
                                </span>
                              )}
                            </div>
                            {reading.service === 'luz' && (
                              <span className="text-[11px] text-[#76777d]">
                                Estrato {reading.estrato || 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date column */}
                      <td className="px-6 py-4 text-[#45464d] font-medium whitespace-nowrap">
                        {formatDateDisplay(reading.date)}
                      </td>

                      {/* Prev Reading */}
                      <td className="px-6 py-4 text-right text-[#45464d]">
                        {reading.prevReading.toLocaleString('es-MX')} {reading.unit}
                      </td>

                      {/* Curr Reading */}
                      <td className="px-6 py-4 text-right text-[#191c1e] font-medium">
                        {reading.currReading.toLocaleString('es-MX')} {reading.unit}
                      </td>

                      {/* Consumption */}
                      <td className={`px-6 py-4 text-right ${consumptionColorClass}`}>
                        {reading.consumption.toLocaleString('es-MX')} {reading.unit}
                      </td>

                      {/* Unit Price */}
                      <td className="px-6 py-4 text-right text-[#45464d]">
                        ${reading.unitPrice.toFixed(2)}
                      </td>

                      {/* Total Cost */}
                      <td className="px-6 py-4 text-right font-bold text-base text-[#191c1e]">
                        ${reading.totalCost.toFixed(2)}
                      </td>

                      {/* Action buttons */}
                      <td 
                        className="px-6 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedReadingForDetail(reading)}
                            className="p-1.5 text-[#76777d] hover:text-[#006a61] hover:bg-[#e6e8ea] rounded-md transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingReading(reading);
                              setActiveTab('registro');
                            }}
                            className="p-1.5 text-[#76777d] hover:text-[#F59E0B] hover:bg-[#e6e8ea] rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('¿Seguro que deseas eliminar esta lectura?')) {
                                deleteReading(reading.id);
                              }
                            }}
                            className="p-1.5 text-[#76777d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-md transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section matching HTML */}
        <div className="bg-white border-t border-[#c6c6cd]/30 px-6 py-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#45464d]">
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {endIndex} of {totalEntries} entries
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-[#c6c6cd] rounded-lg text-[#45464d] hover:bg-[#f2f4f6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-[#191c1e] px-2">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 border border-[#c6c6cd] rounded-lg text-[#45464d] hover:bg-[#f2f4f6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

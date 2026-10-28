import React, { useState } from 'react';
import {
  Building2,
  FileSpreadsheet,
  PlusCircle,
  Scale,
  BarChart3,
  BookOpen,
  Download,
  Upload,
  DownloadCloud,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Save,
  Trash2,
  CalendarDays,
  Sparkles,
  Clock,
  Users,
  Workflow,
} from 'lucide-react';
import { FundSettings } from '../types/cajaMenor';
import { formatCOP } from '../utils/formatters';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  settings: FundSettings;
  onSaveProgress: () => void;
  onBackupDownload: () => void;
  onBackupUpload: (file: File) => void;
  onResetData: () => void;
  onOpenPwaModal: (mode: 'install' | 'uninstall') => void;
  onOpenDailyClosing: () => void;
  onOpenMonthClosing: () => void;
  onOpenPeopleModal?: () => void;
  onOpenFlowchart?: () => void;
  lastSavedTime: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  settings,
  onSaveProgress,
  onBackupDownload,
  onBackupUpload,
  onResetData,
  onOpenPwaModal,
  onOpenDailyClosing,
  onOpenMonthClosing,
  onOpenPeopleModal,
  onOpenFlowchart,
  lastSavedTime,
}) => {
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Tablero & Kárdex', icon: FileSpreadsheet },
    { id: 'new-expense', label: 'Registrar Gasto', icon: PlusCircle },
    { id: 'flujograma', label: 'Flujograma Oficial', icon: Workflow },
    { id: 'arqueo', label: 'Arqueo Sorpresa', icon: Scale },
    { id: 'cierre-mes', label: 'Cierre de Mes', icon: CalendarDays },
    { id: 'reports', label: 'Reportes & DIAN', icon: BarChart3 },
    { id: 'normativa', label: 'Normativa & Fondos', icon: BookOpen },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  {settings.companyName}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-sky-950 text-sky-300 border border-sky-700/60 rounded">
                  NIT: {settings.companyNit}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sistema Oficial de Caja Menor • Fondo Fijo: {formatCOP(settings.initialFund)}
              </p>
            </div>
          </div>

          {/* Right Action Controls: Instalar, Desinstalar, Guardar Avances, Cierre de Mes */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* BOTÓN INSTALAR */}
            <button
              onClick={() => onOpenPwaModal('install')}
              title="Instalar como aplicación en escritorio o móvil"
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Instalar</span>
            </button>

            {/* BOTÓN DESINSTALAR */}
            <button
              onClick={() => onOpenPwaModal('uninstall')}
              title="Desinstalar o desvincular app"
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-slate-700 hover:border-rose-800 transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Desinstalar</span>
            </button>

            {/* BOTÓN GUARDAR AVANCES (1-click direct action) */}
            <div className="relative">
              <div className="flex items-center rounded-lg bg-sky-600 hover:bg-sky-500 shadow-sm transition-all overflow-hidden">
                <button
                  onClick={onSaveProgress}
                  title="Guardar todos los avances actuales inmediatamente"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-white text-xs font-bold hover:bg-sky-700 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span className="whitespace-nowrap">Guardar avances</span>
                </button>
                <button
                  onClick={() => setShowSaveMenu(!showSaveMenu)}
                  title="Opciones de respaldo y restauración"
                  className="px-2 py-1.5 border-l border-sky-500 text-white hover:bg-sky-700 transition-colors"
                >
                  <span className="text-[10px]">▼</span>
                </button>
              </div>

              {/* Guardar / Respaldar Avances Dropdown */}
              {showSaveMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowSaveMenu(false)}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/80">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Respaldo y Avances
                    </span>
                    <span className="flex items-center text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Auto-guardado
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3">
                    Último guardado: <strong className="text-slate-200">{lastSavedTime}</strong>.
                    Los datos permanecen protegidos en este equipo.
                  </p>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        onSaveProgress();
                        setShowSaveMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-sky-200 hover:text-white bg-sky-900/40 hover:bg-sky-900/70 border border-sky-700/50 rounded-lg transition-colors text-left"
                    >
                      <Save className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <div>
                        <div>Guardar avances ahora</div>
                        <div className="text-[10px] text-sky-300/80">Guarda el estado completo de la sesión</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onBackupDownload();
                        setShowSaveMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <div>
                        <div>Descargar copia .json</div>
                        <div className="text-[10px] text-slate-400">Descargar archivo para no perder información</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowSaveMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div>
                        <div>Restaurar copia previa</div>
                        <div className="text-[10px] text-slate-400">Cargar archivo .json guardado previamente</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('¿Deseas restablecer los datos oficiales de muestra de Impresos El Día S.A.S.?')) {
                          onResetData();
                        }
                        setShowSaveMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors text-left"
                    >
                      <RefreshCw className="w-3 h-3 shrink-0" />
                      <span>Restablecer datos muestra</span>
                    </button>
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onBackupUpload(file);
                    e.target.value = '';
                  }
                }}
              />
            </div>

            {/* BOTÓN FLUJOGRAMA OFICIAL */}
            {onOpenFlowchart && (
              <button
                onClick={onOpenFlowchart}
                title="Ver flujograma de procesos y control interno de caja menor"
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-900/80 hover:bg-indigo-800 text-sky-200 hover:text-white text-xs font-bold border border-indigo-700/60 transition-all shadow-xs"
              >
                <Workflow className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden md:inline">Flujograma</span>
              </button>
            )}

            {/* BOTÓN GESTIÓN DE COLABORADORES */}
            {onOpenPeopleModal && (
              <button
                onClick={onOpenPeopleModal}
                title="Directorio de personal autorizado para gastos"
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-xs"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden lg:inline">Colaboradores</span>
              </button>
            )}

            {/* BOTÓN CIERRE DEL DÍA */}
            <button
              onClick={onOpenDailyClosing}
              title="Conciliación y arqueo diario de caja menor"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cierre del Día</span>
            </button>

            {/* BOTÓN CIERRE DE MES RÁPIDO */}
            <button
              onClick={onOpenMonthClosing}
              title="Ejecutar liquidación y cierre contable mensual (Paso 4 y 5)"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Cierre de Mes</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'cierre-mes' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

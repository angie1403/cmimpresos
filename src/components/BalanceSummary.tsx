import React from 'react';
import {
  Wallet,
  TrendingDown,
  Coins,
  AlertTriangle,
  CheckCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { FundSettings, Transaction, ProvisionalVoucher } from '../types/cajaMenor';
import { formatCOP } from '../utils/formatters';

interface BalanceSummaryProps {
  settings: FundSettings;
  transactions: Transaction[];
  vouchers: ProvisionalVoucher[];
  onRequestReimbursement: () => void;
  onOpenNewExpense: () => void;
  onOpenArqueo: () => void;
  onOpenDailyClosing?: () => void;
  onOpenMonthClosing?: () => void;
  onOpenFlowchart?: () => void;
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  settings,
  transactions,
  vouchers,
  onRequestReimbursement,
  onOpenNewExpense,
  onOpenArqueo,
  onOpenDailyClosing,
  onOpenMonthClosing,
  onOpenFlowchart,
}) => {
  const totalSpent = transactions.reduce((acc, curr) => acc + curr.total, 0);
  const remainingBalance = settings.initialFund - totalSpent;
  const spentPercentage = Math.min(100, Math.round((totalSpent / settings.initialFund) * 100));

  const pendingVouchersTotal = vouchers
    .filter((v) => v.status === 'Pendiente')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Cash physically in cash drawer = Available Balance minus provisional cash advances
  const physicalCashInDrawer = remainingBalance - pendingVouchersTotal;

  // Regulatory alert from Manual Paso 4: Reembolso se activa al consumir entre 70% y 80%
  const isReimbursementNeeded =
    spentPercentage >= settings.reimbursementThresholdPercent ||
    remainingBalance <= settings.minBalanceThreshold;

  const isReimbursementCritical = spentPercentage >= 85 || remainingBalance < 300000;

  return (
    <div className="space-y-4">
      {/* Alert Banner if reimbursement threshold is met */}
      {isReimbursementNeeded && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm ${
            isReimbursementCritical
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                isReimbursementCritical ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
              }`}
            >
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm">
                Alerta Normativa de Reembolso Activa (Paso 4 del Manual)
              </div>
              <p className="text-xs mt-0.5 opacity-90">
                Se ha consumido el <strong className="font-semibold">{spentPercentage}%</strong> del fondo fijo
                (Saldo disponible: {formatCOP(remainingBalance)}). Según el Decreto 2568 de 2010 y el Manual de
                Impresos El Día S.A.S., se debe legalizar y tramitar la reposición contable inmediata.
              </p>
            </div>
          </div>
          <button
            onClick={onRequestReimbursement}
            className="shrink-0 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tramitar Reembolso</span>
          </button>
        </div>
      )}

      {/* Main KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fondo Asignado */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Fondo Fijo Asignado</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight">
            {formatCOP(settings.initialFund)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span className="truncate">Custodio: {settings.custodian.split('(')[0]}</span>
          </div>
        </div>

        {/* Total Gastado */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Total Gastado</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">
            {formatCOP(totalSpent)}
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{transactions.length} comprobantes</span>
              <span className="font-semibold text-slate-700">{spentPercentage}% consumido</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  spentPercentage >= 80
                    ? 'bg-rose-500'
                    : spentPercentage >= 70
                    ? 'bg-amber-500'
                    : 'bg-sky-500'
                }`}
                style={{ width: `${spentPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Saldo Restante Disponible */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Saldo Disponible</span>
            <div
              className={`p-2 rounded-lg ${
                remainingBalance > 600000
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              remainingBalance > 600000 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {formatCOP(remainingBalance)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Mínimo sugerido:</span>
            <span className="font-semibold text-slate-700">
              {formatCOP(settings.minBalanceThreshold)}
            </span>
          </div>
        </div>

        {/* Efectivo en Caja & Vales Activos */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Efectivo Físico en Caja</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700 tracking-tight">
            {formatCOP(physicalCashInDrawer)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Vales vigentes ({vouchers.filter((v) => v.status === 'Pendiente').length}):</span>
            <span className="font-semibold text-slate-700">{formatCOP(pendingVouchersTotal)}</span>
          </div>
        </div>
      </div>

      {/* Quick Access Control Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="hidden sm:flex h-9 w-9 rounded-lg bg-sky-500/20 text-sky-400 items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-2 justify-center md:justify-start">
              <span>Operaciones de Caja Menor</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Período: {settings.currentPeriod}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Registro manual o con lectura OCR de IA para facturas electrónicas y tiquetes POS
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-center">
          <button
            onClick={onOpenNewExpense}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center space-x-1.5"
          >
            <span>+ Registrar Gasto</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenArqueo}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Arqueo Sorpresa</span>
          </button>

          <button
            onClick={onRequestReimbursement}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reembolso</span>
          </button>

          {onOpenDailyClosing && (
            <button
              onClick={onOpenDailyClosing}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <span>🕒 Cierre del Día</span>
            </button>
          )}

          {onOpenMonthClosing && (
            <button
              onClick={onOpenMonthClosing}
              className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <span>📅 Cierre de Mes</span>
            </button>
          )}

          {onOpenFlowchart && (
            <button
              onClick={onOpenFlowchart}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <span>🔄 Flujograma</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

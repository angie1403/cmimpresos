import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileText,
  Printer,
  Download,
  Building,
  ShieldCheck,
  X,
  CreditCard,
  UserCheck,
  ArrowRight,
  TrendingDown,
  Coins,
} from 'lucide-react';
import {
  FundSettings,
  Transaction,
  ProvisionalVoucher,
  MonthlyClosingRecord,
} from '../types/cajaMenor';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { formatCOP, formatDate } from '../utils/formatters';

interface MonthClosingModalProps {
  settings: FundSettings;
  transactions: Transaction[];
  vouchers: ProvisionalVoucher[];
  onConfirmClosing: (record: MonthlyClosingRecord) => void;
  onClose: () => void;
}

export const MonthClosingModal: React.FC<MonthClosingModalProps> = ({
  settings,
  transactions,
  vouchers,
  onConfirmClosing,
  onClose,
}) => {
  // Compute next period suggestion (e.g. "Octubre 2026" -> "Noviembre 2026")
  const defaultNextPeriod = useMemo(() => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    const parts = settings.currentPeriod.split(' ');
    if (parts.length === 2) {
      const idx = months.indexOf(parts[0]);
      const year = parseInt(parts[1], 10);
      if (idx !== -1) {
        if (idx === 11) {
          return `Enero ${year + 1}`;
        }
        return `${months[idx + 1]} ${year}`;
      }
    }
    return 'Siguiente Mes 2026';
  }, [settings.currentPeriod]);

  const [closingDate, setClosingDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [nextPeriodLabel, setNextPeriodLabel] = useState<string>(defaultNextPeriod);
  const [transferNumber, setTransferNumber] = useState<string>(
    'TRF-BCOL-' + Math.floor(10000 + Math.random() * 90000)
  );
  const [auditorName, setAuditorName] = useState<string>('Revisoría Fiscal / Auditoría Interna');
  const [approvedBy, setApprovedBy] = useState<string>(settings.approver);
  const [custodianName, setCustodianName] = useState<string>(settings.custodian);
  const [notes, setNotes] = useState<string>(
    'Cierre contable mensual conforme a los decretos 1068 de 2015, 2568 de 2010 y Resolución DIAN 000165. Comprobantes archivados y fondo restituido a $2.000.000 COP.'
  );

  // Calculations
  const totalSpent = useMemo(() => transactions.reduce((acc, t) => acc + t.total, 0), [transactions]);
  const totalSubtotal = useMemo(() => transactions.reduce((acc, t) => acc + t.subtotal, 0), [transactions]);
  const totalIva = useMemo(() => transactions.reduce((acc, t) => acc + t.iva, 0), [transactions]);
  const remainingCash = settings.initialFund - totalSpent;
  const pendingVouchers = vouchers.filter((v) => v.status === 'Pendiente');
  const pendingVouchersTotal = pendingVouchers.reduce((acc, v) => acc + v.amount, 0);

  // Category summary
  const categorySummary = useMemo(() => {
    return CATEGORIES_CONFIG.map((cat) => {
      const catTotal = transactions
        .filter((t) => t.category === cat.id)
        .reduce((sum, t) => sum + t.total, 0);
      const percentage = totalSpent > 0 ? (catTotal / totalSpent) * 100 : 0;
      return {
        category: cat.name,
        total: catTotal,
        percentage: Math.round(percentage * 10) / 10,
        pucCode: cat.pucCode,
      };
    }).filter((c) => c.total > 0);
  }, [transactions, totalSpent]);

  // Submit closing
  const handleExecuteClosing = (e: React.FormEvent) => {
    e.preventDefault();

    if (transactions.length === 0 && totalSpent === 0) {
      if (!window.confirm('No hay gastos registrados en el período actual. ¿Deseas cerrar el mes de todas formas?')) {
        return;
      }
    }

    const actaNumber = `ACM-${settings.currentPeriod.replace(/\s+/g, '-').toUpperCase()}`;
    const closingRecord: MonthlyClosingRecord = {
      id: `closing-${Date.now()}`,
      actaNumber,
      periodLabel: settings.currentPeriod,
      nextPeriodLabel: nextPeriodLabel.trim() || 'Nuevo Período',
      closingDate,
      initialFund: settings.initialFund,
      totalSpent,
      totalSubtotal,
      totalIva,
      remainingCash,
      reimbursementAmount: totalSpent,
      transferOrCheckNumber: transferNumber.trim(),
      custodianName,
      auditorName,
      approvedBy,
      transactionCount: transactions.length,
      transactionsSnapshot: [...transactions],
      vouchersSnapshot: [...vouchers],
      categorySummary,
      status: 'Cerrado y Restituido',
      notes,
    };

    onConfirmClosing(closingRecord);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Cierre de Mes Contable y Restitución del Fondo
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900 text-indigo-300 border border-indigo-700">
                  Paso 4 y 5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Impresos El Día S.A.S. • Liquidación oficial y apertura del nuevo ciclo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleExecuteClosing} className="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto text-xs">
          {/* Top Banner Status */}
          <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">
                Período a Liquidar
              </span>
              <div className="text-xl font-black text-slate-900 font-mono">
                {settings.currentPeriod}
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Se archivarán <strong>{transactions.length} comprobantes</strong> y se emitirá el reembolso para restituir el fondo fijo a {formatCOP(settings.initialFund)}.
              </p>
            </div>

            <div className="text-right sm:text-right bg-white p-3 rounded-lg border border-sky-200 shrink-0">
              <span className="text-[10px] text-slate-500 uppercase block">Valor a Reembolsar</span>
              <span className="text-lg font-black text-indigo-700 font-mono">
                {formatCOP(totalSpent)}
              </span>
            </div>
          </div>

          {/* Balance Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Fondo Fijo</span>
              <span className="text-base font-black text-slate-800 font-mono">
                {formatCOP(settings.initialFund)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Gastado</span>
              <span className="text-base font-black text-rose-600 font-mono">
                - {formatCOP(totalSpent)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Efectivo Sobrante</span>
              <span className="text-base font-black text-emerald-700 font-mono">
                {formatCOP(remainingCash)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Nuevo Fondo</span>
              <span className="text-base font-black text-sky-700 font-mono">
                {formatCOP(settings.initialFund)}
              </span>
            </div>
          </div>

          {/* Pending Vouchers Warning (if any) */}
          {pendingVouchers.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">
                  {pendingVouchers.length} Vale(s) Provisional(es) Activo(s) ({formatCOP(pendingVouchersTotal)})
                </strong>
                <p className="text-[11px] mt-0.5 opacity-90">
                  Estos vales provisionales aún están dentro del plazo de 24 a 48 horas y serán transferidos automáticamente al nuevo período contable ({nextPeriodLabel}) para su posterior legalización con factura.
                </p>
              </div>
            </div>
          )}

          {/* Form Fields: Dates, Banking, Approvals */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50/50">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span>Datos de Restitución y Apertura del Nuevo Período</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Fecha de Corte del Cierre *
                </label>
                <input
                  type="date"
                  required
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nombre del Nuevo Período a Abrir *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Noviembre 2026"
                  value={nextPeriodLabel}
                  onChange={(e) => setNextPeriodLabel(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  No. Transferencia / Comprobante de Egreso (Restitución) *
                </label>
                <input
                  type="text"
                  required
                  value={transferNumber}
                  onChange={(e) => setTransferNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Revisor Fiscal / Auditor *
                </label>
                <input
                  type="text"
                  required
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Custodio Responsable *
                </label>
                <input
                  type="text"
                  required
                  value={custodianName}
                  onChange={(e) => setCustodianName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Aprobación / Ordenación del Gasto *
                </label>
                <input
                  type="text"
                  required
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Observaciones y Notas del Acta de Cierre
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Cierre de Mes y Abrir {nextPeriodLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

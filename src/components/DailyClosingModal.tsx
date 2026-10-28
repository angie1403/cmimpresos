import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Printer,
  X,
  User,
  FileText,
  DollarSign,
  ArrowRightLeft,
  Eye,
  Building,
  Save,
  Coins,
} from 'lucide-react';
import { FundSettings, Transaction, DailyClosingRecord } from '../types/cajaMenor';
import { formatCOP, formatDate } from '../utils/formatters';

interface DailyClosingModalProps {
  settings: FundSettings;
  transactions: Transaction[];
  onSaveDailyClosing: (record: DailyClosingRecord) => void;
  onClose: () => void;
}

export const DailyClosingModal: React.FC<DailyClosingModalProps> = ({
  settings,
  transactions,
  onSaveDailyClosing,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [custodianName, setCustodianName] = useState<string>(settings.custodian);
  const [observations, setObservations] = useState<string>(
    'Cierre diario de operaciones y arqueo de caja menor realizado sin novedades contables.'
  );
  const [previewReceipt, setPreviewReceipt] = useState<Transaction | null>(null);

  // Filter transactions of the selected date
  const dayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  // Daily totals
  const totalExpensesDay = useMemo(() => {
    return dayTransactions.reduce((sum, t) => sum + t.total, 0);
  }, [dayTransactions]);

  const totalAdvanceDay = useMemo(() => {
    return dayTransactions.reduce((sum, t) => sum + (t.cashAdvanceGiven || t.total), 0);
  }, [dayTransactions]);

  const totalChangeReturnedDay = useMemo(() => {
    return dayTransactions.reduce((sum, t) => sum + (t.changeReturned || 0), 0);
  }, [dayTransactions]);

  // Net cash outflow of the day
  const netCashOutflowDay = totalAdvanceDay - totalChangeReturnedDay;

  // Running cash balance estimate
  const currentTotalSpentAll = transactions.reduce((sum, t) => sum + t.total, 0);
  const currentRemainingBalance = settings.initialFund - currentTotalSpentAll;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const actaNum = `ACD-${selectedDate}`;
    const newRecord: DailyClosingRecord = {
      id: `daily-${Date.now()}`,
      actaNumber: actaNum,
      date: selectedDate,
      openingCash: currentRemainingBalance + totalExpensesDay,
      totalExpenses: totalExpensesDay,
      totalCashAdvanceGiven: totalAdvanceDay,
      totalChangeReturned: totalChangeReturnedDay,
      closingCashInDrawer: currentRemainingBalance,
      transactionCount: dayTransactions.length,
      custodianName,
      observations,
      transactionsSnapshot: [...dayTransactions],
      status: 'Cerrado',
      createdAt: new Date().toISOString(),
    };

    onSaveDailyClosing(newRecord);
    alert(`¡Acta de Cierre del Día ${selectedDate} guardada exitosamente!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-6 text-xs">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Cierre del Día (Arqueo Diario de Caja Menor)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
                  Control Diario
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Impresos El Día S.A.S. • Conciliación de quién gastó, valores y devueltas de la jornada
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

        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Date Selector and Summary Top Bar */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-slate-600" />
              <div>
                <label className="font-bold text-slate-700 block text-xs uppercase tracking-wider">
                  Fecha del Cierre Diario:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 text-sm font-semibold bg-white px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 text-right">
              <div>
                <span className="text-[11px] text-slate-500 block">Movimientos del Día:</span>
                <span className="font-black text-slate-900 text-base font-mono">
                  {dayTransactions.length} comprobantes
                </span>
              </div>
            </div>
          </div>

          {/* 3 Metric Cards for the Day */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200">
              <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider block">
                Total Dinero Entregado Hoy
              </span>
              <div className="text-xl font-black text-indigo-900 font-mono mt-1">
                {formatCOP(totalAdvanceDay)}
              </div>
              <span className="text-[10px] text-indigo-600 block mt-0.5">Anticipos salidos de gaveta</span>
            </div>

            <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200">
              <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">
                Total Gastado con Facturas Hoy
              </span>
              <div className="text-xl font-black text-rose-700 font-mono mt-1">
                {formatCOP(totalExpensesDay)}
              </div>
              <span className="text-[10px] text-rose-600 block mt-0.5">Soportes legalizados hoy</span>
            </div>

            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                Total Devueltas Reintegradas Hoy
              </span>
              <div className="text-xl font-black text-emerald-700 font-mono mt-1">
                {formatCOP(totalChangeReturnedDay)}
              </div>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Cambio devuelto a la gaveta</span>
            </div>
          </div>

          {/* Table: Who spent, what they bought, amounts, change returned and supports */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-800 flex items-center justify-between">
              <span>Detalle de Egresos de la Jornada ({formatDate(selectedDate)})</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Verifica responsables, valores y soportes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">¿Quién gastó?</th>
                    <th className="py-2.5 px-3">En qué se gastó</th>
                    <th className="py-2.5 px-3">Factura / Proveedor</th>
                    <th className="py-2.5 px-3 text-right">Dinero Entregado</th>
                    <th className="py-2.5 px-3 text-right">Valor Factura</th>
                    <th className="py-2.5 px-3 text-right">Devuelta a Caja</th>
                    <th className="py-2.5 px-3 text-center">Soporte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dayTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No se registraron gastos para la fecha seleccionada ({selectedDate}).
                      </td>
                    </tr>
                  ) : (
                    dayTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          <div className="flex items-center space-x-1.5">
                            <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{tx.responsiblePerson || 'Carlos Montoya'}</span>
                          </div>
                          {tx.department && (
                            <div className="text-[10px] text-slate-400 pl-5">{tx.department}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate" title={tx.description}>
                          <div className="font-medium">{tx.description}</div>
                          <span className="text-[10px] text-slate-400">{tx.category}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-semibold text-slate-800">{tx.invoiceNumber}</div>
                          <div className="text-[10px] text-slate-400">{tx.provider}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {formatCOP(tx.cashAdvanceGiven || tx.total)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                          {formatCOP(tx.total)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          {formatCOP(tx.changeReturned || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {tx.receiptImage ? (
                            <button
                              type="button"
                              onClick={() => setPreviewReceipt(tx)}
                              className="px-2 py-0.5 rounded text-[10px] bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 inline-flex items-center space-x-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Ver</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">Sin foto</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Custodian Signatures & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Custodio Responsable del Cierre</label>
              <input
                type="text"
                required
                value={custodianName}
                onChange={(e) => setCustodianName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Observaciones del Día</label>
              <input
                type="text"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancelar
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 transition-colors flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Planilla del Día</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Acta de Cierre Diario</span>
              </button>
            </div>
          </div>
        </form>

        {/* Modal Preview Receipt Image */}
        {previewReceipt && (
          <div className="fixed inset-0 bg-slate-900/60 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-4 space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-slate-800">Soporte: {previewReceipt.invoiceNumber}</span>
                <button onClick={() => setPreviewReceipt(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              {previewReceipt.receiptImage && (
                <img src={previewReceipt.receiptImage} alt="Soporte" className="max-h-72 w-full object-contain rounded" />
              )}
              <div className="text-[11px] text-slate-600">
                <div><strong>Proveedor:</strong> {previewReceipt.provider}</div>
                <div><strong>Gastó:</strong> {previewReceipt.responsiblePerson}</div>
                <div><strong>Valor:</strong> {formatCOP(previewReceipt.total)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

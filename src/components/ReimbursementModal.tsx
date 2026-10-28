import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Building,
  Calendar,
  CreditCard,
  FileText,
  X,
} from 'lucide-react';
import { FundSettings, Transaction, ReimbursementRecord } from '../types/cajaMenor';
import { formatCOP } from '../utils/formatters';

interface ReimbursementModalProps {
  settings: FundSettings;
  transactions: Transaction[];
  onConfirmReimbursement: (record: ReimbursementRecord) => void;
  onClose: () => void;
}

export const ReimbursementModal: React.FC<ReimbursementModalProps> = ({
  settings,
  transactions,
  onConfirmReimbursement,
  onClose,
}) => {
  const [transferNumber, setTransferNumber] = useState('TRF-BCOL-' + Math.floor(10000 + Math.random() * 90000));
  const [accountantName, setAccountantName] = useState('Directora Contable / Tesorería');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const totalSpent = transactions.reduce((acc, curr) => acc + curr.total, 0);
  const remainingBalance = settings.initialFund - totalSpent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (totalSpent <= 0) {
      alert('No hay gastos acumulados para reembolsar.');
      return;
    }

    onConfirmReimbursement({
      id: `reimb-${Date.now()}`,
      date,
      periodLabel: settings.currentPeriod,
      amountSpent: totalSpent,
      reimbursedAmount: totalSpent,
      transferOrCheckNumber: transferNumber,
      accountantName,
      transactionCount: transactions.length,
    });

    alert(`¡Fondo de Caja Menor restituido exitosamente a ${formatCOP(settings.initialFund)}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Restitución y Reembolso del Fondo (Paso 5)
              </h3>
              <p className="text-xs text-slate-400">
                Impresos El Día S.A.S. • Liquidación oficial
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount to Reclaim */}
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-center space-y-1">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
              Monto a Girar para Restituir Fondo
            </span>
            <div className="text-3xl font-black text-sky-700 font-mono">
              {formatCOP(totalSpent)}
            </div>
            <p className="text-xs text-slate-500">
              Corresponde exactamente a los {transactions.length} soportes legalizados en el período actual.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Saldo Actual en Gaveta:</span>
              <strong className="text-slate-800 text-sm font-mono">{formatCOP(remainingBalance)}</strong>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 block">Nuevo Saldo tras Restitución:</span>
              <strong className="text-emerald-800 text-sm font-mono">{formatCOP(settings.initialFund)}</strong>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                No. Comprobante de Egreso / Transferencia Bancaria *
              </label>
              <input
                type="text"
                required
                value={transferNumber}
                onChange={(e) => setTransferNumber(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Fecha del Pago / Reembolso *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Aprobado y Girado por (Contabilidad / Tesorería) *
              </label>
              <input
                type="text"
                required
                value={accountantName}
                onChange={(e) => setAccountantName(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar y Restituir Fondo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

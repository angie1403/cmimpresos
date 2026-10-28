import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { Transaction, FundSettings } from '../types/cajaMenor';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { formatCOP, formatDate } from '../utils/formatters';

interface PrintSheetProps {
  transactions: Transaction[];
  settings: FundSettings;
  onClose: () => void;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({
  transactions,
  settings,
  onClose,
}) => {
  const totalSpent = transactions.reduce((acc, curr) => acc + curr.total, 0);
  const totalSubtotal = transactions.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalIva = transactions.reduce((acc, curr) => acc + curr.iva, 0);
  const remainingBalance = settings.initialFund - totalSpent;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 overflow-y-auto p-4 sm:p-8 flex justify-center">
      {/* Top Floating Action Bar (Hidden during print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 print:hidden bg-slate-900/90 p-2 rounded-xl border border-slate-700 shadow-2xl">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow flex items-center space-x-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Guardar como PDF</span>
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Official Printable Sheet Container */}
      <div className="bg-white text-slate-900 max-w-4xl w-full p-8 sm:p-12 shadow-2xl rounded-2xl print:shadow-none print:p-0 print:m-0 print:max-w-none text-xs">
        {/* Header Membretado Oficial */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                {settings.companyName}
              </h1>
              <div className="text-xs font-mono font-bold text-slate-600">
                NIT: {settings.companyNit} • Régimen Común / Responsable de IVA
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                PLANILLA OFICIAL DE LEGALIZACIÓN Y REEMBOLSO DE CAJA MENOR
              </div>
            </div>
            <div className="text-right border border-slate-300 p-2.5 rounded-lg bg-slate-50">
              <div className="text-[10px] uppercase font-bold text-slate-500">
                Período Contable
              </div>
              <div className="font-bold text-sm text-slate-900 font-mono">
                {settings.currentPeriod}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Fecha: {new Date().toLocaleDateString('es-CO')}
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Fondos y Saldos */}
        <div className="grid grid-cols-3 gap-3 mb-6 border border-slate-300 rounded-lg p-3 bg-slate-50 font-mono text-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 font-sans">
              1. Fondo Asignado
            </div>
            <div className="text-base font-black text-slate-900">
              {formatCOP(settings.initialFund)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 font-sans">
              2. Total Gastado
            </div>
            <div className="text-base font-black text-rose-600">
              - {formatCOP(totalSpent)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 font-sans">
              3. Saldo Restante
            </div>
            <div className="text-base font-black text-emerald-700">
              {formatCOP(remainingBalance)}
            </div>
          </div>
        </div>

        {/* Tabla Detallada de Movimientos */}
        <div className="mb-6">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
            Detalle Cronológico de Comprobantes Legalizados
          </h2>
          <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700 uppercase text-[10px]">
                <th className="p-2 border-r border-slate-300">Fecha</th>
                <th className="p-2 border-r border-slate-300">¿Quién gastó?</th>
                <th className="p-2 border-r border-slate-300">Factura / Vale</th>
                <th className="p-2 border-r border-slate-300">Proveedor / NIT</th>
                <th className="p-2 border-r border-slate-300">Concepto del Gasto</th>
                <th className="p-2 border-r border-slate-300 text-right">Gasto Factura</th>
                <th className="p-2 text-right">Devuelta a Caja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-200">
                  <td className="p-1.5 border-r border-slate-200 whitespace-nowrap">
                    {formatDate(tx.date)}
                  </td>
                  <td className="p-1.5 border-r border-slate-200 font-medium">
                    {tx.responsiblePerson || 'Carlos Montoya'}
                  </td>
                  <td className="p-1.5 border-r border-slate-200 font-mono font-medium">
                    {tx.invoiceNumber}
                  </td>
                  <td className="p-1.5 border-r border-slate-200">
                    <div>{tx.provider}</div>
                    <div className="font-mono text-[9px] text-slate-500">NIT: {tx.nit}</div>
                  </td>
                  <td className="p-1.5 border-r border-slate-200">{tx.description}</td>
                  <td className="p-1.5 border-r border-slate-200 text-right font-mono font-bold">
                    {formatCOP(tx.total)}
                  </td>
                  <td className="p-1.5 text-right font-mono text-emerald-700 font-semibold">
                    {(tx.changeReturned || 0) > 0 ? formatCOP(tx.changeReturned || 0) : '$ 0'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                <td colSpan={5} className="p-2 text-right uppercase border-r border-slate-300">
                  Total Legalizado del Período ({transactions.length} comprobantes):
                </td>
                <td className="p-2 text-right font-mono text-slate-900 border-r border-slate-300 font-bold">
                  {formatCOP(totalSpent)}
                </td>
                <td className="p-2 text-right font-mono text-emerald-700 font-bold">
                  {formatCOP(transactions.reduce((acc, t) => acc + (t.changeReturned || 0), 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Resumen por Cuentas PUC */}
        <div className="mb-8">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
            Imputación Contable Resumida (P.U.C. Clase 5 Gastos)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            {CATEGORIES_CONFIG.map((cat) => {
              const catTotal = transactions
                .filter((t) => t.category === cat.id)
                .reduce((s, t) => s + t.total, 0);
              if (catTotal === 0) return null;
              return (
                <div key={cat.id} className="p-2 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-indigo-700 font-mono">PUC {cat.pucCode}</div>
                  <div className="text-slate-600 truncate">{cat.name}</div>
                  <div className="font-mono font-bold text-slate-900 mt-1">{formatCOP(catTotal)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Firmas de Legalización y Control Interno */}
        <div className="pt-10 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="border-b border-slate-400 pb-1 mb-2"></div>
            <div className="font-bold text-slate-900">{settings.custodian}</div>
            <div className="text-[10px] text-slate-500">Custodio Responsable</div>
            <div className="text-[10px] text-slate-400 mt-0.5">C.C. ___________________</div>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-1 mb-2"></div>
            <div className="font-bold text-slate-900">Revisoría Fiscal / Auditoría</div>
            <div className="text-[10px] text-slate-500">Verificación y Control Interno</div>
            <div className="text-[10px] text-slate-400 mt-0.5">T.P. No. _________________</div>
          </div>

          <div>
            <div className="border-b border-slate-400 pb-1 mb-2"></div>
            <div className="font-bold text-slate-900">{settings.approver}</div>
            <div className="text-[10px] text-slate-500">Aprobación y Ordenación de Gasto</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Fecha: _______________</div>
          </div>
        </div>
      </div>
    </div>
  );
};

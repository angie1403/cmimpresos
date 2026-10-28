import React, { useState } from 'react';
import {
  CalendarDays,
  FileCheck2,
  Printer,
  Eye,
  CheckCircle2,
  RotateCcw,
  Building,
  TrendingDown,
  Coins,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  FundSettings,
  Transaction,
  ProvisionalVoucher,
  MonthlyClosingRecord,
} from '../types/cajaMenor';
import { formatCOP, formatDate } from '../utils/formatters';

interface MonthClosingHistoryViewProps {
  settings: FundSettings;
  transactions: Transaction[];
  vouchers: ProvisionalVoucher[];
  monthlyClosings: MonthlyClosingRecord[];
  onOpenCloseMonthModal: () => void;
}

export const MonthClosingHistoryView: React.FC<MonthClosingHistoryViewProps> = ({
  settings,
  transactions,
  vouchers,
  monthlyClosings,
  onOpenCloseMonthModal,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<MonthlyClosingRecord | null>(null);

  const totalSpentCurrent = transactions.reduce((acc, t) => acc + t.total, 0);
  const remainingCashCurrent = settings.initialFund - totalSpentCurrent;
  const spentPct = Math.min(100, Math.round((totalSpentCurrent / settings.initialFund) * 100));

  return (
    <div className="space-y-6">
      {/* Current Month Active Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Período Contable en Curso
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1">
              {settings.currentPeriod}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fondo asignado: {formatCOP(settings.initialFund)} • Custodio: {settings.custodian}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenCloseMonthModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Ejecutar Cierre de Mes</span>
            </button>
          </div>
        </div>

        {/* Current Period Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
              Comprobantes Activos
            </span>
            <div className="text-xl font-black text-slate-800 font-mono">
              {transactions.length} registrados
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Pendientes de cierre contable
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
              Gastos del Período ({spentPct}%)
            </span>
            <div className="text-xl font-black text-rose-600 font-mono">
              {formatCOP(totalSpentCurrent)}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full ${spentPct >= 70 ? 'bg-amber-500' : 'bg-sky-500'}`}
                style={{ width: `${spentPct}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
              Saldo Disponible
            </span>
            <div className="text-xl font-black text-emerald-700 font-mono">
              {formatCOP(remainingCashCurrent)}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              A restituir al cierre: {formatCOP(totalSpentCurrent)}
            </span>
          </div>
        </div>
      </div>

      {/* Historical Monthly Closings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Historial de Cierres de Mes y Actas Archivadas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro histórico inmutable de liquidaciones contables y restituciones del fondo
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-full">
            {monthlyClosings.length} cierres archivados
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {monthlyClosings.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileCheck2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">Aún no hay cierres mensuales archivados</p>
              <p className="text-xs text-slate-400 mt-1">
                Al finalizar cada ciclo mensual, presiona el botón "Ejecutar Cierre de Mes" para archivar y restituir el fondo.
              </p>
            </div>
          ) : (
            monthlyClosings.map((closing) => (
              <div
                key={closing.id}
                className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm font-mono">
                      {closing.periodLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {closing.status}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      Acta: {closing.actaNumber}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Fecha de Corte: <strong className="text-slate-800">{formatDate(closing.closingDate)}</strong> • Transferencia/Cheque:{' '}
                    <span className="font-mono text-indigo-700 font-semibold">{closing.transferOrCheckNumber}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Custodio: {closing.custodianName} • Auditor: {closing.auditorName}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Liquidado</div>
                    <div className="text-base font-black text-slate-900 font-mono">
                      {formatCOP(closing.totalSpent)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {closing.transactionCount} comprobantes
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRecord(closing)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors flex items-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>Ver Acta</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: View Acta de Cierre */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-6 text-xs">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Acta Oficial de Cierre Mensual</h3>
                <p className="text-xs text-slate-400">
                  {selectedRecord.actaNumber} • {selectedRecord.periodLabel}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-sm text-slate-800">
                  Impresos El Día S.A.S. - Nit: {settings.companyNit}
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Planilla de Liquidación y Restitución de Caja Menor • Período: {selectedRecord.periodLabel}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Fondo Asignado:</span>
                  <strong className="font-mono text-slate-900">{formatCOP(selectedRecord.initialFund)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Gastos:</span>
                  <strong className="font-mono text-rose-600">{formatCOP(selectedRecord.totalSpent)}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Valor Reembolsado:</span>
                  <strong className="font-mono text-indigo-700">{formatCOP(selectedRecord.reimbursementAmount)}</strong>
                </div>
              </div>

              {/* Category Summary in Acta */}
              {selectedRecord.categorySummary && selectedRecord.categorySummary.length > 0 && (
                <div>
                  <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">
                    Distribución por Cuentas P.U.C. (Clase 5 Gastos)
                  </h5>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                    {selectedRecord.categorySummary.map((c, i) => (
                      <div key={i} className="p-2 flex justify-between">
                        <span className="text-slate-700">
                          <strong className="font-mono text-indigo-700 mr-2">PUC {c.pucCode}</strong>
                          {c.category}
                        </span>
                        <span className="font-mono font-bold text-slate-900">{formatCOP(c.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-lg text-slate-600 text-[11px] space-y-1">
                <div><strong>Comprobante de Restitución:</strong> {selectedRecord.transferOrCheckNumber}</div>
                <div><strong>Notas:</strong> {selectedRecord.notes}</div>
              </div>

              <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-[10px]">
                <div>
                  <div className="border-b border-slate-300 pb-1 mb-1"></div>
                  <strong>{selectedRecord.custodianName}</strong>
                  <div className="text-slate-400">Custodio Responsable</div>
                </div>
                <div>
                  <div className="border-b border-slate-300 pb-1 mb-1"></div>
                  <strong>{selectedRecord.auditorName}</strong>
                  <div className="text-slate-400">Revisor Fiscal / Auditor</div>
                </div>
                <div>
                  <div className="border-b border-slate-300 pb-1 mb-1"></div>
                  <strong>{selectedRecord.approvedBy}</strong>
                  <div className="text-slate-400">Gerencia / Aprobador</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Acta</span>
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

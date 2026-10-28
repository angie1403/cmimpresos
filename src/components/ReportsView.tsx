import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart,
  FileSpreadsheet,
  Printer,
  Download,
  Building,
  TrendingUp,
  Percent,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  User,
  ArrowRightLeft,
  Coins,
  Eye,
  X,
} from 'lucide-react';
import { Transaction, ExpenseCategory, FundSettings, CashArqueoRecord } from '../types/cajaMenor';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { formatCOP, formatDate } from '../utils/formatters';

interface ReportsViewProps {
  transactions: Transaction[];
  settings: FundSettings;
  arqueoHistory: CashArqueoRecord[];
  onExportCSV: () => void;
  onPrintOfficial: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  settings,
  arqueoHistory,
  onExportCSV,
  onPrintOfficial,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<
    'responsible' | 'categories' | 'taxes' | 'reimbursement' | 'arqueos'
  >('responsible');

  const [previewReceipt, setPreviewReceipt] = useState<Transaction | null>(null);

  const totalSpent = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + curr.total, 0);
  }, [transactions]);

  const totalAdvanceGiven = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + (curr.cashAdvanceGiven || curr.total), 0);
  }, [transactions]);

  const totalChangeReturned = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + (curr.changeReturned || 0), 0);
  }, [transactions]);

  const totalSubtotal = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + curr.subtotal, 0);
  }, [transactions]);

  const totalIva = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + curr.iva, 0);
  }, [transactions]);

  // Breakdown by Responsible Person (Quién gastó, cuánto gastó, devuelta)
  const responsibleBreakdown = useMemo(() => {
    const map: {
      [person: string]: {
        person: string;
        department: string;
        count: number;
        totalSpent: number;
        totalAdvance: number;
        totalChange: number;
        invoices: string[];
      };
    } = {};

    transactions.forEach((tx) => {
      const personKey = tx.responsiblePerson || 'Custodio General';
      if (!map[personKey]) {
        map[personKey] = {
          person: personKey,
          department: tx.department || 'Operaciones',
          count: 0,
          totalSpent: 0,
          totalAdvance: 0,
          totalChange: 0,
          invoices: [],
        };
      }
      map[personKey].count += 1;
      map[personKey].totalSpent += tx.total;
      map[personKey].totalAdvance += tx.cashAdvanceGiven || tx.total;
      map[personKey].totalChange += tx.changeReturned || 0;
      map[personKey].invoices.push(tx.invoiceNumber);
    });

    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [transactions]);

  // Breakdown by Category
  const categoryBreakdown = useMemo(() => {
    const map: { [key: string]: { total: number; count: number; subtotal: number; iva: number } } = {};

    CATEGORIES_CONFIG.forEach((cat) => {
      map[cat.id] = { total: 0, count: 0, subtotal: 0, iva: 0 };
    });

    transactions.forEach((tx) => {
      if (!map[tx.category]) {
        map[tx.category] = { total: 0, count: 0, subtotal: 0, iva: 0 };
      }
      map[tx.category].total += tx.total;
      map[tx.category].count += 1;
      map[tx.category].subtotal += tx.subtotal;
      map[tx.category].iva += tx.iva;
    });

    return CATEGORIES_CONFIG.map((cat) => {
      const data = map[cat.id] || { total: 0, count: 0, subtotal: 0, iva: 0 };
      const percentage = totalSpent > 0 ? (data.total / totalSpent) * 100 : 0;
      return {
        ...cat,
        total: data.total,
        count: data.count,
        subtotal: data.subtotal,
        iva: data.iva,
        percentage: Math.round(percentage * 10) / 10,
      };
    }).sort((a, b) => b.total - a.total);
  }, [transactions, totalSpent]);

  // Tax and Third-Party Consolidation (Medios Magnéticos / Exógena DIAN)
  const taxThirdPartyReport = useMemo(() => {
    const providersMap: {
      [nit: string]: {
        provider: string;
        nit: string;
        invoices: string[];
        subtotal: number;
        iva: number;
        total: number;
        docType: string;
      };
    } = {};

    transactions.forEach((tx) => {
      const key = tx.nit || tx.provider;
      if (!providersMap[key]) {
        providersMap[key] = {
          provider: tx.provider,
          nit: tx.nit,
          invoices: [],
          subtotal: 0,
          iva: 0,
          total: 0,
          docType: tx.documentType,
        };
      }
      providersMap[key].invoices.push(tx.invoiceNumber);
      providersMap[key].subtotal += tx.subtotal;
      providersMap[key].iva += tx.iva;
      providersMap[key].total += tx.total;
    });

    return Object.values(providersMap).sort((a, b) => b.total - a.total);
  }, [transactions]);

  const remainingBalance = settings.initialFund - totalSpent;
  const reimbursementAmount = totalSpent;

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-800">
              Informes y Reportes Consolidados de Caja Menor
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
              {settings.companyName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Control de quiénes gastaron, valores, devueltas reintegradas a caja y verificación de soportes
          </p>
        </div>

        <div className="flex items-center space-x-2 self-stretch md:self-auto">
          <button
            onClick={onExportCSV}
            className="flex-1 md:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV</span>
          </button>
          <button
            onClick={onPrintOfficial}
            className="flex-1 md:flex-none px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Planilla / PDF</span>
          </button>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex space-x-1.5 sm:space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('responsible')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeReportTab === 'responsible'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>1. Responsables, Gastos y Devueltas</span>
        </button>
        <button
          onClick={() => setActiveReportTab('categories')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeReportTab === 'categories'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          2. Gastos por Categoría & PUC
        </button>
        <button
          onClick={() => setActiveReportTab('taxes')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeReportTab === 'taxes'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          3. Consolidado Tributario & Terceros
        </button>
        <button
          onClick={() => setActiveReportTab('reimbursement')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeReportTab === 'reimbursement'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          4. Solicitud de Reembolso
        </button>
        <button
          onClick={() => setActiveReportTab('arqueos')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeReportTab === 'arqueos'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          5. Arqueos ({arqueoHistory.length})
        </button>
      </div>

      {/* REPORT TAB 1: RESPONSIBLES, WHO SPENT, DEVUELTAS & SOPORTES */}
      {activeReportTab === 'responsible' && (
        <div className="space-y-6">
          {/* Summary KPIs: Entregado, Gastado, Devuelto */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                Total Dinero Entregado
              </span>
              <div className="text-2xl font-black text-indigo-900 font-mono mt-1">
                {formatCOP(totalAdvanceGiven)}
              </div>
              <span className="text-xs text-slate-500 block mt-1">
                Anticipos en mano de colaboradores
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                Total Valor Facturas (Gastado Real)
              </span>
              <div className="text-2xl font-black text-rose-600 font-mono mt-1">
                {formatCOP(totalSpent)}
              </div>
              <span className="text-xs text-slate-500 block mt-1">
                {transactions.length} comprobantes formalmente legalizados
              </span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Total Devueltas Reintegradas a Caja
              </span>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                {formatCOP(totalChangeReturned)}
              </div>
              <span className="text-xs text-slate-500 block mt-1">
                Vuelto devuelto en efectivo a gaveta
              </span>
            </div>
          </div>

          {/* Detailed Transaction Table with Who Spent, What, Amount, Change, and Support */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Planilla Detallada: Quiénes Gastaron, Concepto, Devuelta y Soportes
                </h3>
                <p className="text-xs text-slate-500">
                  Seguimiento exacto de cada egreso con auditoría de cambio devuelto y factura
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Fecha</th>
                    <th className="py-3 px-3">¿Quién gastó?</th>
                    <th className="py-3 px-3">En qué se gastó</th>
                    <th className="py-3 px-3">No. Factura / Proveedor</th>
                    <th className="py-3 px-3 text-right">Dinero Entregado</th>
                    <th className="py-3 px-3 text-right">¿Cuánto fue? (Factura)</th>
                    <th className="py-3 px-3 text-right">Devuelta a Caja</th>
                    <th className="py-3 px-3 text-center">Soporte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                        {formatDate(tx.date)}
                      </td>

                      {/* Quién gastó */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{tx.responsiblePerson || 'Custodio General'}</span>
                        </div>
                        {tx.department && (
                          <div className="text-[10px] text-slate-500 pl-5">{tx.department}</div>
                        )}
                      </td>

                      {/* En qué se gastó */}
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-medium text-slate-800 truncate" title={tx.description}>
                          {tx.description}
                        </div>
                        <span className="text-[10px] text-slate-500 inline-block bg-slate-100 px-1.5 py-0.2 rounded mt-0.5">
                          {tx.category}
                        </span>
                      </td>

                      {/* Factura y Proveedor */}
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-800">{tx.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          {tx.provider}
                        </div>
                      </td>

                      {/* Dinero Entregado */}
                      <td className="py-3 px-3 text-right font-mono font-semibold text-indigo-900">
                        {formatCOP(tx.cashAdvanceGiven || tx.total)}
                      </td>

                      {/* Cuánto fue el gasto real */}
                      <td className="py-3 px-3 text-right font-mono font-black text-rose-600">
                        {formatCOP(tx.total)}
                      </td>

                      {/* Devuelta */}
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {(tx.changeReturned || 0) > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            + {formatCOP(tx.changeReturned || 0)}
                          </span>
                        ) : (
                          <span className="text-slate-400">$ 0</span>
                        )}
                      </td>

                      {/* Soporte */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {tx.receiptImage ? (
                          <button
                            onClick={() => setPreviewReceipt(tx)}
                            className="px-2.5 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-medium inline-flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Ver Factura</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Sin archivo</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                  <tr>
                    <td colSpan={4} className="py-3 px-3 text-right uppercase">
                      Totales Generales ({transactions.length} registros):
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-indigo-900">
                      {formatCOP(totalAdvanceGiven)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-600">
                      {formatCOP(totalSpent)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">
                      {formatCOP(totalChangeReturned)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Resumen Agrupado por Responsable */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Consolidado Acumulado por Colaborador / Responsable
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {responsibleBreakdown.map((r, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-slate-900 block text-xs">{r.person}</strong>
                      <span className="text-[10px] text-slate-500">{r.department}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                      {r.count} gastos
                    </span>
                  </div>
                  <div className="text-[11px] pt-1 border-t border-slate-200/80 space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Entregado:</span>
                      <span className="font-mono">{formatCOP(r.totalAdvance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gastado:</span>
                      <strong className="font-mono text-rose-600">{formatCOP(r.totalSpent)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Devuelta Reintegrada:</span>
                      <span className="font-mono text-emerald-700 font-bold">{formatCOP(r.totalChange)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REPORT TAB 2: CATEGORIES & PUC */}
      {activeReportTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-600" />
              <span>Distribución Porcentual</span>
            </h3>

            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[170px]">
                      {cat.name}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{cat.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex justify-between mb-1">
                <span>Subtotal Base:</span>
                <strong className="text-slate-800 font-mono">{formatCOP(totalSubtotal)}</strong>
              </div>
              <div className="flex justify-between mb-1">
                <span>IVA Discriminado:</span>
                <strong className="text-slate-800 font-mono">{formatCOP(totalIva)}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                <span>Total General:</span>
                <span className="font-mono text-rose-600">{formatCOP(totalSpent)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">
                Detalle Analítico por Centro de Costos y Cuentas P.U.C.
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Cuenta P.U.C.</th>
                    <th className="py-2.5 px-3">Categoría de Gasto</th>
                    <th className="py-2.5 px-3 text-center">Facturas</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                    <th className="py-2.5 px-3 text-right">IVA</th>
                    <th className="py-2.5 px-3 text-right">Total Pagado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {categoryBreakdown.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                        {cat.pucCode}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {cat.name}
                      </td>
                      <td className="py-2.5 px-3 text-center">{cat.count}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCOP(cat.subtotal)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">{formatCOP(cat.iva)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCOP(cat.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                  <tr>
                    <td colSpan={2} className="py-3 px-3 uppercase">Total Consolidado</td>
                    <td className="py-3 px-3 text-center">{transactions.length}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatCOP(totalSubtotal)}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatCOP(totalIva)}</td>
                    <td className="py-3 px-3 text-right font-mono text-rose-600 text-sm">
                      {formatCOP(totalSpent)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT TAB 3: TAXES & EXÓGENA DIAN */}
      {activeReportTab === 'taxes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">
              Consolidado Tributario por Proveedor / Tercero (Medios Magnéticos DIAN)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Acumulado de pagos por NIT para control de topes de retención en la fuente (Retefuente, ReteIVA, ReteICA)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">NIT / Cédula</th>
                  <th className="py-3 px-3">Razón Social / Proveedor</th>
                  <th className="py-3 px-3">Tipo Soporte</th>
                  <th className="py-3 px-3">Facturas Asociadas</th>
                  <th className="py-3 px-3 text-right">Base Gravable</th>
                  <th className="py-3 px-3 text-right">IVA Pagado</th>
                  <th className="py-3 px-4 text-right">Total Acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taxThirdPartyReport.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.nit}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{t.provider}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                        {t.docType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      {t.invoices.join(', ')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{formatCOP(t.subtotal)}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">{formatCOP(t.iva)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCOP(t.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT TAB 4: REIMBURSEMENT SUMMARY */}
      {activeReportTab === 'reimbursement' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-5">
          <div className="text-center pb-4 border-b border-slate-200">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 uppercase">
              Liquidación de Reembolso de Caja Menor
            </span>
            <h3 className="text-xl font-black text-slate-800 mt-2">
              {settings.companyName}
            </h3>
            <p className="text-xs text-slate-500">Período Contable: {settings.currentPeriod}</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Fondo Fijo Constituido:</span>
              <strong className="font-mono text-slate-900">{formatCOP(settings.initialFund)}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Gastos Legalizados en el Período:</span>
              <strong className="font-mono text-rose-600">- {formatCOP(totalSpent)}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Saldo Disponible en Caja al Cierre:</span>
              <strong className="font-mono text-emerald-700">{formatCOP(remainingBalance)}</strong>
            </div>
            <div className="flex justify-between py-3 bg-sky-50 rounded-xl px-4 border border-sky-200 text-base">
              <span className="font-bold text-sky-900">Monto Exacto a Girar / Reembolsar:</span>
              <strong className="font-mono font-black text-sky-700">{formatCOP(reimbursementAmount)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* REPORT TAB 5: ARQUEOS HISTORY */}
      {activeReportTab === 'arqueos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">
              Actas y Registro Histórico de Arqueos Sorpresa (Paso 6)
            </h3>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {arqueoHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No se han registrado actas de arqueo en esta sesión. Abre la pestaña "Arqueo Sorpresa" para realizar uno.
              </div>
            ) : (
              arqueoHistory.map((arq) => (
                <div key={arq.id} className="p-4 hover:bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{formatDate(arq.date)}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          arq.status === 'Cuadrado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {arq.status}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      Total: {formatCOP(arq.totalAudited)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 text-[11px]">
                    <div>Efectivo: {formatCOP(arq.physicalCashTotal)}</div>
                    <div>Vales: {formatCOP(arq.provisionalVouchersTotal)}</div>
                    <div>Facturas: {formatCOP(arq.registeredReceiptsTotal)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Preview Receipt Support */}
      {previewReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  Soporte de Factura: {previewReceipt.invoiceNumber}
                </h4>
                <p className="text-xs text-slate-500">
                  {previewReceipt.provider} • {previewReceipt.responsiblePerson}
                </p>
              </div>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewReceipt.receiptImage ? (
              <img
                src={previewReceipt.receiptImage}
                alt="Soporte digital"
                className="max-h-80 w-full object-contain rounded-lg border border-slate-200"
              />
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p>No hay foto adjunta para esta factura</p>
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Quién gastó:</span>
                <strong className="text-slate-800">{previewReceipt.responsiblePerson}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">En qué se gastó:</span>
                <span className="text-slate-800 text-right">{previewReceipt.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dinero Entregado:</span>
                <span className="font-mono text-indigo-900">{formatCOP(previewReceipt.cashAdvanceGiven || previewReceipt.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valor Factura:</span>
                <strong className="font-mono text-rose-600">{formatCOP(previewReceipt.total)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Devuelta Reintegrada:</span>
                <strong className="font-mono text-emerald-700">{formatCOP(previewReceipt.changeReturned || 0)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

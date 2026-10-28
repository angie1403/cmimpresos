import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Eye,
  FileText,
  Calendar,
  Building,
  CheckCircle,
  Tag,
  AlertCircle,
  Download,
} from 'lucide-react';
import { Transaction, ExpenseCategory, FundSettings } from '../types/cajaMenor';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { formatCOP, formatDate } from '../utils/formatters';

interface KardexTableProps {
  transactions: Transaction[];
  settings: FundSettings;
  onDeleteTransaction: (id: string) => void;
  onExportCSV: () => void;
}

export const KardexTable: React.FC<KardexTableProps> = ({
  transactions,
  settings,
  onDeleteTransaction,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [previewReceipt, setPreviewReceipt] = useState<Transaction | null>(null);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.responsiblePerson && tx.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        tx.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.voucherNumber && tx.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || tx.category === selectedCategory;

      const matchesDocType =
        selectedDocType === 'all' || tx.documentType === selectedDocType;

      return matchesSearch && matchesCategory && matchesDocType;
    });
  }, [transactions, searchTerm, selectedCategory, selectedDocType]);

  // Compute running balance in chronological order
  const chronologicalSorted = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredTransactions]);

  // Compute running balances
  const runningBalances = useMemo(() => {
    let currentBalance = settings.initialFund;
    const balanceMap: { [id: string]: number } = {};

    chronologicalSorted.forEach((tx) => {
      currentBalance -= tx.total;
      balanceMap[tx.id] = currentBalance;
    });

    return balanceMap;
  }, [chronologicalSorted, settings.initialFund]);

  const totalFilteredOut = filteredTransactions.reduce((acc, t) => acc + t.total, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      {/* Header and Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-800">
                Kárdex Auxiliar y Libro de Movimientos
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
                {filteredTransactions.length} registros
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Control cronológico de egresos con cálculo automático de saldo disponible diario
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onExportCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar proveedor, NIT, factura, vale..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            >
              <option value="all">Todas las Categorías</option>
              {CATEGORIES_CONFIG.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Doc Type Filter */}
          <div>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            >
              <option value="all">Todos los Comprobantes DIAN</option>
              <option value="Factura Electrónica">Factura Electrónica</option>
              <option value="Tiquete POS">Tiquete POS</option>
              <option value="Documento Soporte">Documento Soporte</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-3">Fecha</th>
              <th className="py-3 px-3">¿Quién gastó?</th>
              <th className="py-3 px-3">Factura / Vale</th>
              <th className="py-3 px-3">Proveedor / NIT</th>
              <th className="py-3 px-3">Concepto / Destino</th>
              <th className="py-3 px-3 text-right">Gasto Factura</th>
              <th className="py-3 px-3 text-right">Devuelta</th>
              <th className="py-3 px-3 text-right">Saldo Caja</th>
              <th className="py-3 px-3 text-center">Soporte</th>
              <th className="py-3 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {chronologicalSorted.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="w-8 h-8 text-slate-300" />
                    <p className="font-medium text-slate-600">No se encontraron movimientos registrados</p>
                    <p className="text-xs text-slate-400">
                      Utiliza el formulario superior para registrar una factura o tiquete.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              chronologicalSorted.map((tx) => {
                const catConfig = CATEGORIES_CONFIG.find((c) => c.id === tx.category);
                const runningBal = runningBalances[tx.id] ?? 0;

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Fecha */}
                    <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>

                    {/* Quién gastó */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {tx.responsiblePerson || 'Custodio General'}
                      </div>
                      {tx.department && (
                        <div className="text-[10px] text-slate-400">{tx.department}</div>
                      )}
                    </td>

                    {/* Vale / Factura */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-slate-800 font-semibold">{tx.invoiceNumber}</div>
                      {tx.voucherNumber && (
                        <span className="inline-block px-1.5 py-0.2 text-[10px] bg-slate-100 text-slate-600 rounded font-mono">
                          {tx.voucherNumber}
                        </span>
                      )}
                    </td>

                    {/* Proveedor y NIT */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 truncate max-w-[150px]" title={tx.provider}>
                        {tx.provider}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">NIT: {tx.nit}</div>
                    </td>

                    {/* Concepto / Descripción */}
                    <td className="py-3 px-3 max-w-xs truncate text-slate-700" title={tx.description}>
                      <span className="font-medium text-slate-800">{tx.description}</span>
                      <div className="text-[10px] text-slate-400">{tx.category}</div>
                    </td>

                    {/* Salida Factura (COP) */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 whitespace-nowrap">
                      - {formatCOP(tx.total)}
                    </td>

                    {/* Devuelta Reintegrada */}
                    <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                      {(tx.changeReturned || 0) > 0 ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] border border-emerald-200">
                          +{formatCOP(tx.changeReturned || 0)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">$0</span>
                      )}
                    </td>

                    {/* Saldo Diario */}
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                        runningBal < 600000 ? 'text-amber-600' : 'text-emerald-700'
                      }`}
                    >
                      {formatCOP(runningBal)}
                    </td>

                    {/* Soporte / Estado DIAN */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          tx.complianceStatus === 'Válido DIAN'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {tx.documentType === 'Factura Electrónica' ? 'FE' : tx.documentType === 'Tiquete POS' ? 'POS' : 'DS'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        {tx.receiptImage && (
                          <button
                            onClick={() => setPreviewReceipt(tx)}
                            title="Ver soporte adjunto"
                            className="p-1 rounded text-sky-600 hover:bg-sky-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Seguro que deseas eliminar el gasto a "${tx.provider}"?`)) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          title="Eliminar gasto"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Footer Summary */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center space-x-2">
          <span>Mostrando {filteredTransactions.length} de {transactions.length} comprobantes</span>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <span>Total Salidas Filtradas: </span>
            <strong className="font-mono text-rose-600 text-sm">{formatCOP(totalFilteredOut)}</strong>
          </div>
        </div>
      </div>

      {/* Modal Preview Receipt */}
      {previewReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Soporte Digital de Factura</h4>
                <p className="text-xs text-slate-400">{previewReceipt.provider} • {previewReceipt.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto flex flex-col items-center">
              {previewReceipt.receiptImage ? (
                <img
                  src={previewReceipt.receiptImage}
                  alt="Soporte de factura"
                  className="rounded-lg max-h-96 object-contain border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No hay imagen adjunta para este registro</p>
                </div>
              )}
              <div className="w-full mt-4 p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Monto Total:</span>
                  <strong className="text-slate-800 font-mono">{formatCOP(previewReceipt.total)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Categoría:</span>
                  <span className="text-slate-800">{previewReceipt.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Descripción:</span>
                  <span className="text-slate-800 text-right">{previewReceipt.description}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

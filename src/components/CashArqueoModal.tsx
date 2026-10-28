import React, { useState, useMemo } from 'react';
import {
  Scale,
  Coins,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  UserCheck,
  Save,
  Clock,
  Plus,
} from 'lucide-react';
import { FundSettings, Transaction, ProvisionalVoucher, CashArqueoRecord } from '../types/cajaMenor';
import { formatCOP } from '../utils/formatters';

interface CashArqueoModalProps {
  settings: FundSettings;
  transactions: Transaction[];
  vouchers: ProvisionalVoucher[];
  onAddVoucher: (voucher: Omit<ProvisionalVoucher, 'id'>) => void;
  onSaveArqueo: (record: CashArqueoRecord) => void;
  onClose: () => void;
}

export const CashArqueoModal: React.FC<CashArqueoModalProps> = ({
  settings,
  transactions,
  vouchers,
  onAddVoucher,
  onSaveArqueo,
  onClose,
}) => {
  // Cash denomination counts
  const [b100k, setB100k] = useState<number>(5);
  const [b50k, setB50k] = useState<number>(8);
  const [b20k, setB20k] = useState<number>(4);
  const [b10k, setB10k] = useState<number>(6);
  const [b5k, setB5k] = useState<number>(4);
  const [b2k, setB2k] = useState<number>(5);
  const [coins, setCoins] = useState<number>(10000);

  // Signatures / Audit details
  const [auditorName, setAuditorName] = useState('Revisoría Fiscal / Auditoría Interna');
  const [custodianName, setCustodianName] = useState(settings.custodian);
  const [observations, setObservations] = useState('Arqueo periódico sorpresa sin novedades contables.');

  // New Voucher quick subform
  const [showAddVoucher, setShowAddVoucher] = useState(false);
  const [newVoucherBeneficiary, setNewVoucherBeneficiary] = useState('');
  const [newVoucherDept, setNewVoucherDept] = useState('Taller Litografía');
  const [newVoucherAmount, setNewVoucherAmount] = useState('');
  const [newVoucherPurpose, setNewVoucherPurpose] = useState('');

  // Physical cash total
  const physicalCashTotal = useMemo(() => {
    return (
      b100k * 100000 +
      b50k * 50000 +
      b20k * 20000 +
      b10k * 10000 +
      b5k * 5000 +
      b2k * 2000 +
      (coins || 0)
    );
  }, [b100k, b50k, b20k, b10k, b5k, b2k, coins]);

  // Vouchers total (active only)
  const pendingVouchers = vouchers.filter((v) => v.status === 'Pendiente');
  const pendingVouchersTotal = pendingVouchers.reduce((sum, v) => sum + v.amount, 0);

  // Transactions total
  const registeredReceiptsTotal = transactions.reduce((sum, t) => sum + t.total, 0);

  // EQUATION from Manual Paso 6:
  // Efectivo físico + Vales vigentes + Facturas pendientes = Fondo Fijo ($2.000.000 COP)
  const totalAudited = physicalCashTotal + pendingVouchersTotal + registeredReceiptsTotal;
  const difference = totalAudited - settings.initialFund;

  const arqueoStatus: 'Cuadrado' | 'Faltante' | 'Sobrante' =
    difference === 0 ? 'Cuadrado' : difference > 0 ? 'Sobrante' : 'Faltante';

  // Handle Add Voucher
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newVoucherAmount);
    if (!amountNum || amountNum <= 0) return;
    if (!newVoucherBeneficiary.trim()) return;

    const nextCode = `VP-${String(vouchers.length + 1).padStart(3, '0')}`;
    onAddVoucher({
      code: nextCode,
      beneficiary: newVoucherBeneficiary.trim(),
      department: newVoucherDept.trim(),
      dateIssued: new Date().toISOString().split('T')[0],
      amount: amountNum,
      purpose: newVoucherPurpose.trim() || 'Anticipo operativo menor',
      status: 'Pendiente',
      deadlineHours: 48,
    });

    setNewVoucherBeneficiary('');
    setNewVoucherAmount('');
    setNewVoucherPurpose('');
    setShowAddVoucher(false);
  };

  // Handle Save Arqueo Record
  const handleSave = () => {
    onSaveArqueo({
      id: `arq-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      auditorName,
      custodianName,
      denominations: { b100k, b50k, b20k, b10k, b5k, b2k, coins },
      physicalCashTotal,
      provisionalVouchersTotal: pendingVouchersTotal,
      registeredReceiptsTotal,
      totalAudited,
      assignedFund: settings.initialFund,
      difference,
      status: arqueoStatus,
      observations,
    });
    alert('¡Acta de Arqueo Sorpresa guardada exitosamente en el historial!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Arqueo Sorpresa de Caja Menor (Paso 6)
              </h3>
              <p className="text-xs text-slate-400">
                Verificación de la Ecuación Contable: Efectivo + Vales + Facturas = {formatCOP(settings.initialFund)}
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

        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* EQUATION STATUS DISPLAY */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              arqueoStatus === 'Cuadrado'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : arqueoStatus === 'Sobrante'
                ? 'bg-sky-50 border-sky-200 text-sky-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-xl ${
                  arqueoStatus === 'Cuadrado'
                    ? 'bg-emerald-100 text-emerald-700'
                    : arqueoStatus === 'Sobrante'
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {arqueoStatus === 'Cuadrado' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  Resultado de la Ecuación
                </div>
                <div className="text-lg font-black tracking-tight">
                  {arqueoStatus === 'Cuadrado' && 'Caja Cuadrada al 100% (Sin Diferencia)'}
                  {arqueoStatus === 'Sobrante' && `Sobrante de Caja: +${formatCOP(difference)}`}
                  {arqueoStatus === 'Faltante' && `Faltante de Caja: ${formatCOP(difference)}`}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  Total Determinado: {formatCOP(totalAudited)} / Fondo Asignado:{' '}
                  {formatCOP(settings.initialFund)}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  arqueoStatus === 'Cuadrado'
                    ? 'bg-emerald-200 text-emerald-800'
                    : arqueoStatus === 'Sobrante'
                    ? 'bg-sky-200 text-sky-800'
                    : 'bg-rose-200 text-rose-800'
                }`}
              >
                {arqueoStatus}
              </span>
            </div>
          </div>

          {/* 3 EQUATION COMPONENTS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                1. Efectivo Físico
              </span>
              <span className="text-lg font-black text-slate-800 font-mono">
                {formatCOP(physicalCashTotal)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Conteo en gaveta</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                2. Vales Vigentes
              </span>
              <span className="text-lg font-black text-indigo-700 font-mono">
                {formatCOP(pendingVouchersTotal)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {pendingVouchers.length} vales pendientes (plazo 24-48h)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                3. Facturas Pendientes
              </span>
              <span className="text-lg font-black text-rose-600 font-mono">
                {formatCOP(registeredReceiptsTotal)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {transactions.length} soportes legalizados
              </span>
            </div>
          </div>

          {/* DENOMINATION COUNTER ACCORDION */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Conteo Físico por Denominación (Pesos Colombianos)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700">
                Total: {formatCOP(physicalCashTotal)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="text-slate-500 block mb-1">$100.000 COP</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={b100k}
                    onChange={(e) => setB100k(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full font-mono font-bold bg-white px-2 py-1 border border-slate-300 rounded text-center"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    ={formatCOP(b100k * 100000)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="text-slate-500 block mb-1">$50.000 COP</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={b50k}
                    onChange={(e) => setB50k(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full font-mono font-bold bg-white px-2 py-1 border border-slate-300 rounded text-center"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    ={formatCOP(b50k * 50000)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="text-slate-500 block mb-1">$20.000 COP</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={b20k}
                    onChange={(e) => setB20k(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full font-mono font-bold bg-white px-2 py-1 border border-slate-300 rounded text-center"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    ={formatCOP(b20k * 20000)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="text-slate-500 block mb-1">$10.000 COP</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={b10k}
                    onChange={(e) => setB10k(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full font-mono font-bold bg-white px-2 py-1 border border-slate-300 rounded text-center"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    ={formatCOP(b10k * 10000)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="text-slate-500 block mb-1">$5.000 COP</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={b5k}
                    onChange={(e) => setB5k(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full font-mono font-bold bg-white px-2 py-1 border border-slate-300 rounded text-center"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    ={formatCOP(b5k * 5000)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="text-slate-500 block mb-1">$2.000 COP</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={b2k}
                    onChange={(e) => setB2k(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full font-mono font-bold bg-white px-2 py-1 border border-slate-300 rounded text-center"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    ={formatCOP(b2k * 2000)}
                  </span>
                </div>
              </div>

              <div className="col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <label className="text-slate-500 block mb-1">Monedas Sueltas Total (COP)</label>
                <input
                  type="number"
                  min="0"
                  value={coins}
                  onChange={(e) => setCoins(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full font-mono font-bold bg-white px-2 py-1 border border-slate-300 rounded text-center"
                />
              </div>
            </div>
          </div>

          {/* VALES PROVISIONALES SECTION */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Vales Provisionales Pendientes de Legalizar
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVoucher(!showAddVoucher)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddVoucher ? 'Cerrar' : '+ Crear Vale Provisional'}</span>
              </button>
            </div>

            {showAddVoucher && (
              <form onSubmit={handleCreateVoucher} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700">Colaborador / Beneficiario *</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Juan Pérez"
                      value={newVoucherBeneficiary}
                      onChange={(e) => setNewVoucherBeneficiary(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700">Área / Departamento</label>
                    <input
                      type="text"
                      value={newVoucherDept}
                      onChange={(e) => setNewVoucherDept(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700">Monto Entregado (COP) *</label>
                    <input
                      type="number"
                      required
                      placeholder="ej. 50000"
                      value={newVoucherAmount}
                      onChange={(e) => setNewVoucherAmount(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="font-semibold text-slate-700">Concepto / Motivo de Urgencia</label>
                    <input
                      type="text"
                      placeholder="Motivo del anticipo de efectivo..."
                      value={newVoucherPurpose}
                      onChange={(e) => setNewVoucherPurpose(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700"
                  >
                    Guardar Vale Provisional
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-slate-100 text-xs">
              {pendingVouchers.length === 0 ? (
                <p className="text-slate-400 py-2">No hay vales provisionales pendientes de legalizar.</p>
              ) : (
                pendingVouchers.map((v) => (
                  <div key={v.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">
                        <span className="font-mono text-indigo-700 mr-2">{v.code}</span>
                        {v.beneficiary} ({v.department})
                      </div>
                      <div className="text-[11px] text-slate-500">{v.purpose}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-800">{formatCOP(v.amount)}</div>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Plazo {v.deadlineHours}h
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* OBSERVATIONS AND SIGNATURES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Auditor / Revisor</label>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Custodio Responsable</label>
              <input
                type="text"
                value={custodianName}
                onChange={(e) => setCustodianName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Observaciones del Arqueo</label>
              <textarea
                rows={2}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cerrar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Acta de Arqueo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

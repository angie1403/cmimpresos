import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Building2,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Settings,
  Save,
  CheckCircle,
} from 'lucide-react';
import { FundSettings } from '../types/cajaMenor';
import { formatCOP } from '../utils/formatters';

interface NormativaViewProps {
  settings: FundSettings;
  onUpdateSettings: (newSettings: FundSettings) => void;
}

export const NormativaView: React.FC<NormativaViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formData, setFormData] = useState<FundSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-slate-200">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Configuración y Asignación del Fondo Fijo
            </h3>
            <p className="text-xs text-slate-500">
              Ajusta los parámetros operativos de Impresos El Día S.A.S. (Paso 1 del Manual)
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Razón Social de la Empresa</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">NIT de la Empresa</label>
            <input
              type="text"
              value={formData.companyNit}
              onChange={(e) => setFormData({ ...formData, companyNit: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Monto Asignación Mensual (COP)</label>
            <input
              type="number"
              step="50000"
              value={formData.initialFund}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  initialFund: parseFloat(e.target.value) || 2000000,
                  minBalanceThreshold: (parseFloat(e.target.value) || 2000000) * 0.3,
                })
              }
              className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Custodio Responsable Autorizado</label>
            <input
              type="text"
              value={formData.custodian}
              onChange={(e) => setFormData({ ...formData, custodian: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Tope para Alerta de Reembolso (% de consumo)
            </label>
            <input
              type="number"
              min="50"
              max="90"
              value={formData.reimbursementThresholdPercent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reimbursementThresholdPercent: parseInt(e.target.value, 10) || 70,
                })
              }
              className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Período Contable Actual</label>
            <input
              type="text"
              value={formData.currentPeriod}
              onChange={(e) => setFormData({ ...formData, currentPeriod: e.target.value })}
              className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between pt-3">
            {saveSuccess ? (
              <span className="flex items-center text-emerald-600 font-semibold text-xs">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                ¡Configuración guardada correctamente!
              </span>
            ) : (
              <span></span>
            )}
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>

      {/* Normative Framework Accordion / Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Marco Normativo Vigente Aplicable (Colombia)
            </h3>
            <p className="text-xs text-slate-500">
              Controles legales y tributarios incorporados en el sistema
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>Decreto 1068 de 2015 (Sector Hacienda)</span>
            </div>
            <p className="text-slate-600">
              Reglamenta los principios de administración financiera, constitución de garantías, límites de cuantía y reembolso de cajas menores y fondos fijos, estableciendo las pautas de control interno y unidad de caja.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Decreto 2568 de 2010 (Manejo de Cajas Menores)</span>
            </div>
            <p className="text-slate-600">
              Establece las directrices específicas para apertura, cuantía, legalización, prohibiciones de fraccionamiento de compras y arqueos periódicos sorpresivos de los fondos de caja menor.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Resolución DIAN 000165 (Facturación Electrónica)</span>
            </div>
            <p className="text-slate-600">
              Para que un gasto de caja menor sea deducible en impuesto de renta y descontable en IVA, debe contar con Factura Electrónica de Venta o Tiquete POS Electrónico a nombre de Impresos El Día S.A.S. (con su NIT).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Documento Soporte a No Obligados a Facturar</span>
            </div>
            <p className="text-slate-600">
              Para compras a personas naturales no obligadas a expedir factura (ej. mensajeros o servicios menores), la empresa emite el Documento Soporte electrónico DIAN para soportar costos y deducciones.
            </p>
          </div>
        </div>

        {/* Flujograma de 6 pasos */}
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Flujograma del Ciclo Operativo (6 Etapas del Manual)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="font-bold text-sky-700">1. Constitución</div>
              <p className="text-slate-500 text-[11px] mt-1">
                Aprobación del fondo fijo de {formatCOP(settings.initialFund)} y nombramiento formal de custodio.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="font-bold text-sky-700">2. Solicitud y Vale</div>
              <p className="text-slate-500 text-[11px] mt-1">
                Vale Provisional firmado. Plazo estricto de 24 a 48 horas para legalizar con factura formal.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="font-bold text-sky-700">3. Kárdex Digital</div>
              <p className="text-slate-500 text-[11px] mt-1">
                Registro en tiempo real asistido por IA o manual con cálculo automático del saldo diario.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="font-bold text-amber-700">4. Alerta Reembolso</div>
              <p className="text-slate-500 text-[11px] mt-1">
                Se activa al consumir entre el 70% y 80% del fondo o el último día hábil del mes.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="font-bold text-emerald-700">5. Restitución</div>
              <p className="text-slate-500 text-[11px] mt-1">
                Contabilidad audita soportes y gira el valor exacto consumido, restituyendo el fondo al 100%.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <div className="font-bold text-purple-700">6. Arqueos Sorpresa</div>
              <p className="text-slate-500 text-[11px] mt-1">
                Verificación quincenal: Efectivo físico + Vales vigentes + Facturas = {formatCOP(settings.initialFund)}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

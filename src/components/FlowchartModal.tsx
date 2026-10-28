import React, { useState } from 'react';
import {
  X,
  Printer,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  FileText,
  DollarSign,
  ShieldCheck,
  Building,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { formatCOP } from '../utils/formatters';

interface FlowchartModalProps {
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenNewExpense?: () => void;
  onOpenMonthClosing?: () => void;
}

type NodeKey =
  | 'step-1'
  | 'step-2'
  | 'step-3'
  | 'step-4'
  | 'decision-1'
  | 'record-app'
  | 'decision-2'
  | 'doc-soporte'
  | 'reject'
  | 'decision-3'
  | 'step-5';

interface StepDetail {
  id: NodeKey;
  stepNumber: string;
  title: string;
  subtitle: string;
  actor: string;
  legalBasis: string;
  requirements: string[];
  actionLabel?: string;
  actionTab?: string;
  type: 'process' | 'decision' | 'success' | 'danger';
}

const STEP_DETAILS: Record<NodeKey, StepDetail> = {
  'step-1': {
    id: 'step-1',
    stepNumber: 'Paso 1',
    title: 'Apertura del Fondo ($2.000.000 COP)',
    subtitle: 'Nombramiento de Custodio Titular y Reglamento Interno',
    actor: 'Gerencia General & Dirección Financiera',
    legalBasis: 'Decreto 1068 de 2015, Decreto 2568 de 2010 y Políticas Contables NIIF para Pymes.',
    requirements: [
      'Resolución o Acta formal de creación con asignación fija de $2.000.000 COP.',
      'Designación expresa del custodio titular (Carlos Eduardo Montoya) mediante póliza de manejo.',
      'Apertura de registro kárdex oficial y acta de arqueo inicial en cero transacciones.',
      'Tope máximo por compra individual: $350.000 COP (salvo autorización de Gerencia).',
    ],
    actionLabel: 'Ver Normativa y Reglamento',
    actionTab: 'normativa',
    type: 'process',
  },
  'step-2': {
    id: 'step-2',
    stepNumber: 'Paso 2',
    title: 'Solicitud de Gasto y Vale Provisional',
    subtitle: 'Autorización Previa y Firma de Jefe de Área / Solicitante',
    actor: 'Colaborador Solicitante y Jefe Inmediato',
    legalBasis: 'Control Interno COSO III y Normativa de Auditoría NIAS.',
    requirements: [
      'Diligenciamiento del Vale Provisional numerado (ej. VP-012) antes de entregar dinero.',
      'Identificación del solicitante, área funcional (Taller, Litografía, Mensajería, Diseño).',
      'Justificación detallada de la urgencia o imprevisibilidad de la compra.',
      'Firma física o autorización del Jefe de Área.',
    ],
    actionLabel: 'Ver Vales Provisionales',
    actionTab: 'dashboard',
    type: 'process',
  },
  'step-3': {
    id: 'step-3',
    stepNumber: 'Paso 3',
    title: 'Entrega de Efectivo por el Custodio',
    subtitle: 'Plazo Máximo Improrrogable de 24 a 48 Horas para Legalizar',
    actor: 'Custodio de Caja Menor',
    legalBasis: 'Circular Reglamentaria de Tesorería de Impresos El Día S.A.S.',
    requirements: [
      'Conteo físico del dinero entregado frente al solicitante.',
      'El vale provisional queda bajo custodia en el cofre de seguridad como soporte sustitutivo.',
      'Plazo fatal: 24 horas para compras locales; máximo 48 horas en repuestos o servicios externos.',
      'Prohibición expresa: No se entregarán nuevos vales a quien tenga un vale previo vencido o pendiente.',
    ],
    actionLabel: 'Consultar Kárdex y Saldos',
    actionTab: 'dashboard',
    type: 'process',
  },
  'step-4': {
    id: 'step-4',
    stepNumber: 'Paso 4',
    title: 'Realización de la Compra / Servicio',
    subtitle: 'Exigencia de Soporte Legal con NIT de la Empresa',
    actor: 'Colaborador Comprador',
    legalBasis: 'Artículo 616-1 del Estatuto Tributario y Ley 2155 de 2021.',
    requirements: [
      'Exigir factura expedida a nombre de: Impresos El Día S.A.S. - NIT 890.903.456-1.',
      'Verificar desglose de IVA (19% o 5%) o indicación de exento/excluido.',
      'Reclamar devuelta exacta en efectivo y comprobante.',
      'Entregar de inmediato al Custodio para proceder a la legalización.',
    ],
    actionLabel: 'Registrar Factura Legalizada',
    actionTab: 'new-expense',
    type: 'process',
  },
  'decision-1': {
    id: 'decision-1',
    stepNumber: 'Evaluación 1',
    title: '¿Tiene Factura Electrónica o Tíquete POS Válido DIAN?',
    subtitle: 'Filtro Tributario de Deducibilidad del Soporte',
    actor: 'Custodio de Caja y Asistente Contable',
    legalBasis: 'Resolución DIAN 000165 de 2023 y Art. 771-2 E.T.',
    requirements: [
      'Factura Electrónica de Venta con CUFE legible y validación previa de la DIAN.',
      'Tíquete POS con sistema electrónico que incluya nombre y NIT de Impresos El Día S.A.S.',
      'Si cumple: Se registra en la aplicación web mediante escaneo inteligente OCR o ingreso manual.',
      'Si no cuenta con factura formal: Se evalúa si el proveedor es un sujeto no obligado.',
    ],
    actionLabel: 'Escanear Soporte con IA',
    actionTab: 'new-expense',
    type: 'decision',
  },
  'record-app': {
    id: 'record-app',
    stepNumber: 'Registro Oficial',
    title: 'Registro en App Web (OCR AI Studio + Kárdex)',
    subtitle: 'Imputación Contable PUC, Cruce de Vale y Cálculo de Devuelta',
    actor: 'Custodio de Caja Menor',
    legalBasis: 'Resolución DIAN 000165 y Procedimientos Contables NIIF.',
    requirements: [
      'Extracción automática de datos (Proveedor, NIT, Factura, Subtotal, IVA, Total) con IA.',
      'Cruce contra el Vale Provisional para registrar la devuelta ingresada nuevamente a caja.',
      'Imputación al centro de costos y cuenta PUC (ej. 519530 Papelería, 514510 Mantenimiento).',
      'El saldo en efectivo disponible se actualiza en tiempo real en el Kárdex.',
    ],
    actionLabel: 'Ir al Formulario de Registro',
    actionTab: 'new-expense',
    type: 'success',
  },
  'decision-2': {
    id: 'decision-2',
    stepNumber: 'Evaluación 2',
    title: '¿Proveedor NO Obligado a Facturar?',
    subtitle: 'Personas Naturales del Régimen No Responsable de IVA',
    actor: 'Custodio y Departamento Contable',
    legalBasis: 'Artículo 1.6.1.4.12 del Decreto 1625 de 2016 y Res. DIAN 000167 de 2021.',
    requirements: [
      'Aplica para pequeñas compras a personas naturales (artesanos, cerrajeros, mensajeros independientes).',
      'Exige copia o número de cédula/RUT del prestador del servicio.',
      'Si es No Obligado: Se elabora el Documento Soporte Electrónico para garantizar la deducibilidad tributaria.',
      'Si era un establecimiento obligado y no entregó factura: El soporte es rechazado.',
    ],
    type: 'decision',
  },
  'doc-soporte': {
    id: 'doc-soporte',
    stepNumber: 'Trámite Especial',
    title: 'Generar Documento Soporte Electrónico DIAN',
    subtitle: 'Transmisión Electrónica de Compras a No Obligados',
    actor: 'Contabilidad y Custodio',
    legalBasis: 'Resolución DIAN 000167 de 2021.',
    requirements: [
      'Generación de consecutivo autorizado por la DIAN (prefijo DS-XXXX).',
      'Firma del prestador o recibo de caja firmado con número de documento de identidad.',
      'Transmisión electrónica dentro del plazo semanal reglamentario.',
      'Habilita la deducibilidad del gasto y el costo en el impuesto de renta de la compañía.',
    ],
    actionLabel: 'Registrar Documento Soporte',
    actionTab: 'new-expense',
    type: 'success',
  },
  'reject': {
    id: 'reject',
    stepNumber: 'Filtro de Seguridad',
    title: 'RECHAZAR SOPORTE (Gasto No Deducible)',
    subtitle: 'Prohibición de Pago con Recursos de Caja Menor',
    actor: 'Custodio y Revisor Fiscal',
    legalBasis: 'Artículo 771-2 del Estatuto Tributario y Responsabilidad del Custodio.',
    requirements: [
      'No se admiten tirillas manuales sin valor tributario de establecimientos obligados.',
      'El solicitante debe reintegrar el 100% del dinero anticipado de su bolsillo.',
      'No se asienta en el kárdex como gasto de la empresa.',
      'Reporte de no conformidad a la jefatura de área.',
    ],
    type: 'danger',
  },
  'decision-3': {
    id: 'decision-3',
    stepNumber: 'Control de Fondo',
    title: '¿Gasto al 70%-80% ($1.4M — $1.6M) o Cierre de Mes?',
    subtitle: 'Umbral de Restitución y Liquidación Ordinaria',
    actor: 'Custodio de Caja Menor',
    legalBasis: 'Decreto 1068 de 2015 Art. 2.8.4.3.1 y Manual de Tesorería.',
    requirements: [
      'Si los egresos alcanzan el 70% ($1.400.000 COP): Se detiene la emisión de vales grandes y se solicita reembolso.',
      'Si llega el último día hábil del mes: Se realiza el Cierre de Mes sin importar el saldo ejecutado.',
      'Si el saldo restante es aún superior al 30% y no ha finalizado el mes: El ciclo continúa (vuelve al Paso 3).',
    ],
    actionLabel: 'Ver Estado del Umbral',
    actionTab: 'dashboard',
    type: 'decision',
  },
  'step-5': {
    id: 'step-5',
    stepNumber: 'Paso 5',
    title: '5. Auditoría Contable y Reembolso Exacto',
    subtitle: 'Restitución del Fondo a $2.000.000 COP + Arqueo Oficial',
    actor: 'Revisoría Fiscal, Contador General y Gerencia',
    legalBasis: 'Decreto 2568 de 2010 y Normas de Auditoría NIAS.',
    requirements: [
      'Arqueo físico simultáneo de efectivo, facturas y vales legalizados (Fórmula: Efectivo + Soportes = $2.000.000).',
      'Generación de la Relación Consolidada de Gastos e Informe DIAN.',
      'Emisión de cheque o transferencia electrónica bancaria por el valor exacto de los gastos auditados.',
      'Apertura del nuevo período contable con el fondo íntegro al 100%.',
    ],
    actionLabel: 'Ejecutar Cierre de Mes',
    actionTab: 'cierre-mes',
    type: 'process',
  },
};

export const FlowchartModal: React.FC<FlowchartModalProps> = ({
  onClose,
  onNavigateToTab,
  onOpenNewExpense,
  onOpenMonthClosing,
}) => {
  const [selectedNode, setSelectedNode] = useState<NodeKey>('decision-1');
  const [viewMode, setViewMode] = useState<'flowchart' | 'manual' | 'policy'>('flowchart');

  const activeDetail = STEP_DETAILS[selectedNode];

  const handleAction = (tab?: string) => {
    if (!tab) return;
    if (tab === 'new-expense' && onOpenNewExpense) {
      onOpenNewExpense();
      onClose();
    } else if (tab === 'cierre-mes' && onOpenMonthClosing) {
      onOpenMonthClosing();
      onClose();
    } else if (onNavigateToTab) {
      onNavigateToTab(tab);
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[96vh] flex flex-col print:max-h-none print:shadow-none print:border-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold">
              <span className="text-xl">🔄</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Flujograma Oficial de Manejo de Caja Menor
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-sky-400/20 text-sky-300 rounded border border-sky-400/30">
                  Res. DIAN 000165
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Impresos El Día S.A.S. • Fondo Asignado: {formatCOP(2000000)} • Decretos 1068/2015 & 2568/2010
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 print:hidden">
            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-1 text-xs border border-slate-700">
              <button
                onClick={() => setViewMode('flowchart')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  viewMode === 'flowchart' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Diagrama Visual
              </button>
              <button
                onClick={() => setViewMode('manual')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  viewMode === 'manual' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Manual Operativo
              </button>
              <button
                onClick={() => setViewMode('policy')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  viewMode === 'policy' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Políticas y Topes
              </button>
            </div>

            <button
              onClick={handlePrint}
              title="Imprimir diagrama o guardar como PDF"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 print:bg-white print:p-2">
          {viewMode === 'flowchart' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* FLOWCHART DIAGRAM CANVAS */}
              <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-col items-center">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-wide uppercase">
                    Flujograma de Manejo de Caja Menor
                  </h3>
                  <p className="text-xs font-medium text-sky-700 mt-0.5">
                    Impresos El Día S.A.S. | Asignación: $2.000.000 COP
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Haz clic sobre cualquier paso o decisión para inspeccionar sus requisitos legales y atajos
                  </p>
                </div>

                {/* THE DIAGRAM STRUCTURE (Matches user image faithfully) */}
                <div className="w-full max-w-xl flex flex-col items-center relative py-2">
                  {/* STEP 1: INICIO */}
                  <div
                    onClick={() => setSelectedNode('step-1')}
                    className={`w-full max-w-md cursor-pointer text-center p-3.5 rounded-xl transition-all shadow-md transform hover:scale-[1.01] ${
                      selectedNode === 'step-1'
                        ? 'bg-slate-900 text-white ring-4 ring-sky-400/40'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-sm tracking-wide">
                      1. INICIO: Apertura del Fondo ($2.000.000 COP)
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      (Nombramiento de Custodio y Reglamento)
                    </div>
                  </div>

                  {/* Arrow Down */}
                  <div className="h-7 w-0.5 bg-slate-600 relative flex items-end justify-center">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-slate-600 transform rotate-45 mb-[-1px]"></div>
                  </div>

                  {/* STEP 2: SOLICITUD DE GASTO */}
                  <div
                    onClick={() => setSelectedNode('step-2')}
                    className={`w-full max-w-md cursor-pointer text-center p-3.5 rounded-xl transition-all shadow-md transform hover:scale-[1.01] ${
                      selectedNode === 'step-2'
                        ? 'bg-blue-600 text-white ring-4 ring-blue-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <div className="font-bold text-sm tracking-wide">
                      2. Solicitud de Gasto y Vale Provisional
                    </div>
                    <div className="text-xs text-blue-100 mt-0.5">
                      (Firmado por Jefe de Área / Responsable)
                    </div>
                  </div>

                  {/* Arrow Down */}
                  <div className="h-7 w-0.5 bg-slate-600 relative flex items-end justify-center">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-slate-600 transform rotate-45 mb-[-1px]"></div>
                  </div>

                  {/* STEP 3: ENTREGA DE EFECTIVO (Target of loop-back) */}
                  <div
                    id="diagram-step-3"
                    onClick={() => setSelectedNode('step-3')}
                    className={`w-full max-w-md cursor-pointer text-center p-3.5 rounded-xl transition-all shadow-md transform hover:scale-[1.01] relative ${
                      selectedNode === 'step-3'
                        ? 'bg-blue-600 text-white ring-4 ring-blue-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <div className="font-bold text-sm tracking-wide">
                      3. Entrega de Efectivo por el Custodio
                    </div>
                    <div className="text-xs text-blue-100 mt-0.5">
                      (Plazo máximo de 24 a 48 horas para legalizar)
                    </div>

                    {/* Returning Loop Connection Point Indicator */}
                    <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-xs hidden sm:block" title="Punto de retorno desde el control de fondo"></div>
                  </div>

                  {/* Arrow Down */}
                  <div className="h-7 w-0.5 bg-slate-600 relative flex items-end justify-center">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-slate-600 transform rotate-45 mb-[-1px]"></div>
                  </div>

                  {/* STEP 4: REALIZACIÓN DE LA COMPRA */}
                  <div
                    onClick={() => setSelectedNode('step-4')}
                    className={`w-full max-w-md cursor-pointer text-center p-3.5 rounded-xl transition-all shadow-md transform hover:scale-[1.01] ${
                      selectedNode === 'step-4'
                        ? 'bg-blue-600 text-white ring-4 ring-blue-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <div className="font-bold text-sm tracking-wide">
                      4. Realización de la Compra / Servicio
                    </div>
                    <div className="text-xs text-blue-100 mt-0.5">
                      (Solicitud de Soporte Legal con NIT de la Empresa)
                    </div>
                  </div>

                  {/* Arrow Down to Decision 1 */}
                  <div className="h-7 w-0.5 bg-slate-600 relative flex items-end justify-center">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-slate-600 transform rotate-45 mb-[-1px]"></div>
                  </div>

                  {/* DECISION 1: ¿Tiene Factura Electrónica o POS? */}
                  <div className="w-full relative my-1">
                    <div
                      onClick={() => setSelectedNode('decision-1')}
                      className={`mx-auto max-w-xs sm:max-w-sm py-4 px-4 text-center cursor-pointer transition-all shadow-md rounded-xl ${
                        selectedNode === 'decision-1'
                          ? 'bg-amber-600 text-white ring-4 ring-amber-300'
                          : 'bg-amber-600 text-white hover:bg-amber-700'
                      }`}
                      style={{
                        clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)',
                      }}
                    >
                      <div className="font-bold text-xs sm:text-sm px-4">
                        ¿Tiene Factura Electrónica o Tíquete POS Válido DIAN?
                      </div>
                    </div>

                    {/* Left Branch: SÍ -> Registro en App Web */}
                    <div className="hidden sm:flex items-center absolute left-0 top-1/2 transform -translate-y-1/2">
                      <span className="text-[11px] font-extrabold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded mr-1">
                        SÍ
                      </span>
                      <div className="w-8 h-0.5 bg-teal-600"></div>
                    </div>
                  </div>

                  {/* BRANCHING ROW 1: (Left: Registro en App Web | Center: Arrow NO down to Decision 2) */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 my-2 items-center">
                    {/* LEFT NODE: Registro en App Web */}
                    <div
                      onClick={() => setSelectedNode('record-app')}
                      className={`cursor-pointer p-3 rounded-xl text-center shadow-md transition-all ${
                        selectedNode === 'record-app'
                          ? 'bg-teal-700 text-white ring-4 ring-teal-300'
                          : 'bg-teal-700 text-white hover:bg-teal-800'
                      }`}
                    >
                      <div className="font-bold text-xs">
                        Registro en App Web
                      </div>
                      <div className="text-[11px] text-teal-100 mt-0.5">
                        (OCR AI Studio + Kárdex)
                      </div>
                    </div>

                    {/* CENTER: NO connector */}
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded mb-1">
                        NO
                      </span>
                      <div className="h-6 w-0.5 bg-slate-600 relative flex items-end justify-center">
                        <div className="w-2 h-2 border-r-2 border-b-2 border-slate-600 transform rotate-45 mb-[-1px]"></div>
                      </div>
                    </div>

                    {/* RIGHT: Empty in this level */}
                    <div className="hidden sm:block"></div>
                  </div>

                  {/* DECISION 2: ¿Proveedor NO obligado a facturar? */}
                  <div className="w-full relative my-1">
                    <div
                      onClick={() => setSelectedNode('decision-2')}
                      className={`mx-auto max-w-xs sm:max-w-sm py-4 px-4 text-center cursor-pointer transition-all shadow-md rounded-xl ${
                        selectedNode === 'decision-2'
                          ? 'bg-amber-600 text-white ring-4 ring-amber-300'
                          : 'bg-amber-600 text-white hover:bg-amber-700'
                      }`}
                      style={{
                        clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)',
                      }}
                    >
                      <div className="font-bold text-xs sm:text-sm px-4">
                        ¿Proveedor NO obligado a facturar?
                      </div>
                    </div>

                    {/* Right Branch: SÍ -> Documento Soporte */}
                    <div className="hidden sm:flex items-center absolute right-0 top-1/2 transform -translate-y-1/2">
                      <div className="w-8 h-0.5 bg-teal-600"></div>
                      <span className="text-[11px] font-extrabold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded ml-1">
                        SÍ
                      </span>
                    </div>
                  </div>

                  {/* BRANCHING ROW 2: (Center: NO -> Rechazar Soporte | Right: SÍ -> Generar Documento Soporte) */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 my-2 items-center">
                    {/* LEFT: Connecting line down from Registro en App Web */}
                    <div className="hidden sm:flex justify-center">
                      <div className="h-full w-0.5 bg-teal-600 min-h-[40px]"></div>
                    </div>

                    {/* CENTER: NO -> RECHAZAR SOPORTE */}
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded mb-1">
                        NO
                      </span>
                      <div
                        onClick={() => setSelectedNode('reject')}
                        className={`w-full cursor-pointer p-3 rounded-xl text-center shadow-md transition-all ${
                          selectedNode === 'reject'
                            ? 'bg-rose-700 text-white ring-4 ring-rose-300'
                            : 'bg-rose-700 text-white hover:bg-rose-800'
                        }`}
                      >
                        <div className="font-bold text-xs uppercase tracking-wide">
                          RECHAZAR SOPORTE
                        </div>
                        <div className="text-[11px] text-rose-100 mt-0.5">
                          (Gasto No Deducible)
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Generar Documento Soporte Electrónico DIAN */}
                    <div
                      onClick={() => setSelectedNode('doc-soporte')}
                      className={`cursor-pointer p-3 rounded-xl text-center shadow-md transition-all ${
                        selectedNode === 'doc-soporte'
                          ? 'bg-teal-700 text-white ring-4 ring-teal-300'
                          : 'bg-teal-700 text-white hover:bg-teal-800'
                      }`}
                    >
                      <div className="font-bold text-xs">
                        Generar Documento Soporte
                      </div>
                      <div className="text-[11px] text-teal-100 mt-0.5">
                        Electrónico DIAN
                      </div>
                    </div>
                  </div>

                  {/* MERGING LINES: Paths flow together into Decision 3 */}
                  <div className="w-full flex items-center justify-center my-3 relative">
                    <div className="w-4/5 h-0.5 bg-slate-500"></div>
                    <div className="absolute h-6 w-0.5 bg-slate-600 top-0 flex items-end justify-center">
                      <div className="w-2 h-2 border-r-2 border-b-2 border-slate-600 transform rotate-45 mb-[-1px]"></div>
                    </div>
                  </div>

                  {/* DECISION 3: ¿Gasto al 70%-80% o Cierre de Mes? */}
                  <div className="w-full relative my-1">
                    <div
                      onClick={() => setSelectedNode('decision-3')}
                      className={`mx-auto max-w-sm sm:max-w-md py-4 px-4 text-center cursor-pointer transition-all shadow-md rounded-xl ${
                        selectedNode === 'decision-3'
                          ? 'bg-amber-600 text-white ring-4 ring-amber-300'
                          : 'bg-amber-600 text-white hover:bg-amber-700'
                      }`}
                      style={{
                        clipPath: 'polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)',
                      }}
                    >
                      <div className="font-bold text-xs sm:text-sm px-4">
                        ¿Gasto al 70%-80% ($1.4M — $1.6M) o Cierre de Mes Calendario?
                      </div>
                    </div>

                    {/* Return Loop Label on right */}
                    <div className="hidden lg:block absolute right-[-24px] top-1/2 transform -translate-y-1/2">
                      <span className="text-[10px] font-bold text-slate-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded shadow-xs whitespace-nowrap">
                        NO (Continuar Fondo) ➔
                      </span>
                    </div>
                  </div>

                  {/* SÍ Connector Down to Step 5 */}
                  <div className="flex flex-col items-center my-1">
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded mb-1">
                      SÍ
                    </span>
                    <div className="h-6 w-0.5 bg-slate-600 relative flex items-end justify-center">
                      <div className="w-2 h-2 border-r-2 border-b-2 border-slate-600 transform rotate-45 mb-[-1px]"></div>
                    </div>
                  </div>

                  {/* STEP 5: FINAL / REEMBOLSO EXACTO */}
                  <div
                    onClick={() => setSelectedNode('step-5')}
                    className={`w-full max-w-md cursor-pointer text-center p-4 rounded-xl transition-all shadow-lg transform hover:scale-[1.01] ${
                      selectedNode === 'step-5'
                        ? 'bg-slate-900 text-white ring-4 ring-sky-400/40'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-sm tracking-wide">
                      5. Auditoría Contable y Reembolso Exacto
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      (Restitución del Fondo a $2.000.000 COP) + Arqueo
                    </div>
                  </div>
                </div>
              </div>

              {/* INSPECTOR PANEL / STEP DETAILS DRAWER */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                        {activeDetail.stepNumber}
                      </span>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Detalle del Procedimiento
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        activeDetail.type === 'process'
                          ? 'bg-blue-100 text-blue-800'
                          : activeDetail.type === 'decision'
                          ? 'bg-amber-100 text-amber-800'
                          : activeDetail.type === 'success'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {activeDetail.type === 'process'
                        ? 'Proceso'
                        : activeDetail.type === 'decision'
                        ? 'Decisión DIAN'
                        : activeDetail.type === 'success'
                        ? 'Registro Válido'
                        : 'Rechazo'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {activeDetail.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 mb-4">
                    {activeDetail.subtitle}
                  </p>

                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">
                        Responsable / Ejecutor:
                      </span>
                      <p className="text-slate-900 font-medium">{activeDetail.actor}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">
                        Fundamento Legal DIAN & NIIF:
                      </span>
                      <p className="text-slate-700">{activeDetail.legalBasis}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-2 uppercase text-[11px] tracking-wider">
                        Requisitos y Controles Clave:
                      </span>
                      <ul className="space-y-2">
                        {activeDetail.requirements.map((req, i) => (
                          <li key={i} className="flex items-start space-x-2 text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {activeDetail.actionLabel && (
                    <div className="mt-5 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => handleAction(activeDetail.actionTab)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                      >
                        <span>{activeDetail.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Reference Box */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
                      Regla de Oro en Caja Menor
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Efectivo en billetes y monedas + Vales provisionales vigentes + Soportes de facturas ={' '}
                    <span className="font-bold text-white text-sky-300">$2.000.000 COP exactos</span> en todo momento.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MANUAL OPERATIVO TAB */}
          {viewMode === 'manual' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Procedimiento Interno Codificado • PR-TES-002
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Manual de Operación y Legalización de Caja Menor
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Impresos El Día S.A.S. • Vigencia 2026 • Auditoría y Revisoría Fiscal
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    Apertura y Asignación del Fondo
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    El fondo se constituye por un valor fijo e invariable de $2.000.000 COP, bajo la custodia única y exclusiva de Carlos Eduardo Montoya. Queda prohibido mezclar dineros de ventas o recaudos de mostrador con los fondos de caja menor.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    Entrega mediante Vale Provisional
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ninguna suma de dinero saldrá de la caja sin un Vale Provisional diligenciado y firmado. El beneficiario asume la responsabilidad pecuniaria hasta tanto entregue la factura válida y la devuelta respectiva.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                    Legalización y Plazos
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    El plazo máximo de legalización es de 24 a 48 horas hábiles. En caso de no presentar factura a tiempo, el custodio reportará a Gestión Humana para el respectivo descuento por nómina conforme a la legislación laboral.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">4</span>
                    Soportes DIAN Aceptados
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Conforme a la Resolución 000165 de 2023, son válidos: Factura Electrónica con CUFE, Tíquetes POS electrónicos con NIT de Impresos El Día S.A.S. y Documento Soporte electrónico en adquisiciones a no obligados.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold block mb-1">Gastos Estrictamente Prohibidos por Caja Menor:</span>
                  Préstamos a empleados o terceros, pago de salarios o viáticos permanentes, compra de activos fijos mayores, consumos de bebidas alcohólicas o multas de tránsito.
                </div>
              </div>
            </div>
          )}

          {/* POLÍTICAS Y TOPES TAB */}
          {viewMode === 'policy' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Matriz de Parámetros y Límites
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Políticas y Topes de Gasto Oficiales
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Configuración vigente para Impresos El Día S.A.S.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold block mb-1 uppercase">Monto Total del Fondo</span>
                  <span className="text-2xl font-black text-slate-900">$2.000.000</span>
                  <span className="text-[11px] text-slate-600 block mt-1">Fijo e invariable</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-xs text-amber-800 font-bold block mb-1 uppercase">Umbral de Reembolso (70%)</span>
                  <span className="text-2xl font-black text-amber-900">$1.400.000</span>
                  <span className="text-[11px] text-amber-700 block mt-1">Dispara solicitud contable</span>
                </div>

                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-center">
                  <span className="text-xs text-sky-800 font-bold block mb-1 uppercase">Tope por Compra Simple</span>
                  <span className="text-2xl font-black text-sky-900">$350.000</span>
                  <span className="text-[11px] text-sky-700 block mt-1">Montos mayores van por orden de pago</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Normativa Colombiana de Respaldo:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="font-bold text-indigo-900 block">Decreto 1068 de 2015 (Art. 2.8.4.3.1)</span>
                    <p className="text-slate-600 mt-0.5">Reglamenta la constitución, manejo, rendición de cuentas y reembolso de cajas menores.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="font-bold text-indigo-900 block">Decreto 2568 de 2010</span>
                    <p className="text-slate-600 mt-0.5">Fija criterios de legalización de vales provisionales y plazos máximos para legalizar.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="font-bold text-indigo-900 block">Resolución DIAN 000165 de 2023</span>
                    <p className="text-slate-600 mt-0.5">Regula el sistema de facturación electrónica, tiquetes POS con identificación y CUFE.</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="font-bold text-indigo-900 block">Resolución DIAN 000167 de 2021</span>
                    <p className="text-slate-600 mt-0.5">Establece la transmisión electrónica del Documento Soporte en adquisiciones a no obligados.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">Flujograma Oficial Integrado con Kárdex y DIAN</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Cerrar Flujograma
          </button>
        </div>
      </div>
    </div>
  );
};

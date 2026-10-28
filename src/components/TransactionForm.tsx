import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Sparkles,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Image as ImageIcon,
  Calculator,
  Building,
  Calendar,
  Hash,
  Tag,
  FileCheck,
  RefreshCw,
  User,
  UserPlus,
  ArrowRightLeft,
  Coins,
} from 'lucide-react';
import { Transaction, ExpenseCategory, DocumentType, ComplianceStatus, ProvisionalVoucher, Collaborator } from '../types/cajaMenor';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { scanReceiptWithAI } from '../services/aiReceiptScanner';
import { formatCOP } from '../utils/formatters';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  vouchers: ProvisionalVoucher[];
  collaborators: Collaborator[];
  onOpenPeopleManager?: () => void;
  onClose?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onAddTransaction,
  vouchers,
  collaborators,
  onOpenPeopleManager,
  onClose,
}) => {
  // Form State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [voucherNumber, setVoucherNumber] = useState<string>('');
  const [responsiblePerson, setResponsiblePerson] = useState<string>('Carlos Eduardo Montoya');
  const [department, setDepartment] = useState<string>('Administración y Compras');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [provider, setProvider] = useState<string>('');
  const [nit, setNit] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Papelería y Útiles');
  const [description, setDescription] = useState<string>('');
  
  // Amounts: Advance, Total Expense, Change Returned
  const [cashAdvanceGiven, setCashAdvanceGiven] = useState<string>('');
  const [total, setTotal] = useState<string>('');
  const [changeReturned, setChangeReturned] = useState<string>('0');
  const [subtotal, setSubtotal] = useState<string>('');
  const [iva, setIva] = useState<string>('0');
  const [documentType, setDocumentType] = useState<DocumentType>('Factura Electrónica');
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>('Válido DIAN');

  // File & AI Scanning State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStatusMessage, setScanStatusMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [aiHighlight, setAiHighlight] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recalculate change returned whenever total or advance changes
  const updateAmounts = (newTotalStr: string, newAdvanceStr: string) => {
    const totNum = parseFloat(newTotalStr) || 0;
    const advNum = parseFloat(newAdvanceStr) || 0;

    if (advNum > 0 && advNum >= totNum) {
      setChangeReturned((advNum - totNum).toString());
    } else if (advNum > 0 && advNum < totNum) {
      setChangeReturned('0');
    }
  };

  const handleTotalChange = (valStr: string) => {
    setTotal(valStr);
    const num = parseFloat(valStr) || 0;
    if (documentType === 'Factura Electrónica' && num > 0) {
      const calculatedSub = Math.round(num / 1.19);
      const calculatedIva = num - calculatedSub;
      setSubtotal(calculatedSub.toString());
      setIva(calculatedIva.toString());
    } else {
      setSubtotal(num.toString());
      setIva('0');
    }
    updateAmounts(valStr, cashAdvanceGiven);
  };

  const handleAdvanceChange = (valStr: string) => {
    setCashAdvanceGiven(valStr);
    updateAmounts(total, valStr);
  };

  // When a voucher is selected, auto-fill responsiblePerson, department, and cash advance
  const handleVoucherSelect = (code: string) => {
    setVoucherNumber(code);
    const foundVoucher = vouchers.find((v) => v.code === code);
    if (foundVoucher) {
      setResponsiblePerson(foundVoucher.beneficiary);
      setDepartment(foundVoucher.department);
      setCashAdvanceGiven(foundVoucher.amount.toString());
      updateAmounts(total, foundVoucher.amount.toString());
    }
  };

  // Process File with AI (or simulated fallback)
  const processReceiptFile = async (file: File) => {
    setIsScanning(true);
    setScanStatusMessage('Analizando factura con IA (Gemini 3.8 Flash)...');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      setPreviewFileName(file.name);

      try {
        const result = await scanReceiptWithAI(base64String, file.type, file.name);

        if (result && result.data) {
          const d = result.data;
          setProvider(d.provider || provider);
          if (d.nit) setNit(d.nit);
          if (d.invoiceNumber) setInvoiceNumber(d.invoiceNumber);
          if (d.date) setDate(d.date);
          if (d.total) {
            setTotal(d.total.toString());
            setSubtotal(d.subtotal ? d.subtotal.toString() : d.total.toString());
            setIva(d.iva ? d.iva.toString() : '0');
            // If advance is empty or less than total, set default advance equal to total or rounded up
            if (!cashAdvanceGiven || parseFloat(cashAdvanceGiven) < d.total) {
              const roundedAdv = Math.ceil(d.total / 10000) * 10000;
              setCashAdvanceGiven(roundedAdv.toString());
              setChangeReturned((roundedAdv - d.total).toString());
            } else {
              updateAmounts(d.total.toString(), cashAdvanceGiven);
            }
          }
          if (d.description) setDescription(d.description);

          const foundCat = CATEGORIES_CONFIG.find(
            (c) => c.name.toLowerCase() === d.category?.toLowerCase()
          );
          if (foundCat) {
            setCategory(foundCat.id);
          }

          if (d.documentType) {
            setDocumentType(d.documentType as DocumentType);
          }

          setScanStatusMessage(
            result.source === 'gemini-ai'
              ? '¡Factura procesada con éxito mediante IA!'
              : '¡Datos extraídos con éxito (Modo asistido)!'
          );

          setAiHighlight(true);
          setTimeout(() => setAiHighlight(false), 2500);
        }
      } catch (err) {
        console.error('Scan error:', err);
        setScanStatusMessage('No se pudo completar el escaneo automático. Ingresa los datos manualmente.');
      } finally {
        setIsScanning(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processReceiptFile(e.dataTransfer.files[0]);
    }
  };

  // Sample receipt loader for quick test
  const loadSampleReceipt = (type: 'litografia' | 'papeleria' | 'transporte' | 'aseo') => {
    setIsScanning(true);
    setScanStatusMessage('Cargando soporte de prueba...');
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      if (type === 'litografia') {
        setResponsiblePerson('Mauricio Ramos');
        setDepartment('Taller Litografía (Prensa)');
        setProvider('Soluciones Gráficas & Repuestos Heidelberg');
        setNit('900.412.871-5');
        setInvoiceNumber('FE-4912');
        setDate(today);
        setCategory('Repuestos y Mantenimiento Litografía');
        setDescription('Juego de chupones neumáticos y cuchilla lavadora de caucho offset');
        setCashAdvanceGiven('200000');
        setTotal('178500');
        setChangeReturned('21500');
        setSubtotal('150000');
        setIva('28500');
        setDocumentType('Factura Electrónica');
        setComplianceStatus('Válido DIAN');
      } else if (type === 'papeleria') {
        setResponsiblePerson('Luisa Fernanda Calle');
        setDepartment('Diseño & Preprensa');
        setProvider('Papeles y Cartulinas de Colombia S.A.S.');
        setNit('890.312.449-0');
        setInvoiceNumber('FE-10892');
        setDate(today);
        setCategory('Papelería y Útiles');
        setDescription('5 resmas de papel bond 75g y bisturís para mesa de armado');
        setCashAdvanceGiven('120000');
        setTotal('115000');
        setChangeReturned('5000');
        setSubtotal('96639');
        setIva('18361');
        setDocumentType('Factura Electrónica');
        setComplianceStatus('Válido DIAN');
      } else if (type === 'transporte') {
        setResponsiblePerson('Pedro Gómez');
        setDepartment('Mensajería y Logística');
        setProvider('Servicio Taxi Express Aeropuerto / Centro');
        setNit('901.882.110-3');
        setInvoiceNumber('DS-0094');
        setDate(today);
        setCategory('Transporte y Mensajería');
        setDescription('Transporte urgente de negativos y planchas térmicas para impresión');
        setCashAdvanceGiven('50000');
        setTotal('38000');
        setChangeReturned('12000');
        setSubtotal('38000');
        setIva('0');
        setDocumentType('Documento Soporte');
        setComplianceStatus('Documento Soporte');
      } else {
        setResponsiblePerson('Marta Lucía Henao');
        setDepartment('Servicios Generales y Aseo');
        setProvider('Aseo y Cafetería La 70');
        setNit('71.650.992');
        setInvoiceNumber('POS-2210');
        setDate(today);
        setCategory('Aseo y Cafetería');
        setDescription('Detergente multiusos, toallas absorbentes y café en grano para taller');
        setCashAdvanceGiven('60000');
        setTotal('54200');
        setChangeReturned('5800');
        setSubtotal('54200');
        setIva('0');
        setDocumentType('Tiquete POS');
        setComplianceStatus('Válido DIAN');
      }

      setScanStatusMessage('¡Datos de prueba cargados con éxito!');
      setAiHighlight(true);
      setTimeout(() => setAiHighlight(false), 2000);
      setIsScanning(false);
    }, 400);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalNum = parseFloat(total);
    if (!totalNum || totalNum <= 0) {
      alert('Por favor ingresa un valor total de factura válido mayor a 0');
      return;
    }
    if (!responsiblePerson.trim()) {
      alert('Por favor ingresa quién realizó o solicitó el gasto');
      return;
    }
    if (!provider.trim()) {
      alert('Por favor ingresa el nombre del proveedor o tercero');
      return;
    }

    const subNum = parseFloat(subtotal) || totalNum;
    const ivaNum = parseFloat(iva) || 0;
    const advNum = parseFloat(cashAdvanceGiven) || totalNum;
    const changeNum = parseFloat(changeReturned) || Math.max(0, advNum - totalNum);

    onAddTransaction({
      date,
      voucherNumber: voucherNumber.trim() ? voucherNumber.trim() : undefined,
      responsiblePerson: responsiblePerson.trim(),
      department: department.trim() || 'General',
      invoiceNumber: invoiceNumber.trim() || 'S/N',
      provider: provider.trim(),
      nit: nit.trim() || 'Sin NIT',
      cashAdvanceGiven: advNum,
      changeReturned: changeNum,
      category,
      description: description.trim() || 'Gasto operativo menor de taller',
      subtotal: subNum,
      iva: ivaNum,
      total: totalNum,
      documentType,
      complianceStatus,
      receiptImage: previewImage || undefined,
      receiptName: previewFileName || undefined,
    });

    // Reset Form
    setDate(new Date().toISOString().split('T')[0]);
    setVoucherNumber('');
    setResponsiblePerson('Carlos Eduardo Montoya');
    setDepartment('Administración y Compras');
    setInvoiceNumber('');
    setProvider('');
    setNit('');
    setDescription('');
    setCashAdvanceGiven('');
    setTotal('');
    setChangeReturned('0');
    setSubtotal('');
    setIva('0');
    setPreviewImage(null);
    setPreviewFileName(null);
    setScanStatusMessage(null);

    if (onClose) onClose();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Registro de Factura, Responsables y Devueltas
            </h2>
            <p className="text-xs text-slate-400">
              Registra quién gastó, cuánto dinero se entregó, valor del soporte y la devuelta reintegrada a caja
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* SECTION 1: Carga Asistida con IA / OCR */}
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-sky-500"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Extracción Asistida por IA (Google Gemini 3.8 Flash)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Sube foto o PDF de la factura/recibo para llenar automáticamente los valores
            </span>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl p-5 text-center transition-all border-2 ${
              dragActive
                ? 'border-sky-500 bg-sky-50/70'
                : 'border-slate-300 hover:border-sky-400 bg-white hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processReceiptFile(file);
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="h-11 w-11 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
                {isScanning ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
                ) : (
                  <UploadCloud className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  {isScanning
                    ? 'Procesando soporte con IA...'
                    : 'Arrastra y suelta aquí la factura o comprobante'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  o haz clic para seleccionar la imagen o PDF
                </p>
              </div>
            </div>
          </div>

          {/* Quick presets for test evaluation */}
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
            <span className="text-xs text-slate-500 font-medium">Ejemplos con responsables y devuelta:</span>
            <button
              type="button"
              onClick={() => loadSampleReceipt('litografia')}
              className="px-2.5 py-1 text-xs rounded-md bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              Mauricio Ramos - Litografía ($178.500 / Dev: $21.500)
            </button>
            <button
              type="button"
              onClick={() => loadSampleReceipt('papeleria')}
              className="px-2.5 py-1 text-xs rounded-md bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              Luisa Calle - Preprensa ($115.000 / Dev: $5.000)
            </button>
            <button
              type="button"
              onClick={() => loadSampleReceipt('transporte')}
              className="px-2.5 py-1 text-xs rounded-md bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              Pedro Gómez - Mensajería ($38.000 / Dev: $12.000)
            </button>
            <button
              type="button"
              onClick={() => loadSampleReceipt('aseo')}
              className="px-2.5 py-1 text-xs rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Marta Henao - Aseo ($54.200 / Dev: $5.800)
            </button>
          </div>

          {/* Feedback messages */}
          {scanStatusMessage && (
            <div className="mt-3 p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{scanStatusMessage}</span>
              </div>
              {previewFileName && (
                <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-sky-300">
                  {previewFileName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: Formulario de Datos */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div
            className={`p-4 rounded-xl border transition-all ${
              aiHighlight
                ? 'bg-amber-50/60 border-amber-300 shadow-md ring-2 ring-amber-400/30'
                : 'bg-white border-slate-200'
            }`}
          >
            {/* SUB-SECTION A: QUIÉN GASTÓ Y VINCULACIÓN DE VALE */}
            <div className="mb-4 pb-4 border-b border-slate-200">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block mb-3">
                1. Datos del Responsable y Solicitante
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quién gastó */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>¿Quién gastó / Responsable? *</span>
                    </label>
                    {onOpenPeopleManager && (
                      <button
                        type="button"
                        onClick={onOpenPeopleManager}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                        title="Gestionar lista de personas"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>+ Gestionar</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {/* Select from existing collaborators */}
                    <select
                      value={collaborators.some((c) => c.name === responsiblePerson) ? responsiblePerson : 'custom'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'custom') {
                          setResponsiblePerson(val);
                          const found = collaborators.find((c) => c.name === val);
                          if (found) setDepartment(found.department);
                        }
                      }}
                      className="w-full text-xs px-2.5 py-1.5 bg-indigo-50/70 border border-indigo-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="" disabled>-- Seleccionar de la lista de personal --</option>
                      {collaborators.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} — {c.department}
                        </option>
                      ))}
                      <option value="custom">✏️ Escribir otro nombre personalizado...</option>
                    </select>

                    {/* Editable input field */}
                    <input
                      type="text"
                      required
                      placeholder="Nombre del colaborador o solicitante"
                      value={responsiblePerson}
                      onChange={(e) => {
                        const val = e.target.value;
                        setResponsiblePerson(val);
                        const found = collaborators.find(
                          (c) => c.name.toLowerCase() === val.toLowerCase()
                        );
                        if (found) setDepartment(found.department);
                      }}
                      list="dynamic-staff-list"
                      className="w-full text-sm px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 shadow-xs"
                    />
                    <datalist id="dynamic-staff-list">
                      {collaborators.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.department} {c.role ? `• ${c.role}` : ''}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Área / Departamento */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Área / Departamento
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Taller Litografía, Mensajería, Diseño"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                {/* Vale Provisional Asociado */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Vale Provisional Previo</span>
                  </label>
                  <select
                    value={voucherNumber}
                    onChange={(e) => handleVoucherSelect(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  >
                    <option value="">-- Sin Vale Previo (Gasto Directo) --</option>
                    {vouchers.map((v) => (
                      <option key={v.id} value={v.code}>
                        {v.code} - {v.beneficiary} ({formatCOP(v.amount)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SUB-SECTION B: FACTURA Y PROVEEDOR */}
            <div className="mb-4 pb-4 border-b border-slate-200">
              <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wider block mb-3">
                2. Datos de la Factura y Proveedor
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fecha */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Fecha del Comprobante *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                {/* Número de Factura */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-slate-500" />
                    <span>No. Factura / Tiquete *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. FE-1094 o POS-4402"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-mono"
                  />
                </div>

                {/* Tipo de Documento DIAN */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Soporte DIAN
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => {
                      const newType = e.target.value as DocumentType;
                      setDocumentType(newType);
                      setComplianceStatus(newType === 'Documento Soporte' ? 'Documento Soporte' : 'Válido DIAN');
                    }}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  >
                    <option value="Factura Electrónica">Factura Electrónica (Res. 000165)</option>
                    <option value="Tiquete POS">Tiquete POS Electrónico</option>
                    <option value="Documento Soporte">Documento Soporte (No obligados)</option>
                    <option value="Comprobante de Caja">Comprobante Interno de Caja</option>
                  </select>
                </div>

                {/* Proveedor / Razón Social */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>Proveedor / Tercero *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre o Razón Social del establecimiento"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>

                {/* NIT / Cédula */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    NIT / Cédula *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. 900.542.118-4"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-mono"
                  />
                </div>

                {/* Categoría P.U.C. */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    <span>Rubro / Categoría *</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white font-medium"
                  >
                    {CATEGORIES_CONFIG.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} (PUC {cat.pucCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descripción / En qué se gastó */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ¿En qué se gastó? (Descripción del gasto / artículos) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Detalla con claridad en qué se gastó el dinero..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SUB-SECTION C: CUÁNTO FUE, DINERO ENTREGADO Y DEVUELTA */}
            <div>
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block mb-3">
                3. Montos: Dinero Entregado, Valor Factura y Devuelta Reintegrada
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                {/* Dinero Entregado */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Dinero Entregado (COP)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Monto entregado al colaborador"
                    value={cashAdvanceGiven}
                    onChange={(e) => handleAdvanceChange(e.target.value)}
                    className="w-full text-base font-bold text-indigo-900 px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Efectivo salido de caja menor
                  </span>
                </div>

                {/* Cuánto fue (Valor Factura) */}
                <div>
                  <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-rose-600" />
                    <span>¿Cuánto fue el Gasto Real? *</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Valor total según factura"
                    value={total}
                    onChange={(e) => handleTotalChange(e.target.value)}
                    className="w-full text-base font-black text-rose-700 px-3 py-2 bg-rose-50/60 border-2 border-rose-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Valor total de la factura / soporte
                  </span>
                </div>

                {/* Devuelta reintegrada a caja */}
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Devuelta a Caja (COP)</span>
                  </label>
                  <input
                    type="number"
                    value={changeReturned}
                    onChange={(e) => setChangeReturned(e.target.value)}
                    className="w-full text-base font-black text-emerald-700 px-3 py-2 bg-emerald-50/60 border-2 border-emerald-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
                    = Entregado - Factura (reingresa a gaveta)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Registrar Gasto y Devuelta en Kárdex</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

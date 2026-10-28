export type ExpenseCategory =
  | 'Papelería y Útiles'
  | 'Aseo y Cafetería'
  | 'Repuestos y Mantenimiento Litografía'
  | 'Transporte y Mensajería'
  | 'Combustibles y Peajes'
  | 'Servicios y Fotocopias'
  | 'Otros Gastos Menores';

export type DocumentType =
  | 'Factura Electrónica'
  | 'Tiquete POS'
  | 'Documento Soporte'
  | 'Comprobante de Caja';

export type ComplianceStatus = 'Válido DIAN' | 'Documento Soporte' | 'Observación';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  voucherNumber?: string; // Vale Provisional (ej. VP-001)
  invoiceNumber: string; // No. Factura o tiquete
  provider: string; // Nombre o Razón Social
  nit: string; // NIT o Cédula
  responsiblePerson: string; // ¿Quién gastó? (Colaborador / Solicitante)
  department?: string; // Área o Departamento
  cashAdvanceGiven?: number; // Cuánto dinero se le entregó
  changeReturned?: number; // Devuelta / Cambio reintegrado a la caja
  category: ExpenseCategory;
  description: string; // En qué se gastó
  subtotal: number;
  iva: number;
  total: number; // Cuánto fue el gasto real
  documentType: DocumentType;
  complianceStatus: ComplianceStatus;
  receiptImage?: string; // Data URL or asset path
  receiptName?: string;
  createdAt: string;
}

export interface DailyClosingRecord {
  id: string;
  actaNumber: string;
  date: string;
  openingCash: number;
  totalExpenses: number;
  totalCashAdvanceGiven: number;
  totalChangeReturned: number;
  closingCashInDrawer: number;
  transactionCount: number;
  custodianName: string;
  observations: string;
  transactionsSnapshot: Transaction[];
  status: 'Cerrado';
  createdAt: string;
}

export interface Collaborator {
  id: string;
  name: string;
  idNumber?: string; // Cédula o documento
  department: string; // Área o Departamento
  role?: string; // Cargo o función
  phone?: string;
  active: boolean;
  createdAt?: string;
}

export interface ProvisionalVoucher {
  id: string;
  code: string; // ej. VP-018
  beneficiary: string; // Colaborador solicitante
  department: string; // Área (ej. Producción / Taller Litográfico)
  dateIssued: string;
  amount: number;
  purpose: string;
  status: 'Pendiente' | 'Legalizado' | 'Vencido';
  deadlineHours: number; // 24 a 48h según normativa
}

export interface CashArqueoRecord {
  id: string;
  date: string;
  auditorName: string;
  custodianName: string;
  denominations: {
    b100k: number;
    b50k: number;
    b20k: number;
    b10k: number;
    b5k: number;
    b2k: number;
    coins: number;
  };
  physicalCashTotal: number;
  provisionalVouchersTotal: number;
  registeredReceiptsTotal: number;
  totalAudited: number;
  assignedFund: number;
  difference: number;
  status: 'Cuadrado' | 'Faltante' | 'Sobrante';
  observations: string;
}

export interface FundSettings {
  companyName: string;
  companyNit: string;
  custodian: string;
  approver: string;
  initialFund: number; // $2.000.000 COP
  reimbursementThresholdPercent: number; // 70% ($1.400.000)
  minBalanceThreshold: number; // $600.000 COP
  currentPeriod: string; // Mes contable actual
}

export interface ReimbursementRecord {
  id: string;
  date: string;
  periodLabel: string;
  amountSpent: number;
  reimbursedAmount: number;
  transferOrCheckNumber: string;
  accountantName: string;
  transactionCount: number;
}

export interface MonthlyClosingRecord {
  id: string;
  actaNumber: string;
  periodLabel: string;
  nextPeriodLabel: string;
  closingDate: string;
  initialFund: number;
  totalSpent: number;
  totalSubtotal: number;
  totalIva: number;
  remainingCash: number;
  reimbursementAmount: number;
  transferOrCheckNumber: string;
  custodianName: string;
  auditorName: string;
  approvedBy: string;
  transactionCount: number;
  transactionsSnapshot: Transaction[];
  vouchersSnapshot: ProvisionalVoucher[];
  categorySummary: { category: string; total: number; percentage: number; pucCode: string }[];
  status: 'Cerrado y Restituido';
  notes: string;
}

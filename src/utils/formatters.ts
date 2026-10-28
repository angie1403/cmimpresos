import { Transaction, ExpenseCategory } from '../types/cajaMenor';

/**
 * Format a numeric amount to Colombian Pesos (COP) currency string
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date string YYYY-MM-DD to readable Spanish date
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Generate and download a consolidated CSV file with UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  companyName: string = 'Impresos El Día S.A.S.',
  period: string = 'Octubre 2026'
) {
  const headers = [
    'ID',
    'Fecha',
    '¿Quién gastó? (Responsable)',
    'Área / Departamento',
    'Vale Provisional',
    'No. Factura/Soporte',
    'Tipo Soporte',
    'Proveedor / Tercero',
    'NIT / Cédula',
    'Categoría P.U.C.',
    '¿En qué se gastó? (Descripción)',
    'Dinero Entregado (COP)',
    'Valor Factura / Gasto (COP)',
    'Devuelta a Caja (COP)',
    'Subtotal (COP)',
    'IVA (COP)',
    'Estado DIAN',
  ];

  const rows = transactions.map((tx) => [
    `"${tx.id}"`,
    `"${tx.date}"`,
    `"${(tx.responsiblePerson || 'Carlos Montoya').replace(/"/g, '""')}"`,
    `"${(tx.department || 'General').replace(/"/g, '""')}"`,
    `"${tx.voucherNumber || 'N/A'}"`,
    `"${tx.invoiceNumber}"`,
    `"${tx.documentType}"`,
    `"${tx.provider.replace(/"/g, '""')}"`,
    `"${tx.nit}"`,
    `"${tx.category}"`,
    `"${tx.description.replace(/"/g, '""')}"`,
    tx.cashAdvanceGiven || tx.total,
    tx.total,
    tx.changeReturned || 0,
    tx.subtotal,
    tx.iva,
    `"${tx.complianceStatus}"`,
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM
    `"REPORTE CONSOLIDADO DE CAJA MENOR - ${companyName}"\n` +
    `"Período: ${period}"\n` +
    `"Generado: ${new Date().toLocaleString('es-CO')}"\n\n` +
    headers.join(';') +
    '\n' +
    rows.map((r) => r.join(';')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Caja_Menor_${companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export full backup state as JSON
 */
export function downloadBackupJSON(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

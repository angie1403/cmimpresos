import React, { useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_FUND_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_PROVISIONAL_VALES,
  INITIAL_MONTHLY_CLOSINGS,
  INITIAL_DAILY_CLOSINGS,
  INITIAL_COLLABORATORS,
} from './data/initialData';
import {
  Transaction,
  FundSettings,
  ProvisionalVoucher,
  CashArqueoRecord,
  ReimbursementRecord,
  MonthlyClosingRecord,
  DailyClosingRecord,
  Collaborator,
} from './types/cajaMenor';
import { Navbar } from './components/Navbar';
import { BalanceSummary } from './components/BalanceSummary';
import { TransactionForm } from './components/TransactionForm';
import { KardexTable } from './components/KardexTable';
import { CashArqueoModal } from './components/CashArqueoModal';
import { DailyClosingModal } from './components/DailyClosingModal';
import { MonthClosingModal } from './components/MonthClosingModal';
import { MonthClosingHistoryView } from './components/MonthClosingHistoryView';
import { PeopleManagerModal } from './components/PeopleManagerModal';
import { FlowchartModal } from './components/FlowchartModal';
import { ReportsView } from './components/ReportsView';
import { NormativaView } from './components/NormativaView';
import { ReimbursementModal } from './components/ReimbursementModal';
import { PwaModal } from './components/PwaModal';
import { PrintSheet } from './components/PrintSheet';
import { exportTransactionsToCSV, downloadBackupJSON } from './utils/formatters';

const STORAGE_KEY = 'caja_menor_impresos_el_dia_v2';

export default function App() {
  // Application State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tx`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [settings, setSettings] = useState<FundSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : DEFAULT_FUND_SETTINGS;
    } catch {
      return DEFAULT_FUND_SETTINGS;
    }
  });

  const [vouchers, setVouchers] = useState<ProvisionalVoucher[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_vouchers`);
      return saved ? JSON.parse(saved) : INITIAL_PROVISIONAL_VALES;
    } catch {
      return INITIAL_PROVISIONAL_VALES;
    }
  });

  const [arqueoHistory, setArqueoHistory] = useState<CashArqueoRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_arqueos`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dailyClosings, setDailyClosings] = useState<DailyClosingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_daily_closings`);
      return saved ? JSON.parse(saved) : INITIAL_DAILY_CLOSINGS;
    } catch {
      return INITIAL_DAILY_CLOSINGS;
    }
  });

  const [monthlyClosings, setMonthlyClosings] = useState<MonthlyClosingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_monthly_closings`);
      return saved ? JSON.parse(saved) : INITIAL_MONTHLY_CLOSINGS;
    } catch {
      return INITIAL_MONTHLY_CLOSINGS;
    }
  });

  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_collaborators`);
      return saved ? JSON.parse(saved) : INITIAL_COLLABORATORS;
    } catch {
      return INITIAL_COLLABORATORS;
    }
  });

  // UI Navigation & Modals
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showArqueoModal, setShowArqueoModal] = useState<boolean>(false);
  const [showDailyClosingModal, setShowDailyClosingModal] = useState<boolean>(false);
  const [showReimbursementModal, setShowReimbursementModal] = useState<boolean>(false);
  const [showMonthClosingModal, setShowMonthClosingModal] = useState<boolean>(false);
  const [showPeopleModal, setShowPeopleModal] = useState<boolean>(false);
  const [showFlowchartModal, setShowFlowchartModal] = useState<boolean>(false);
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);
  const [pwaModalMode, setPwaModalMode] = useState<'install' | 'uninstall'>('install');
  const [showPrintSheet, setShowPrintSheet] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Ahora');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Save state to localStorage helper
  const persistAllData = useCallback(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tx`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
      localStorage.setItem(`${STORAGE_KEY}_vouchers`, JSON.stringify(vouchers));
      localStorage.setItem(`${STORAGE_KEY}_arqueos`, JSON.stringify(arqueoHistory));
      localStorage.setItem(`${STORAGE_KEY}_daily_closings`, JSON.stringify(dailyClosings));
      localStorage.setItem(`${STORAGE_KEY}_monthly_closings`, JSON.stringify(monthlyClosings));
      localStorage.setItem(`${STORAGE_KEY}_collaborators`, JSON.stringify(collaborators));

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      setLastSavedTime(timeStr);
      return timeStr;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return null;
    }
  }, [transactions, settings, vouchers, arqueoHistory, dailyClosings, monthlyClosings, collaborators]);

  // Auto-Save Effect
  useEffect(() => {
    persistAllData();
  }, [persistAllData]);

  // Explicit Handler: Guardar Avances
  const handleSaveProgress = () => {
    const time = persistAllData();
    showToast(`💾 ¡Avances guardados exitosamente a las ${time || 'este instante'}!`);
  };

  // Open PWA Modal with specified mode
  const handleOpenPwaModal = (mode: 'install' | 'uninstall') => {
    setPwaModalMode(mode);
    setShowPwaModal(true);
  };

  // Handler: Add new transaction
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    // If associated with a provisional voucher, mark voucher as Legalizado
    if (newTx.voucherNumber) {
      setVouchers((prev) =>
        prev.map((v) =>
          v.code === newTx.voucherNumber ? { ...v, status: 'Legalizado' } : v
        )
      );
    }

    showToast(`✓ Gasto de $${newTx.total.toLocaleString('es-CO')} registrado (${newTx.responsiblePerson})`);
    setCurrentTab('dashboard');
  };

  // Handler: Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Comprobante eliminado del Kárdex');
  };

  // Handler: Add Provisional Voucher
  const handleAddVoucher = (newVoucherData: Omit<ProvisionalVoucher, 'id'>) => {
    const voucher: ProvisionalVoucher = {
      ...newVoucherData,
      id: `vale-${Date.now()}`,
    };
    setVouchers((prev) => [voucher, ...prev]);
    showToast(`✓ Vale provisional ${voucher.code} emitido a ${voucher.beneficiary}`);
  };

  // Handler: Save Arqueo Record
  const handleSaveArqueo = (record: CashArqueoRecord) => {
    setArqueoHistory((prev) => [record, ...prev]);
    showToast('✓ Acta de Arqueo Sorpresa guardada en el historial');
  };

  // Handler: Save Daily Closing Record
  const handleSaveDailyClosing = (record: DailyClosingRecord) => {
    setDailyClosings((prev) => [record, ...prev]);
    showToast(`✓ Acta de Cierre Diario (${record.date}) guardada exitosamente`);
  };

  // Handler: Confirm Reimbursement (Restitución del Fondo)
  const handleConfirmReimbursement = (record: ReimbursementRecord) => {
    setTransactions([]);
    setVouchers((prev) => prev.filter((v) => v.status === 'Pendiente'));
    showToast(`✓ Fondo restituido exitosamente a $${settings.initialFund.toLocaleString('es-CO')}`);
  };

  // Handler: Confirm Monthly Closing (Cierre de Mes)
  const handleConfirmMonthClosing = (closingRecord: MonthlyClosingRecord) => {
    setMonthlyClosings((prev) => [closingRecord, ...prev]);
    setTransactions([]);
    setVouchers((prev) => prev.filter((v) => v.status === 'Pendiente'));
    setSettings((prev) => ({
      ...prev,
      currentPeriod: closingRecord.nextPeriodLabel,
    }));
    setShowMonthClosingModal(false);
    showToast(`🎉 ¡Cierre de ${closingRecord.periodLabel} completado! Nuevo período: ${closingRecord.nextPeriodLabel}`);
    setCurrentTab('cierre-mes');
  };

  // Handler: Add Collaborator
  const handleAddCollaborator = (collabData: Omit<Collaborator, 'id' | 'createdAt'>) => {
    const newCollab: Collaborator = {
      ...collabData,
      id: `collab-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCollaborators((prev) => [newCollab, ...prev]);
    showToast(`✓ Colaborador "${newCollab.name}" agregado exitosamente`);
  };

  // Handler: Update Collaborator
  const handleUpdateCollaborator = (updatedCollab: Collaborator) => {
    setCollaborators((prev) =>
      prev.map((c) => (c.id === updatedCollab.id ? updatedCollab : c))
    );
    showToast(`✓ Datos de "${updatedCollab.name}" actualizados`);
  };

  // Handler: Delete Collaborator
  const handleDeleteCollaborator = (id: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
    showToast('Colaborador eliminado del directorio');
  };

  // Handler: Backup Download (Guardar avances en archivo .json)
  const handleBackupDownload = () => {
    const backupData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      company: settings.companyName,
      settings,
      transactions,
      vouchers,
      arqueoHistory,
      dailyClosings,
      monthlyClosings,
      collaborators,
    };
    const dateStr = new Date().toISOString().split('T')[0];
    downloadBackupJSON(backupData, `CajaMenor_Respaldo_${settings.companyName.replace(/\s+/g, '_')}_${dateStr}.json`);
    showToast('✓ Copia de seguridad descargada en formato .json');
  };

  // Handler: Backup Upload (Restaurar avances)
  const handleBackupUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed && parsed.transactions && Array.isArray(parsed.transactions)) {
          setTransactions(parsed.transactions);
          if (parsed.settings) setSettings(parsed.settings);
          if (parsed.vouchers) setVouchers(parsed.vouchers);
          if (parsed.arqueoHistory) setArqueoHistory(parsed.arqueoHistory);
          if (parsed.dailyClosings) setDailyClosings(parsed.dailyClosings);
          if (parsed.monthlyClosings) setMonthlyClosings(parsed.monthlyClosings);
          if (parsed.collaborators && Array.isArray(parsed.collaborators)) {
            setCollaborators(parsed.collaborators);
          }
          showToast('✓ Respaldo restaurado exitosamente');
        } else {
          alert('El archivo no tiene el formato válido de respaldo de Caja Menor.');
        }
      } catch (e) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default sample data
  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(DEFAULT_FUND_SETTINGS);
    setVouchers(INITIAL_PROVISIONAL_VALES);
    setArqueoHistory([]);
    setDailyClosings(INITIAL_DAILY_CLOSINGS);
    setMonthlyClosings(INITIAL_MONTHLY_CLOSINGS);
    setCollaborators(INITIAL_COLLABORATORS);
    showToast('✓ Datos oficiales de muestra restaurados');
  };

  // Export to CSV
  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, settings.companyName, settings.currentPeriod);
    showToast('✓ Archivo CSV con responsables y devueltas descargado con éxito');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        settings={settings}
        onSaveProgress={handleSaveProgress}
        onBackupDownload={handleBackupDownload}
        onBackupUpload={handleBackupUpload}
        onResetData={handleResetData}
        onOpenPwaModal={handleOpenPwaModal}
        onOpenDailyClosing={() => setShowDailyClosingModal(true)}
        onOpenMonthClosing={() => setShowMonthClosingModal(true)}
        onOpenPeopleModal={() => setShowPeopleModal(true)}
        onOpenFlowchart={() => setShowFlowchartModal(true)}
        lastSavedTime={lastSavedTime}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: Tablero Principal & Kárdex */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Cards */}
            <BalanceSummary
              settings={settings}
              transactions={transactions}
              vouchers={vouchers}
              onRequestReimbursement={() => setShowReimbursementModal(true)}
              onOpenNewExpense={() => setCurrentTab('new-expense')}
              onOpenArqueo={() => setShowArqueoModal(true)}
              onOpenDailyClosing={() => setShowDailyClosingModal(true)}
              onOpenMonthClosing={() => setShowMonthClosingModal(true)}
              onOpenFlowchart={() => setShowFlowchartModal(true)}
            />

            {/* Kárdex Auxiliar Table */}
            <KardexTable
              transactions={transactions}
              settings={settings}
              onDeleteTransaction={handleDeleteTransaction}
              onExportCSV={handleExportCSV}
            />
          </div>
        )}

        {/* TAB 2: Registrar Gasto (Manual + OCR IA) */}
        {currentTab === 'new-expense' && (
          <div className="animate-in fade-in duration-200">
            <TransactionForm
              onAddTransaction={handleAddTransaction}
              vouchers={vouchers}
              collaborators={collaborators}
              onOpenPeopleManager={() => setShowPeopleModal(true)}
              onClose={() => setCurrentTab('dashboard')}
            />
          </div>
        )}

        {/* TAB 2.5: Flujograma Oficial de Caja Menor */}
        {currentTab === 'flujograma' && (
          <div className="animate-in fade-in duration-200">
            <FlowchartModal
              onClose={() => setCurrentTab('dashboard')}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              onOpenNewExpense={() => setCurrentTab('new-expense')}
              onOpenMonthClosing={() => setShowMonthClosingModal(true)}
            />
          </div>
        )}

        {/* TAB 3: Arqueo Sorpresa (Full View & History) */}
        {currentTab === 'arqueo' && (
          <div className="animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Módulo de Arqueos Sorpresa y Vales Provisionales
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verificación contable sin previo aviso conforme al Paso 6 del manual de Impresos El Día S.A.S.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDailyClosingModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow transition-colors"
                  >
                    🕒 Cierre del Día
                  </button>
                  <button
                    onClick={() => setShowArqueoModal(true)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow transition-colors"
                  >
                    + Iniciar Nuevo Arqueo en Vivo
                  </button>
                </div>
              </div>

              {/* Arqueo Explanation and History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-200 space-y-2">
                  <span className="font-bold text-sky-900 block text-sm">
                    Ecuación Fundamental del Arqueo
                  </span>
                  <p className="text-slate-700">
                    En todo momento, la suma del efectivo físico en gaveta, los vales provisionales aún no legalizados y los comprobantes o facturas pendientes de reembolso debe sumar con exactitud los <strong>${settings.initialFund.toLocaleString('es-CO')} COP</strong> asignados.
                  </p>
                  <div className="font-mono text-xs bg-white p-2.5 rounded border border-sky-300 text-sky-950 font-bold">
                    Efectivo en Caja + Vales Vigentes + Facturas = $2.000.000 COP
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-2">
                  <span className="font-bold text-indigo-900 block text-sm">
                    Control de Vales Provisionales (Paso 2)
                  </span>
                  <p className="text-slate-700">
                    Todo colaborador que reciba efectivo anticipado debe contar con el vale firmado por su jefe de área y cuenta con un plazo máximo de <strong>24 a 48 horas</strong> para entregar la factura electrónica formal a nombre de la empresa.
                  </p>
                  <div className="text-[11px] text-indigo-700">
                    Vales actualmente pendientes: <strong>{vouchers.filter((v) => v.status === 'Pendiente').length}</strong>
                  </div>
                </div>
              </div>

              {/* Historical Arqueos List */}
              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-800 mb-3">
                  Historial de Arqueos Registrados ({arqueoHistory.length})
                </h3>
                {arqueoHistory.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No se han registrado arqueos previos en esta sesión. Haz clic en el botón superior para realizar el primer arqueo.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {arqueoHistory.map((arq) => (
                      <div key={arq.id} className="p-4 hover:bg-slate-50 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800 flex items-center space-x-2">
                            <span>Fecha: {arq.date}</span>
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
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Auditor: {arq.auditorName} • Custodio: {arq.custodianName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900">
                            Total: ${arq.totalAudited.toLocaleString('es-CO')}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Diferencia: ${arq.difference.toLocaleString('es-CO')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Cierre de Mes (Historial de Cierres & Liquidaciones) */}
        {currentTab === 'cierre-mes' && (
          <div className="animate-in fade-in duration-200">
            <MonthClosingHistoryView
              settings={settings}
              transactions={transactions}
              vouchers={vouchers}
              monthlyClosings={monthlyClosings}
              onOpenCloseMonthModal={() => setShowMonthClosingModal(true)}
            />
          </div>
        )}

        {/* TAB 5: Reportes Consolidados, Responsables & DIAN */}
        {currentTab === 'reports' && (
          <div className="animate-in fade-in duration-200">
            <ReportsView
              transactions={transactions}
              settings={settings}
              arqueoHistory={arqueoHistory}
              onExportCSV={handleExportCSV}
              onPrintOfficial={() => setShowPrintSheet(true)}
            />
          </div>
        )}

        {/* TAB 6: Normativa & Ajustes del Fondo */}
        {currentTab === 'normativa' && (
          <div className="animate-in fade-in duration-200">
            <NormativaView
              settings={settings}
              onUpdateSettings={(newSettings) => {
                setSettings(newSettings);
                showToast('✓ Parámetros del fondo actualizados');
              }}
            />
          </div>
        )}
      </main>

      {/* MODAL 1: Arqueo Sorpresa Modal */}
      {showArqueoModal && (
        <CashArqueoModal
          settings={settings}
          transactions={transactions}
          vouchers={vouchers}
          onAddVoucher={handleAddVoucher}
          onSaveArqueo={handleSaveArqueo}
          onClose={() => setShowArqueoModal(false)}
        />
      )}

      {/* MODAL 2: Cierre del Día Modal */}
      {showDailyClosingModal && (
        <DailyClosingModal
          settings={settings}
          transactions={transactions}
          onSaveDailyClosing={handleSaveDailyClosing}
          onClose={() => setShowDailyClosingModal(false)}
        />
      )}

      {/* MODAL 3: Reembolso / Restitución del Fondo Modal */}
      {showReimbursementModal && (
        <ReimbursementModal
          settings={settings}
          transactions={transactions}
          onConfirmReimbursement={handleConfirmReimbursement}
          onClose={() => setShowReimbursementModal(false)}
        />
      )}

      {/* MODAL 4: Cierre de Mes Modal */}
      {showMonthClosingModal && (
        <MonthClosingModal
          settings={settings}
          transactions={transactions}
          vouchers={vouchers}
          onConfirmClosing={handleConfirmMonthClosing}
          onClose={() => setShowMonthClosingModal(false)}
        />
      )}

      {/* MODAL 5: PWA / Desktop App Install & Uninstall Modal */}
      {showPwaModal && (
        <PwaModal
          initialMode={pwaModalMode}
          onClose={() => setShowPwaModal(false)}
        />
      )}

      {/* MODAL 6: Official Printable Sheet */}
      {showPrintSheet && (
        <PrintSheet
          transactions={transactions}
          settings={settings}
          onClose={() => setShowPrintSheet(false)}
        />
      )}

      {/* MODAL 7: Directorio de Colaboradores (Editable) */}
      {showPeopleModal && (
        <PeopleManagerModal
          collaborators={collaborators}
          onAddCollaborator={handleAddCollaborator}
          onUpdateCollaborator={handleUpdateCollaborator}
          onDeleteCollaborator={handleDeleteCollaborator}
          onClose={() => setShowPeopleModal(false)}
          onSelectPerson={(person) => {
            showToast(`Colaborador seleccionado: ${person.name}`);
            setShowPeopleModal(false);
          }}
        />
      )}

      {/* MODAL 8: Flujograma Oficial de Caja Menor */}
      {showFlowchartModal && (
        <FlowchartModal
          onClose={() => setShowFlowchartModal(false)}
          onNavigateToTab={(tab) => setCurrentTab(tab)}
          onOpenNewExpense={() => {
            setShowFlowchartModal(false);
            setCurrentTab('new-expense');
          }}
          onOpenMonthClosing={() => {
            setShowFlowchartModal(false);
            setShowMonthClosingModal(true);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-300">{settings.companyName}</span> • NIT: {settings.companyNit}
          </div>
          <div className="text-[11px] text-slate-500">
            Alineado con Decreto 1068/2015 • Decreto 2568/2010 • Resolución DIAN 000165
          </div>
        </div>
      </footer>
    </div>
  );
}

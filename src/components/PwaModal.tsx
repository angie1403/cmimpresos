import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Monitor,
  Download,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  X,
  ExternalLink,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface PwaModalProps {
  onClose: () => void;
  initialMode?: 'install' | 'uninstall' | 'general';
}

export const PwaModal: React.FC<PwaModalProps> = ({ onClose, initialMode = 'general' }) => {
  const [activeTab, setActiveTab] = useState<'install' | 'uninstall'>(
    initialMode === 'uninstall' ? 'uninstall' : 'install'
  );
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if running as standalone PWA
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsStandalone(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setStatusMessage('¡Aplicación instalada exitosamente en tu dispositivo!');
        setDeferredPrompt(null);
      }
    } else {
      setStatusMessage(
        'Para instalar: en Chrome o Edge haz clic en el ícono de instalación en la barra de direcciones (arriba a la derecha), o menú ⋮ > "Instalar Caja Menor".'
      );
    }
  };

  const handleUninstallClick = async () => {
    try {
      // Unregister any active service workers if present
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      setStatusMessage(
        'Acción completada: Para remover el icono de tu escritorio o móvil, haz clic en el menú ⋮ de la ventana de la app y selecciona "Desinstalar Caja Menor..." o elimina el acceso directo.'
      );
    } catch {
      setStatusMessage('Para desinstalar, abre el menú ⋮ de la ventana y selecciona "Desinstalar Caja Menor".');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 text-xs">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Gestión de Aplicación (Instalar / Desinstalar)
              </h3>
              <p className="text-xs text-slate-400">
                Modo Escritorio y Móvil de Caja Menor (PWA)
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'install'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar Aplicación</span>
          </button>
          <button
            onClick={() => setActiveTab('uninstall')}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'uninstall'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Desinstalar Aplicación</span>
          </button>
        </div>

        <div className="p-6 space-y-5 text-slate-600">
          {/* Status Badge */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 block">
                  Estado Actual de Ejecución
                </span>
                <span className="text-slate-500 text-[11px]">
                  {isStandalone
                    ? 'Ejecutando en ventana independiente (PWA instalada)'
                    : 'Ejecutando en pestaña de navegador web'}
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                isStandalone
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isStandalone ? 'Instalada' : 'Navegador Web'}
            </span>
          </div>

          {/* TAB CONTENT: INSTALL */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <strong className="text-slate-800 block text-xs">Acceso Rápido</strong>
                  <span className="text-[11px] text-slate-500">
                    Abre la app directamente desde tu barra de tareas o pantalla de inicio.
                  </span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <strong className="text-slate-800 block text-xs">Trabajo Offline</strong>
                  <span className="text-[11px] text-slate-500">
                    Sigue registrando facturas y vales sin necesidad de conexión.
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-1.5 text-slate-700">
                <span className="font-bold text-sky-900 block">Instrucciones de Instalación:</span>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>
                    <strong>En Chrome o Edge:</strong> Haz clic en el botón "Instalar Ahora" abajo o en el icono de instalación (pantalla con flecha) en la barra de direcciones.
                  </li>
                  <li>
                    <strong>En Celular Android / iPhone:</strong> Presiona el menú del navegador y selecciona <em>"Agregar a pantalla de inicio"</em>.
                  </li>
                </ul>
              </div>

              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Ahora en este Dispositivo</span>
              </button>
            </div>
          )}

          {/* TAB CONTENT: UNINSTALL */}
          {activeTab === 'uninstall' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-950">
                <span className="font-bold text-rose-900 block flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>¿Cómo Desinstalar la Aplicación?</span>
                </span>
                <p className="text-[11px] leading-relaxed">
                  Para remover la aplicación de tu computadora o teléfono móvil según tu navegador:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-[11px] text-rose-900">
                  <li>
                    <strong>En Google Chrome o Microsoft Edge (PC/Mac):</strong>
                    <br />
                    Haz clic en los tres puntos verticales (⋮) en la esquina superior derecha de la ventana de la app y selecciona <strong>"Desinstalar Caja Menor..."</strong>.
                  </li>
                  <li>
                    <strong>En Dispositivos Móviles (Android / iPhone):</strong>
                    <br />
                    Mantén presionado el icono de la aplicación en tu pantalla de inicio y selecciona <strong>"Eliminar"</strong> o <strong>"Desinstalar"</strong>.
                  </li>
                </ul>
              </div>

              <button
                onClick={handleUninstallClick}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ejecutar Limpieza y Desvincular App</span>
              </button>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start space-x-2 text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Footer Action */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

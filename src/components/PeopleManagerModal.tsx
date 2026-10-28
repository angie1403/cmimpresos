import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Search,
  Building,
  Briefcase,
  IdCard,
  UserCheck,
} from 'lucide-react';
import { Collaborator } from '../types/cajaMenor';

interface PeopleManagerModalProps {
  collaborators: Collaborator[];
  onAddCollaborator: (collaborator: Omit<Collaborator, 'id' | 'createdAt'>) => void;
  onUpdateCollaborator: (collaborator: Collaborator) => void;
  onDeleteCollaborator: (id: string) => void;
  onClose: () => void;
  onSelectPerson?: (person: Collaborator) => void;
}

export const PeopleManagerModal: React.FC<PeopleManagerModalProps> = ({
  collaborators,
  onAddCollaborator,
  onUpdateCollaborator,
  onDeleteCollaborator,
  onClose,
  onSelectPerson,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [department, setDepartment] = useState('Taller Litografía (Prensa)');
  const [role, setRole] = useState('');

  const resetForm = () => {
    setName('');
    setIdNumber('');
    setDepartment('Taller Litografía (Prensa)');
    setRole('');
    setEditingId(null);
  };

  const handleStartEdit = (col: Collaborator) => {
    setEditingId(col.id);
    setName(col.name);
    setIdNumber(col.idNumber || '');
    setDepartment(col.department);
    setRole(col.role || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor ingresa el nombre de la persona');
      return;
    }

    if (editingId) {
      const existing = collaborators.find((c) => c.id === editingId);
      if (existing) {
        onUpdateCollaborator({
          ...existing,
          name: name.trim(),
          idNumber: idNumber.trim() || undefined,
          department: department.trim() || 'General',
          role: role.trim() || undefined,
        });
      }
    } else {
      onAddCollaborator({
        name: name.trim(),
        idNumber: idNumber.trim() || undefined,
        department: department.trim() || 'General',
        role: role.trim() || undefined,
        active: true,
      });
    }

    resetForm();
  };

  const filteredCollaborators = collaborators.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      (c.role && c.role.toLowerCase().includes(q)) ||
      (c.idNumber && c.idNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-6 text-xs">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Directorio de Personas y Colaboradores
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700">
                  {collaborators.length} registrados
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Agrega, edita o elimina colaboradores autorizados para solicitar dinero o legalizar gastos
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
          {/* Form to Add or Edit Person */}
          <form
            onSubmit={handleSubmit}
            className={`p-4 rounded-xl border transition-all ${
              editingId
                ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                : 'bg-indigo-50/40 border-indigo-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>{editingId ? 'Editar Colaborador' : 'Agregar Nueva Persona'}</span>
              </span>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Andres Restrepo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cédula / Documento</label>
                <input
                  type="text"
                  placeholder="ej. 71.890.123"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Área / Departamento *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Taller Litografía"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  list="departments-list"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
                <datalist id="departments-list">
                  <option value="Taller Litografía (Prensa)" />
                  <option value="Diseño & Preprensa" />
                  <option value="Mensajería y Logística" />
                  <option value="Mantenimiento de Máquinas" />
                  <option value="Servicios Generales y Aseo" />
                  <option value="Administración y Compras" />
                  <option value="Acabados y Guillotina" />
                </datalist>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cargo / Función</label>
                <input
                  type="text"
                  placeholder="ej. Operario de Prensa"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end items-center mt-3 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{editingId ? 'Guardar Cambios' : 'Agregar Persona'}</span>
              </button>
            </div>
          </form>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar colaborador por nombre, área o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          {/* Collaborators List Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-800 flex justify-between items-center">
              <span>Personas Registradas ({filteredCollaborators.length})</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Haz clic en una persona para seleccionarla directamente
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {filteredCollaborators.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No se encontraron colaboradores con el término de búsqueda.
                </div>
              ) : (
                filteredCollaborators.map((col) => (
                  <div
                    key={col.id}
                    className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => onSelectPerson && onSelectPerson(col)}
                    >
                      <div className="font-bold text-slate-900 text-xs flex items-center space-x-2">
                        <span>{col.name}</span>
                        {col.idNumber && (
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            C.C. {col.idNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span className="font-medium text-indigo-700">{col.department}</span>
                        {col.role && <span>• {col.role}</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {onSelectPerson && (
                        <button
                          type="button"
                          onClick={() => onSelectPerson(col)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-[11px] border border-indigo-200"
                        >
                          Seleccionar
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleStartEdit(col)}
                        title="Editar datos"
                        className="p-1.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Deseas eliminar a "${col.name}" de la lista de personas?`)) {
                            onDeleteCollaborator(col.id);
                          }
                        }}
                        title="Eliminar persona"
                        className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { PlusCircle, X, User, FileText, FileCheck, Check } from "lucide-react";
import { useAppliances } from "./AppliancesContext";

export const ApplianceForm: React.FC = () => {
  const {
    logs,
    editingId,
    applianceName,
    type,
    date,
    dateType,
    performer,
    cost,
    notes,
    parentId,
    fileName,
    fileBase64,
    fileType,
    setApplianceName,
    setDate,
    setDateType,
    setPerformer,
    setCost,
    setNotes,
    setParentId,
    handleFileChange,
    removeAttachedFile,
    handleTypeChange,
    handleSubmit,
    resetForm
  } = useAppliances();

  return (
    <div className="bg-slate-800 rounded-2xl border border-white/5 shadow-md overflow-hidden lg:sticky lg:top-4">
      <div className="p-6 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlusCircle className="text-indigo-500" />
          <h3 className="text-xl m-0 font-heading text-white">
            {editingId !== undefined ? "Editar Registro" : "Nuevo Registro"}
          </h3>
        </div>
        {editingId !== undefined && (
          <button
            onClick={resetForm}
            className="text-slate-400 hover:text-white bg-slate-700 p-1.5 rounded-full transition-colors"
            title="Cancelar Edición"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type selection */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-400">Tipo de Registro *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('buy')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 border ${type === 'buy'
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                  }`}
              >
                Compra
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('installation')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 border ${type === 'installation'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                  }`}
              >
                Instalación
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('maintenance')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 border ${type === 'maintenance'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-500'
                  }`}
              >
                Mantenimiento
              </button>
            </div>
          </div>

          {/* Link to Buy log (Only for installation or maintenance) */}
          {(type === 'installation' || type === 'maintenance') && (
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-400">Vincular a Equipo Comprado</label>
              <select
                value={parentId || ""}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : undefined;
                  setParentId(val);
                  // Auto-fill applianceName with parent's name
                  if (val) {
                    const parentLog = logs.find(l => l.id === val);
                    if (parentLog) {
                      setApplianceName(parentLog.applianceName);
                    }
                  }
                }}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              >
                <option value="">-- No vincular / Otro nombre --</option>
                {logs.filter(l => l.type === 'buy').map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.applianceName} ({parent.date}) - ${parent.cost.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Appliance Name */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-400">Electrodoméstico *</label>
            <input
              type="text"
              value={applianceName}
              onChange={(e) => setApplianceName(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              placeholder="Ej. Lavadora LG, Nevera Samsung"
              required
            />
          </div>

          {/* Date & DateType */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-400">Fecha *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-400">Precisión de Fecha</label>
              <div className="flex gap-4 items-center bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer flex-1 justify-center p-1 rounded hover:bg-slate-800">
                  <input
                    type="radio"
                    name="dateType"
                    checked={dateType === 'exact'}
                    onChange={() => setDateType('exact')}
                    className="text-indigo-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Exacta</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer flex-1 justify-center p-1 rounded hover:bg-slate-800">
                  <input
                    type="radio"
                    name="dateType"
                    checked={dateType === 'estimated'}
                    onChange={() => setDateType('estimated')}
                    className="text-indigo-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Estimada</span>
                </label>
              </div>
            </div>
          </div>

          {/* Who Performed */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-400">Realizado por *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
              <input
                type="text"
                value={performer}
                onChange={(e) => setPerformer(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
                placeholder="Ej. Técnico Autorizado, Tienda Almacén, Yo mismo"
                required
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-400">Costo ($) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-500 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full pl-8 pr-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-bold font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* File Attachment */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-400">Adjuntar Comprobante/Archivo</label>
            <div className="flex flex-col gap-2">
              <input
                id="file-upload"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="w-full flex items-center justify-center gap-2 p-3 bg-slate-900 border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl text-slate-400 hover:text-slate-200 transition-all duration-300 cursor-pointer"
              >
                <FileText size={18} className="text-slate-500" />
                <span className="text-xs">{fileName ? "Cambiar Archivo" : "Subir Imagen o PDF (< 3MB)"}</span>
              </button>

              {/* Attachment Preview / Info */}
              {fileName && (
                <div className="flex items-center justify-between bg-slate-900/60 border border-slate-700/80 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileCheck className="text-emerald-500 shrink-0" size={16} />
                    <span className="text-xs text-slate-300 truncate" title={fileName}>
                      {fileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachedFile}
                    className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer ml-2"
                    title="Remover Archivo"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {fileBase64 && fileType?.startsWith("image/") && (
                <div className="mt-1 rounded-xl overflow-hidden border border-slate-700 max-h-[120px] flex items-center justify-center bg-slate-900">
                  <img
                    src={fileBase64}
                    alt="Vista previa"
                    className="max-h-[120px] object-contain w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-400">Notas Adicionales</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              placeholder="Detalles sobre garantía, número de modelo, reportes de fallas..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold font-sans cursor-pointer transition-all duration-300 border-none text-[0.95rem] bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 active:scale-98"
          >
            {editingId !== undefined ? <Check size={18} /> : <PlusCircle size={18} />}
            <span>{editingId !== undefined ? "Guardar Cambios" : "Agregar Registro"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

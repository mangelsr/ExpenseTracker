import { useState, useEffect, FormEvent } from "react";
import {
  Tv,
  Calendar,
  DollarSign,
  User,
  Trash2,
  Wrench,
  FileText,
  PlusCircle,
  Search,
  X,
  Edit,
  Check,
  Hammer,
  ShoppingBag,
  FileCheck,
  Link as LinkIcon
} from "lucide-react";
import { ApplianceLog } from "../types";
import {
  getAllApplianceLogs,
  addApplianceLog,
  updateApplianceLog,
  deleteApplianceLog
} from "../utils/database";

export function AppliancesPage() {
  const [logs, setLogs] = useState<ApplianceLog[]>([]);

  // Form State
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [applianceName, setApplianceName] = useState("");
  const [type, setType] = useState<'buy' | 'installation' | 'maintenance'>('buy');
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateType, setDateType] = useState<'exact' | 'estimated'>('exact');
  const [performer, setPerformer] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [parentId, setParentId] = useState<number | undefined>(undefined);

  // File Upload State
  const [fileBase64, setFileBase64] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [fileType, setFileType] = useState<string | undefined>(undefined);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await getAllApplianceLogs();
      // Sort by date descending
      setLogs(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error("Error al cargar registros de electrodomésticos", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to ~3MB to prevent IndexDB size limits
    if (file.size > 3 * 1024 * 1024) {
      alert("El archivo es demasiado grande. El límite de tamaño es de 3 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
      setFileName(file.name);
      setFileType(file.type);
    };
    reader.onerror = () => {
      alert("Error al leer el archivo.");
    };
    reader.readAsDataURL(file);
  };

  const removeAttachedFile = () => {
    setFileBase64(undefined);
    setFileName(undefined);
    setFileType(undefined);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleTypeChange = (newType: 'buy' | 'installation' | 'maintenance') => {
    setType(newType);
    if (newType === 'buy') {
      setParentId(undefined);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!applianceName || !date || !type || !performer || !cost) {
      alert("Por favor completa los campos requeridos.");
      return;
    }

    const logData: ApplianceLog = {
      applianceName,
      type,
      date,
      dateType,
      performer,
      cost: parseFloat(cost),
      notes: notes || undefined,
      fileBase64,
      fileName,
      fileType,
      parentId: type !== 'buy' ? parentId : undefined
    };

    try {
      if (editingId !== undefined) {
        logData.id = editingId;
        await updateApplianceLog(logData);
        alert("Registro actualizado con éxito");
      } else {
        await addApplianceLog(logData);
        alert("Registro agregado con éxito");
      }

      resetForm();
      await loadLogs();
    } catch (error) {
      console.error("Error al guardar registro", error);
      alert("Hubo un error al guardar el registro.");
    }
  };

  const handleEdit = (log: ApplianceLog) => {
    setEditingId(log.id);
    setApplianceName(log.applianceName);
    setType(log.type);
    setDate(log.date);
    setDateType(log.dateType);
    setPerformer(log.performer);
    setCost(log.cost.toString());
    setNotes(log.notes || "");
    setFileBase64(log.fileBase64);
    setFileName(log.fileName);
    setFileType(log.fileType);
    setParentId(log.parentId);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este registro?")) {
      try {
        await deleteApplianceLog(id);

        // Also cleanup related children parentId references
        const relatedLogs = logs.filter(l => l.parentId === id);
        for (const childLog of relatedLogs) {
          await updateApplianceLog({
            ...childLog,
            parentId: undefined
          });
        }

        if (editingId === id) {
          resetForm();
        }
        await loadLogs();
      } catch (error) {
        console.error("Error al eliminar registro", error);
      }
    }
  };

  const resetForm = () => {
    setEditingId(undefined);
    setApplianceName("");
    setType("buy");
    setDate(new Date().toISOString().split("T")[0]);
    setDateType("exact");
    setPerformer("");
    setCost("");
    setNotes("");
    setFileBase64(undefined);
    setFileName(undefined);
    setFileType(undefined);
    setParentId(undefined);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Calculations for Summary
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.applianceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totals = logs.reduce((acc, log) => {
    if (log.type === "buy") acc.buy += log.cost;
    else if (log.type === "installation") acc.installation += log.cost;
    else if (log.type === "maintenance") acc.maintenance += log.cost;
    acc.total += log.cost;
    return acc;
  }, { buy: 0, installation: 0, maintenance: 0, total: 0 });

  return (
    <div className="animate-[fadeIn_0.4s_ease-out_forwards]">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-heading mb-2 text-white">Registro de Electrodomésticos</h2>
        <p className="text-slate-400">Registra y administra las compras, instalaciones y mantenimientos de tus equipos.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-white/5 rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShoppingBag size={80} className="text-indigo-500" />
          </div>
          <span className="text-slate-400 text-sm font-medium">Total Compras</span>
          <h3 className="text-2xl font-bold font-heading mt-2 mb-0 text-white">${totals.buy.toFixed(2)}</h3>
          <p className="text-indigo-400 text-xs mt-1">Electrodomésticos adquiridos</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-white/5 rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Hammer size={80} className="text-emerald-500" />
          </div>
          <span className="text-slate-400 text-sm font-medium">Total Instalaciones</span>
          <h3 className="text-2xl font-bold font-heading mt-2 mb-0 text-white">${totals.installation.toFixed(2)}</h3>
          <p className="text-emerald-400 text-xs mt-1">Costos de puesta en marcha</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-white/5 rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wrench size={80} className="text-amber-500" />
          </div>
          <span className="text-slate-400 text-sm font-medium">Total Mantenimientos</span>
          <h3 className="text-2xl font-bold font-heading mt-2 mb-0 text-white">${totals.maintenance.toFixed(2)}</h3>
          <p className="text-amber-400 text-xs mt-1">Reparaciones y preventivos</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-white/5 rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <DollarSign size={80} className="text-indigo-400" />
          </div>
          <span className="text-slate-400 text-sm font-medium">Gasto General</span>
          <h3 className="text-3xl font-bold font-heading mt-1 mb-0 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">${totals.total.toFixed(2)}</h3>
          <p className="text-slate-400 text-xs mt-1">Inversión total acumulada</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* Form Container */}
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

        {/* Logs List Container */}
        <div className="flex flex-col gap-6">
          {/* Controls: Search and Filters */}
          <div className="bg-slate-800 p-6 rounded-2xl border border-white/5 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar electrodoméstico..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 focus:outline-none focus:border-indigo-500 text-[0.9rem]"
              />
            </div>

            {/* Type Filters */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 ${typeFilter === "all"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                  : "bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-500"
                  }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTypeFilter("buy")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 ${typeFilter === "buy"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                  : "bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-500"
                  }`}
              >
                Compras
              </button>
              <button
                onClick={() => setTypeFilter("installation")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 ${typeFilter === "installation"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                  : "bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-500"
                  }`}
              >
                Instalaciones
              </button>
              <button
                onClick={() => setTypeFilter("maintenance")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 ${typeFilter === "maintenance"
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                  : "bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-500"
                  }`}
              >
                Mantenimiento
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredLogs.length === 0 ? (
            <div className="bg-slate-800/50 border border-white/5 border-dashed p-12 text-center rounded-2xl">
              <Tv className="mx-auto text-slate-600 mb-4" size={48} />
              <p className="text-slate-400 text-lg font-medium">No se encontraron registros</p>
              <p className="text-slate-500 text-sm">Registra tu primer electrodoméstico o ajusta tus filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLogs.map((log) => {
                // Compute relationship data
                const parentAppliance = log.parentId ? logs.find(l => l.id === log.parentId) : undefined;
                const relatedServices = log.type === 'buy' ? logs.filter(l => l.parentId === log.id) : [];
                const totalServicesCost = relatedServices.reduce((sum, s) => sum + s.cost, 0);
                const totalOwnershipCost = log.cost + totalServicesCost;

                return (
                  <div
                    key={log.id}
                    className={`bg-slate-800 rounded-2xl border border-white/5 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${editingId === log.id ? "ring-2 ring-indigo-500/50 border-indigo-500/30" : ""
                      }`}
                  >
                    {/* Color border indicator depending on type */}
                    <div className={`h-1.5 w-full ${log.type === "buy"
                      ? "bg-indigo-500"
                      : log.type === "installation"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                      }`} />

                    <div className="p-6 flex-1 flex flex-col">
                      {/* Header */}
                      <div className="flex justify-between items-start gap-4 mb-2.5">
                        <div>
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-2 ${log.type === "buy"
                            ? "bg-indigo-500/10 text-indigo-400"
                            : log.type === "installation"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-400"
                            }`}>
                            {log.type === "buy"
                              ? "Compra"
                              : log.type === "installation"
                                ? "Instalación"
                                : "Mantenimiento"}
                          </span>
                          <h4 className="text-lg font-bold font-heading text-white m-0 line-clamp-1">{log.applianceName}</h4>
                        </div>

                        {/* Price */}
                        <span className={`text-xl font-bold font-sans ${log.type === "buy"
                          ? "text-indigo-400"
                          : log.type === "installation"
                            ? "text-emerald-400"
                            : "text-amber-400"
                          }`}>
                          ${log.cost.toFixed(2)}
                        </span>
                      </div>

                      {/* Parent Link Info */}
                      {log.type !== 'buy' && parentAppliance && (
                        <div className="mb-3 flex items-center gap-1.5 text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-700/40 text-slate-400">
                          <LinkIcon size={12} className="text-indigo-400 shrink-0" />
                          <span className="font-semibold text-slate-300">Vinculado a:</span>
                          <span className="truncate text-indigo-400 font-medium">
                            {parentAppliance.applianceName} ({parentAppliance.date})
                          </span>
                        </div>
                      )}

                      {/* Meta info list */}
                      <div className="flex flex-col gap-2.5 mb-4 text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={15} className="text-slate-500 shrink-0" />
                          <span className="flex items-center gap-1.5">
                            {log.date}
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${log.dateType === 'exact'
                              ? 'bg-slate-700 text-slate-300'
                              : 'bg-purple-950/60 text-purple-400 border border-purple-900/50'
                              }`}>
                              {log.dateType === 'exact' ? 'Exacta' : 'Estimada'}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={15} className="text-slate-500 shrink-0" />
                          <span>Realizado por: <strong className="text-slate-300">{log.performer}</strong></span>
                        </div>
                      </div>

                      {/* Notes block */}
                      {log.notes && (
                        <div className="bg-slate-900/50 border border-slate-700/50 p-3 rounded-xl mb-4 text-xs text-slate-400 italic">
                          {log.notes}
                        </div>
                      )}

                      {/* File Attachment Action */}
                      {log.fileBase64 && (
                        <div className="mt-auto mb-4 bg-slate-900 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FileText size={16} className="text-indigo-400 shrink-0" />
                            <span className="text-xs text-slate-300 truncate" title={log.fileName || "adjunto"}>
                              {log.fileName || "comprobante"}
                            </span>
                          </div>
                          <a
                            href={log.fileBase64}
                            download={log.fileName || `comprobante-${log.id}`}
                            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            Descargar
                          </a>
                        </div>
                      )}

                      {/* Related History nested inside Buy logs */}
                      {log.type === 'buy' && relatedServices.length > 0 && (
                        <div className="mt-auto pt-4 border-t border-slate-700/50">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                            <FileCheck size={13} className="text-indigo-400" />
                            Historial de Servicios ({relatedServices.length})
                          </h5>
                          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                            {relatedServices.map(service => (
                              <div key={service.id} className="flex justify-between items-center bg-slate-900/50 border border-slate-700/30 p-2 rounded-lg text-xs">
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-slate-200 truncate">
                                    {service.type === 'installation' ? '🔧 Instalación' : '⚙️ Mantenimiento'}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {service.date} por {service.performer}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-300 shrink-0 ml-2">
                                  ${service.cost.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex justify-between items-center text-xs bg-indigo-500/5 p-2.5 rounded-lg border border-indigo-500/20">
                            <span className="text-slate-400">Costo Total Propiedad:</span>
                            <span className="font-bold text-indigo-400">${totalOwnershipCost.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-700/30 flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(log)}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold py-1.5 px-3 rounded-lg hover:bg-indigo-500/10 transition-all cursor-pointer"
                        title="Editar registro"
                      >
                        <Edit size={14} /> Editar
                      </button>
                      <button
                        onClick={() => log.id && handleDelete(log.id)}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 font-semibold py-1.5 px-3 rounded-lg hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Eliminar registro"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

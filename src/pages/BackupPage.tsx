import { useState, useEffect, useRef, ChangeEvent, DragEvent } from "react";
import { 
  Download, 
  UploadCloud, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Layers, 
  FileJson,
  Tags,
  Tv,
  CalendarDays,
  ArrowRightLeft
} from "lucide-react";
import { 
  getDatabaseSummary, 
  exportBackup, 
  importBackup, 
  validateBackupSchema,
  BackupData 
} from "../utils/database";

export function BackupPage() {
  const [dbSummary, setDbSummary] = useState({
    transactions: 0,
    budgets: 0,
    categoryRules: 0,
    applianceLogs: 0,
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [filePreview, setFilePreview] = useState<{
    fileName: string;
    fileSize: string;
    backupData: BackupData;
  } | null>(null);
  
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const summary = await getDatabaseSummary();
      setDbSummary(summary);
    } catch (error) {
      console.error("Error al cargar resumen de base de datos:", error);
    }
  };

  const handleExport = async () => {
    try {
      await exportBackup();
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al generar la copia de seguridad.");
    }
  };

  const handleFileContent = (file: File | undefined) => {
    if (!file) return;
    setImportError(null);
    setImportSuccess(false);

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setImportError("El archivo seleccionado debe ser un archivo JSON de copia de seguridad (.json).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (validateBackupSchema(parsed)) {
          const fileSizeKB = (file.size / 1024).toFixed(2);
          setFilePreview({
            fileName: file.name,
            fileSize: `${fileSizeKB} KB`,
            backupData: parsed
          });
        } else {
          setImportError("El archivo no tiene el formato de copia de seguridad válido de ExpenseTracker.");
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        setImportError("No se pudo leer el archivo JSON. Asegúrate de que sea un archivo válido.");
      }
    };
    reader.readAsText(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileContent(e.dataTransfer.files[0]);
    }
  };

  const confirmImport = async () => {
    if (!filePreview) return;
    setIsImporting(true);
    setImportError(null);
    
    try {
      await importBackup(filePreview.backupData, true);
      setImportSuccess(true);
      setFilePreview(null);
      await loadSummary();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error al importar el respaldo:", error);
      setImportError("Ocurrió un error al restaurar los datos del archivo.");
    } finally {
      setIsImporting(false);
    }
  };

  const cancelImport = () => {
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return isoString;
    }
  };

  const totalCurrentItems = dbSummary.transactions + dbSummary.budgets + dbSummary.categoryRules + dbSummary.applianceLogs;

  return (
    <div className="max-w-[1000px] mx-auto animate-[fadeIn_0.4s_ease-out_forwards] flex flex-col gap-8 pb-12">
      <div>
        <h2 className="text-3xl font-heading mb-2 text-white">Copia de Seguridad y Respaldos</h2>
        <p className="text-slate-400">
          Exporta tu base de datos completa a un archivo local para guardar un respaldo o transferir tus datos a otro dispositivo. 
          Como la aplicación no tiene backend, tus datos se guardan únicamente en el navegador.
        </p>
      </div>

      {/* Database Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 border border-white/5 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 translate-x-2 -translate-y-2 opacity-5 text-indigo-500 group-hover:scale-110 transition-transform duration-300">
            <ArrowRightLeft size={80} />
          </div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Transacciones</span>
          <span className="text-3xl font-heading font-bold text-white">{dbSummary.transactions}</span>
          <span className="text-xs text-slate-400">Registradas</span>
        </div>

        <div className="bg-slate-800/60 border border-white/5 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 translate-x-2 -translate-y-2 opacity-5 text-emerald-500 group-hover:scale-110 transition-transform duration-300">
            <CalendarDays size={80} />
          </div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Presupuestos</span>
          <span className="text-3xl font-heading font-bold text-white">{dbSummary.budgets}</span>
          <span className="text-xs text-slate-400">Mensuales</span>
        </div>

        <div className="bg-slate-800/60 border border-white/5 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 translate-x-2 -translate-y-2 opacity-5 text-purple-500 group-hover:scale-110 transition-transform duration-300">
            <Tags size={80} />
          </div>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Reglas de Cat.</span>
          <span className="text-3xl font-heading font-bold text-white">{dbSummary.categoryRules}</span>
          <span className="text-xs text-slate-400">Configuradas</span>
        </div>

        <div className="bg-slate-800/60 border border-white/5 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 translate-x-2 -translate-y-2 opacity-5 text-amber-500 group-hover:scale-110 transition-transform duration-300">
            <Tv size={80} />
          </div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Electrodomésticos</span>
          <span className="text-3xl font-heading font-bold text-white">{dbSummary.applianceLogs}</span>
          <span className="text-xs text-slate-400">Registros</span>
        </div>
      </div>

      {/* Main Grid Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Export Column */}
        <div className="bg-slate-800 border border-white/5 rounded-2xl p-8 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-heading font-bold m-0 text-white">Exportar Base de Datos</h3>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              Genera una copia de seguridad completa. El archivo descargado incluirá todas tus transacciones bancarias, 
              presupuestos configurados, reglas de categorización automática y el historial de mantenimiento de electrodomésticos.
            </p>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2 mt-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Formato de Salida:</span>
                <span className="font-semibold text-white font-mono">JSON (.json)</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Registros totales:</span>
                <span className="font-semibold text-indigo-400">{totalCurrentItems} registros</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Seguridad:</span>
                <span className="font-semibold text-emerald-400">Cifrado local / Sin servidor</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleExport}
            className="w-full mt-8 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold font-sans cursor-pointer transition-all duration-300 border-none text-[0.95rem] bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)] hover:-translate-y-0.5"
          >
            <Download size={18} />
            Crear y Descargar Respaldo
          </button>
        </div>

        {/* Import Column */}
        <div className="bg-slate-800 border border-white/5 rounded-2xl p-8 flex flex-col justify-between shadow-xl">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                <FileJson size={24} />
              </div>
              <h3 className="text-xl font-heading font-bold m-0 text-white">Importar y Restaurar</h3>
            </div>
            
            {importSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-start gap-3 animate-[fadeIn_0.4s_ease-out_forwards]">
                <CheckCircle size={20} className="shrink-0 mt-0.5 text-emerald-500" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm">¡Restauración exitosa!</span>
                  <span className="text-xs text-slate-350">Se han restaurado los datos y se descargó un auto-respaldo de seguridad previo en caso de que quieras revertir.</span>
                </div>
              </div>
            )}

            {importError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3 animate-[fadeIn_0.4s_ease-out_forwards]">
                <XCircle size={20} className="shrink-0 mt-0.5 text-red-500" />
                <span className="text-xs leading-relaxed">{importError}</span>
              </div>
            )}

            {!filePreview ? (
              <div className="flex-1 flex flex-col">
                <p className="text-slate-400 leading-relaxed text-sm mb-4">
                  Carga un archivo de respaldo JSON generado previamente por esta aplicación. Esto reemplazará 
                  la base de datos actual con la del archivo de respaldo.
                </p>
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[160px] ${
                    isDragging 
                      ? "border-indigo-500 bg-indigo-500/5 scale-[1.01]" 
                      : "border-slate-700 bg-slate-900/50 hover:border-indigo-500 hover:bg-indigo-500/5"
                  }`}
                >
                  <UploadCloud size={40} className={`mb-3 transition-all duration-300 ${isDragging ? "text-indigo-500 -translate-y-1" : "text-slate-450"}`} />
                  <p className="font-medium text-sm text-slate-200 mb-1">Arrastra tu respaldo JSON o haz clic</p>
                  <span className="text-xs text-slate-500">Soporta formatos: .json</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    style={{ display: "none" }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileContent(e.target.files?.[0])}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out_forwards]">
                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <FileJson className="text-indigo-400 shrink-0" size={16} />
                    <span className="text-sm font-semibold truncate text-white">{filePreview.fileName}</span>
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono shrink-0 ml-auto">{filePreview.fileSize}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Fecha del Respaldo:</span>
                      <span className="text-white font-medium">{formatTimestamp(filePreview.backupData.metadata.timestamp)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Transacciones:</span>
                      <span className="text-indigo-400 font-bold">{filePreview.backupData.metadata.recordCounts.transactions}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Presupuestos:</span>
                      <span className="text-emerald-400 font-bold">{filePreview.backupData.metadata.recordCounts.budgets}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Reglas de Cat.:</span>
                      <span className="text-purple-400 font-bold">{filePreview.backupData.metadata.recordCounts.categoryRules}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Electrodomésticos:</span>
                      <span className="text-amber-400 font-bold">{filePreview.backupData.metadata.recordCounts.applianceLogs}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle size={24} className="shrink-0 mt-0.5 text-amber-500" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm">Advertencia de Sobrescritura</span>
                    <p className="text-xs text-slate-300 leading-relaxed m-0">
                      Al confirmar, todos los datos actuales del navegador serán borrados y reemplazados por este archivo. 
                      Como medida de seguridad, <strong>se descargará automáticamente una copia de tus datos actuales</strong> antes de sobrescribir.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <button 
                    disabled={isImporting}
                    onClick={confirmImport}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold font-sans cursor-pointer transition-all duration-300 border-none text-[0.95rem] bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_4px_14px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                  >
                    {isImporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Restaurando...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} /> Confirmar Restauración
                      </>
                    )}
                  </button>
                  <button 
                    disabled={isImporting}
                    onClick={cancelImport}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold font-sans cursor-pointer transition-all duration-300 border border-slate-650 bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <XCircle size={18} /> Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Safety Info Section */}
      <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
          <Layers size={32} />
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-base font-bold text-white m-0">¿Cómo usar tus datos en varios dispositivos?</h4>
          <p className="text-sm text-slate-400 leading-relaxed m-0">
            Para sincronizar tus finanzas entre tu teléfono y tu computadora, simplemente haz clic en <strong>Crear y Descargar Respaldo</strong> en el dispositivo que tenga los datos más recientes. 
            Envía el archivo JSON descargado a tu otro dispositivo, ve a la misma página y arrástralo en el panel de <strong>Importar y Restaurar</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

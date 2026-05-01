import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, CheckCircle, XCircle } from "lucide-react";
import { processCSV } from "../utils/csvImport";
import { Transaction } from "../types";

interface ImportDropzoneProps {
  onImportConfirm: (transactions: Transaction[]) => Promise<void>;
}

export function ImportDropzone({ onImportConfirm }: ImportDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<Transaction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const transactions = processCSV(content);
        setPreview(transactions);
      } catch (error) {
        console.error("Error al procesar CSV:", error);
        alert("Error al procesar el archivo CSV");
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const confirmImport = () => {
    onImportConfirm(preview);
    setPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cancelImport = () => {
    setPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-white/5 shadow-md overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <h2 className="text-xl m-0 font-heading">Importar desde CSV Bancario</h2>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        {preview.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center flex-1 min-h-[200px] ${isDragging ? "border-indigo-500 bg-indigo-500/5" : "border-slate-700 bg-slate-900/50 hover:border-indigo-500 hover:bg-indigo-500/5"}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={48} className={`mb-4 transition-all duration-300 ${isDragging ? "text-indigo-500 -translate-y-1" : "text-slate-400 group-hover:text-indigo-500"}`} />
            <p className="font-medium mb-2">Haz clic aquí o arrastra un archivo CSV</p>
            <span className="text-sm text-slate-400">Formatos soportados: .csv</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              style={{ display: "none" }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0])}
            />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-heading mb-4">Vista Previa ({preview.length} transacciones)</h3>
            <div className="max-h-[200px] overflow-y-auto mb-4 border border-slate-700 rounded-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900/50">
                    <th className="p-3 text-left border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">Fecha</th>
                    <th className="p-3 text-left border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">Descripción</th>
                    <th className="p-3 text-left border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((t, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-all duration-300">
                      <td className="p-3 border-b border-slate-700 text-sm">{formatDate(t.date)}</td>
                      <td className="p-3 border-b border-slate-700 text-sm">{t.description}</td>
                      <td className="p-3 border-b border-slate-700 text-sm">${t.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {preview.length > 5 && (
                    <tr>
                      <td colSpan={3} className="text-center p-3 text-slate-400 italic text-sm border-b border-slate-700">
                        + {preview.length - 5} transacciones más...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4 mt-auto">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold font-sans cursor-pointer transition-all duration-300 border-none text-[0.95rem] bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)] hover:-translate-y-0.5" onClick={confirmImport}>
                <CheckCircle size={18} /> Confirmar Importación
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold font-sans cursor-pointer transition-all duration-300 border border-slate-600 bg-transparent text-slate-50 hover:bg-slate-700 hover:-translate-y-0.5" onClick={cancelImport}>
                <XCircle size={18} /> Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

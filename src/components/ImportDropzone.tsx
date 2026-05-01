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
    <div className="card import-card">
      <div className="card-header">
        <h2>Importar desde CSV Bancario</h2>
      </div>
      <div className="card-body">
        {preview.length === 0 ? (
          <div
            className={`dropzone ${isDragging ? "active" : ""}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={48} className="dropzone-icon" />
            <p>Haz clic aquí o arrastra un archivo CSV</p>
            <span className="hint">Formatos soportados: .csv</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              style={{ display: "none" }}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0])}
            />
          </div>
        ) : (
          <div className="import-preview">
            <h3>Vista Previa ({preview.length} transacciones)</h3>
            <div className="table-responsive preview-table">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((t, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(t.date)}</td>
                      <td>{t.description}</td>
                      <td>${t.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {preview.length > 5 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted">
                        + {preview.length - 5} transacciones más...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="preview-actions">
              <button className="btn btn-primary flex-center" onClick={confirmImport}>
                <CheckCircle size={18} className="mr-2" /> Confirmar Importación
              </button>
              <button className="btn btn-outline flex-center" onClick={cancelImport}>
                <XCircle size={18} className="mr-2" /> Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

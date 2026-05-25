import React from "react";
import {
  Calendar,
  User,
  FileText,
  FileCheck,
  Edit,
  Trash2,
  Link as LinkIcon
} from "lucide-react";
import { ApplianceLog } from "../../types";
import { useAppliances } from "./AppliancesContext";

interface ApplianceCardProps {
  log: ApplianceLog;
}

export const ApplianceCard: React.FC<ApplianceCardProps> = ({ log }) => {
  const { logs, editingId, handleEdit, handleDelete } = useAppliances();

  // Compute relationship data
  const parentAppliance = log.parentId ? logs.find((l) => l.id === log.parentId) : undefined;
  const relatedServices = log.type === "buy" ? logs.filter((l) => l.parentId === log.id) : [];
  const totalServicesCost = relatedServices.reduce((sum, s) => sum + s.cost, 0);
  const totalOwnershipCost = log.cost + totalServicesCost;

  return (
    <div
      className={`bg-slate-800 rounded-2xl border border-white/5 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
        editingId === log.id ? "ring-2 ring-indigo-500/50 border-indigo-500/30" : ""
      }`}
    >
      {/* Color border indicator depending on type */}
      <div
        className={`h-1.5 w-full ${
          log.type === "buy"
            ? "bg-indigo-500"
            : log.type === "installation"
            ? "bg-emerald-500"
            : "bg-amber-500"
        }`}
      />

      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-2.5">
          <div>
            <span
              className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-2 ${
                log.type === "buy"
                  ? "bg-indigo-500/10 text-indigo-400"
                  : log.type === "installation"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {log.type === "buy" ? "Compra" : log.type === "installation" ? "Instalación" : "Mantenimiento"}
            </span>
            <h4 className="text-lg font-bold font-heading text-white m-0 line-clamp-1">
              {log.applianceName}
            </h4>
          </div>

          {/* Price */}
          <span
            className={`text-xl font-bold font-sans ${
              log.type === "buy"
                ? "text-indigo-400"
                : log.type === "installation"
                ? "text-emerald-400"
                : "text-amber-400"
            }`}
          >
            ${log.cost.toFixed(2)}
          </span>
        </div>

        {/* Parent Link Info */}
        {log.type !== "buy" && parentAppliance && (
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
              <span
                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  log.dateType === "exact"
                    ? "bg-slate-700 text-slate-300"
                    : "bg-purple-950/60 text-purple-400 border border-purple-900/50"
                }`}
              >
                {log.dateType === "exact" ? "Exacta" : "Estimada"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User size={15} className="text-slate-500 shrink-0" />
            <span>
              Realizado por: <strong className="text-slate-300">{log.performer}</strong>
            </span>
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
        {log.type === "buy" && relatedServices.length > 0 && (
          <div className="mt-auto pt-4 border-t border-slate-700/50">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileCheck size={13} className="text-indigo-400" />
              Historial de Servicios ({relatedServices.length})
            </h5>
            <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
              {relatedServices.map((service) => (
                <div
                  key={service.id}
                  className="flex justify-between items-center bg-slate-900/50 border border-slate-700/30 p-2 rounded-lg text-xs"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-200 truncate">
                      {service.type === "installation" ? "🔧 Instalación" : "⚙️ Mantenimiento"}
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
};

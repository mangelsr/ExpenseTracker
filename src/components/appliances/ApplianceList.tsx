import React from "react";
import { Tv } from "lucide-react";
import { useAppliances } from "./AppliancesContext";
import { ApplianceCard } from "./ApplianceCard";

export const ApplianceList: React.FC = () => {
  const { filteredLogs } = useAppliances();

  if (filteredLogs.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-white/5 border-dashed p-12 text-center rounded-2xl">
        <Tv className="mx-auto text-slate-600 mb-4" size={48} />
        <p className="text-slate-400 text-lg font-medium">No se encontraron registros</p>
        <p className="text-slate-500 text-sm">Registra tu primer electrodoméstico o ajusta tus filtros.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredLogs.map((log) => (
        <ApplianceCard key={log.id} log={log} />
      ))}
    </div>
  );
};

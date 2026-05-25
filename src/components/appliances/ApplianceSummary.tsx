import React from "react";
import { ShoppingBag, Hammer, Wrench, DollarSign } from "lucide-react";
import { useAppliances } from "./AppliancesContext";

export const ApplianceSummary: React.FC = () => {
  const { totals } = useAppliances();

  return (
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
  );
};

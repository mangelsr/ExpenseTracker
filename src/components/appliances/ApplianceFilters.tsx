import React from "react";
import { Search } from "lucide-react";
import { useAppliances } from "./AppliancesContext";

export const ApplianceFilters: React.FC = () => {
  const { searchQuery, setSearchQuery, typeFilter, setTypeFilter } = useAppliances();

  return (
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
  );
};

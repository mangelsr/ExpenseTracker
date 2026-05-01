import { useState, useEffect } from "react";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Transaction } from "../types";

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: number) => Promise<void>;
}

export function TransactionTable({ transactions, onDelete }: TransactionTableProps) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, typeFilter, transactions]);

  const filteredTransactions = transactions.filter((t) => {
    const matchCategory = categoryFilter ? t.category === categoryFilter : true;
    const matchType = typeFilter ? t.type === typeFilter : true;
    return matchCategory && matchType;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-white/5 shadow-md overflow-hidden h-full">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl m-0 font-heading">Historial de Transacciones</h2>
        <div className="flex flex-wrap gap-4">
          <select
            className="w-auto min-w-[150px] p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            <option value="Transporte">Transporte</option>
            <option value="Comida">Comida</option>
            <option value="Entretenimiento">Entretenimiento</option>
            <option value="Compras">Compras</option>
            <option value="Educación">Educación</option>
            <option value="Servicios Digitales">Servicios Digitales</option>
            <option value="Comisiones Bancarias">Comisiones Bancarias</option>
            <option value="Salud">Salud</option>
            <option value="Servicios del Hogar">Servicios del Hogar</option>
            <option value="Otros">Otros</option>
          </select>
          <select
            className="w-auto min-w-[150px] p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="ingreso">Ingresos</option>
            <option value="gasto">Gastos</option>
            </select>
          {(categoryFilter || typeFilter) && (
            <button
              className="px-4 py-2 border border-slate-600 text-slate-50 rounded-xl font-medium cursor-pointer transition-all duration-300 hover:bg-slate-700 text-sm"
              onClick={() => {
                setCategoryFilter("");
                setTypeFilter("");
              }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-900/50">
              <th className="p-4 text-left border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">Fecha</th>
              <th className="p-4 text-left border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">Descripción</th>
              <th className="p-4 text-left border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">Categoría</th>
              <th className="p-4 text-left border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">Tipo</th>
              <th className="p-4 text-right border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">Monto</th>
              <th className="p-4 text-center border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-12 text-slate-400 italic">
                  No hay transacciones que mostrar.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((t) => (
                <tr key={t.id} className="transition-all duration-300 hover:bg-white/5">
                  <td className="p-4 text-left border-b border-slate-700">{formatDate(t.date)}</td>
                  <td className="p-4 text-left border-b border-slate-700">{t.description}</td>
                  <td className="p-4 text-left border-b border-slate-700">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-700 text-slate-50">{t.category}</span>
                  </td>
                  <td className="p-4 text-left border-b border-slate-700">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.type === "ingreso" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                      {t.type === "ingreso" ? "Ingreso" : "Gasto"}
                    </span>
                  </td>
                  <td className={`p-4 text-right border-b border-slate-700 ${t.type === "ingreso" ? "text-emerald-500" : ""}`}>
                    {t.type === "gasto" ? "-" : ""}{formatCurrency(t.amount)}
                  </td>
                  <td className="p-4 text-center border-b border-slate-700">
                    <button
                      className="bg-transparent border-none cursor-pointer p-2 rounded-full inline-flex transition-all duration-300 text-red-500 hover:bg-slate-700 hover:scale-110"
                      onClick={() => t.id !== undefined && onDelete(t.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/30 rounded-b-2xl flex justify-between items-center">
          <span className="text-slate-400 text-sm">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length} transacciones
          </span>
          <div className="flex items-center gap-2">
            <button 
              className="bg-transparent border border-slate-600 text-slate-50 cursor-pointer p-2 rounded-full inline-flex transition-all duration-300 hover:bg-slate-700 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:scale-100" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[60px] font-medium flex justify-center items-center">
              {currentPage} / {totalPages}
            </span>
            <button 
              className="bg-transparent border border-slate-600 text-slate-50 cursor-pointer p-2 rounded-full inline-flex transition-all duration-300 hover:bg-slate-700 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:scale-100" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

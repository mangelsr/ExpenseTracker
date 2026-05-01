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
    <div className="card transaction-table-card">
      <div className="card-header flex-between">
        <h2>Historial de Transacciones</h2>
        <div className="filters">
          <select
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="ingreso">Ingresos</option>
            <option value="gasto">Gastos</option>
          </select>
          {(categoryFilter || typeFilter) && (
            <button
              className="btn btn-outline"
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
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th className="text-right">Monto</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center empty-state">
                  No hay transacciones que mostrar.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{formatDate(t.date)}</td>
                  <td>{t.description}</td>
                  <td>
                    <span className="badge">{t.category}</span>
                  </td>
                  <td>
                    <span className={`badge ${t.type === "ingreso" ? "success" : "danger"}`}>
                      {t.type === "ingreso" ? "Ingreso" : "Gasto"}
                    </span>
                  </td>
                  <td className={`text-right ${t.type === "ingreso" ? "text-success" : ""}`}>
                    {t.type === "gasto" ? "-" : ""}{formatCurrency(t.amount)}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn-icon text-danger"
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
        <div className="pagination flex-between mt-4">
          <span className="text-muted">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length} transacciones
          </span>
          <div className="pagination-controls">
            <button 
              className="btn btn-outline btn-icon" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="pagination-page flex-center">
              {currentPage} / {totalPages}
            </span>
            <button 
              className="btn btn-outline btn-icon" 
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

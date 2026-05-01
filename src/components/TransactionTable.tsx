import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Transaction } from "../types";

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: number) => Promise<void>;
}

export function TransactionTable({ transactions, onDelete }: TransactionTableProps) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filteredTransactions = transactions.filter((t) => {
    const matchCategory = categoryFilter ? t.category === categoryFilter : true;
    const matchType = typeFilter ? t.type === typeFilter : true;
    return matchCategory && matchType;
  });

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
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center empty-state">
                  No hay transacciones que mostrar.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
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
    </div>
  );
}

import { useState, FormEvent } from "react";
import { PlusCircle } from "lucide-react";
import { Transaction } from "../types";

interface ExpenseFormProps {
  onAddTransaction: (transaction: Transaction) => Promise<void>;
}

export function ExpenseForm({ onAddTransaction }: ExpenseFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"ingreso" | "gasto">("gasto");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date || !type) return;

    await onAddTransaction({
      description,
      amount: parseFloat(amount),
      category,
      date,
      type,
    });

    // Reset form
    setDescription("");
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
    setType("gasto");
  };

  return (
    <div className="card expense-form-card">
      <div className="card-header">
        <PlusCircle className="icon primary-icon" />
        <h2>Agregar Gasto/Ingreso</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Ej. Compra de supermercado"
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Monto ($)</label>
            <input
              type="number"
              id="amount"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Categoría</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              <option value="Transporte">Transporte</option>
              <option value="Comida">Comida</option>
              <option value="Entretenimiento">Entretenimiento</option>
              <option value="Compras">Compras</option>
              <option value="Educación">Educación</option>
              <option value="Servicios Digitales">Servicios Digitales</option>
              <option value="Comisiones Bancarias">Comisiones Bancarias</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="date">Fecha</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as "ingreso" | "gasto")}
              required
            >
              <option value="gasto">Gasto</option>
              <option value="ingreso">Ingreso</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-2 flex-center">
            <PlusCircle size={18} className="mr-2" />
            Agregar Transacción
          </button>
        </form>
      </div>
    </div>
  );
}

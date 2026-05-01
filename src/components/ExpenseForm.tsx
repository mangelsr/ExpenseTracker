import { useState, FormEvent, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { Transaction, CategoryRule } from "../types";
import { getAllCategoryRules } from "../utils/database";

interface ExpenseFormProps {
  onAddTransaction: (transaction: Transaction) => Promise<void>;
}

export function ExpenseForm({ onAddTransaction }: ExpenseFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"ingreso" | "gasto">("gasto");
  const [categories, setCategories] = useState<CategoryRule[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const rules = await getAllCategoryRules();
        setCategories(rules);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    loadCategories();
  }, []);

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
    <div className="bg-slate-800 rounded-2xl border border-white/5 shadow-md overflow-hidden h-full">
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <PlusCircle className="text-indigo-500" />
        <h2 className="text-xl m-0 font-heading">Agregar Gasto/Ingreso</h2>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="description" className="block mb-2 text-sm font-medium text-slate-400">Descripción</label>
            <input
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Ej. Compra de supermercado"
            />
          </div>
          <div className="mb-5">
            <label htmlFor="amount" className="block mb-2 text-sm font-medium text-slate-400">Monto ($)</label>
            <input
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              type="number"
              id="amount"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>
          <div className="mb-5">
            <label htmlFor="category" className="block mb-2 text-sm font-medium text-slate-400">Categoría</label>
            <select
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {categories.map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              <option value="Otros">Otros</option>
            </select>
          </div>
          <div className="mb-5">
            <label htmlFor="date" className="block mb-2 text-sm font-medium text-slate-400">Fecha</label>
            <input
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="mb-5">
            <label htmlFor="type" className="block mb-2 text-sm font-medium text-slate-400">Tipo</label>
            <select
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as "ingreso" | "gasto")}
              required
            >
              <option value="gasto">Gasto</option>
              <option value="ingreso">Ingreso</option>
            </select>
          </div>
          <button type="submit" className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold font-sans cursor-pointer transition-all duration-300 border-none text-[0.95rem] bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 active:scale-98">
            <PlusCircle size={18} className="mr-2" />
            Agregar Transacción
          </button>
        </form>
      </div>
    </div>
  );
}

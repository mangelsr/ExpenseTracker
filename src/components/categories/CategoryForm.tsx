import React, { useState, FormEvent } from "react";
import { PlusCircle } from "lucide-react";
import { useCategories } from "./CategoriesContext";

export const CategoryForm: React.FC = () => {
  const { addRule } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newKeywords, setNewKeywords] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const success = await addRule(newCategoryName, newKeywords);
    if (success) {
      setNewCategoryName("");
      setNewKeywords("");
    }
  };

  return (
    <div className="p-6 border-b border-slate-700 bg-slate-800/50">
      <h3 className="text-lg font-medium text-slate-200 mb-4">Agregar Nueva Categoría</h3>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label htmlFor="categoryName" className="block mb-2 text-sm font-medium text-slate-400">
            Nombre de Categoría
          </label>
          <input
            id="categoryName"
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
            placeholder="Ej. Viajes"
            required
          />
        </div>
        <div className="flex-2 w-full md:w-1/2">
          <label htmlFor="keywords" className="block mb-2 text-sm font-medium text-slate-400">
            Palabras Clave (separadas por coma)
          </label>
          <input
            id="keywords"
            type="text"
            value={newKeywords}
            onChange={(e) => setNewKeywords(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-50 font-sans transition-all duration-300 text-[0.95rem] focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
            placeholder="Ej. avion, hotel, airbnb"
          />
        </div>
        <button
          type="submit"
          className="w-full md:w-auto mt-4 md:mt-0 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold font-sans cursor-pointer transition-all duration-300 border-none text-[0.95rem] bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)] hover:-translate-y-0.5"
        >
          <PlusCircle size={18} />
          Agregar
        </button>
      </form>
    </div>
  );
};

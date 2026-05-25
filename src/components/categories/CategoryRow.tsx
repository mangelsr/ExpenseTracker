import React, { useState } from "react";
import { Trash2, Edit2, X, Check } from "lucide-react";
import { CategoryRule } from "../../types";
import { useCategories } from "./CategoriesContext";

interface CategoryRowProps {
  rule: CategoryRule;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({ rule }) => {
  const { deleteRule, updateRule } = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState(rule.name);
  const [editKeywords, setEditKeywords] = useState(rule.keywords.join(", "));

  const startEditing = () => {
    setEditCategoryName(rule.name);
    setEditKeywords(rule.keywords.join(", "));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!rule.id) return;
    const success = await updateRule(rule.id, editCategoryName, editKeywords);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!rule.id) return;
    await deleteRule(rule.id);
  };

  return (
    <tr className="hover:bg-white/5 transition-all duration-300">
      <td className="p-4 border-b border-slate-700 font-medium text-slate-200">
        {isEditing ? (
          <input
            type="text"
            value={editCategoryName}
            onChange={(e) => setEditCategoryName(e.target.value)}
            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 font-sans text-sm focus:outline-none focus:border-indigo-500"
          />
        ) : (
          rule.name
        )}
      </td>
      <td className="p-4 border-b border-slate-700 text-sm text-slate-400">
        {isEditing ? (
          <input
            type="text"
            value={editKeywords}
            onChange={(e) => setEditKeywords(e.target.value)}
            className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-50 font-sans text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Ej. avion, hotel, airbnb"
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {rule.keywords.length > 0 ? (
              rule.keywords.map((kw, i) => (
                <span key={i} className="px-2 py-1 bg-slate-900 rounded-md border border-slate-700">
                  {kw}
                </span>
              ))
            ) : (
              <span className="italic opacity-50">Sin palabras clave</span>
            )}
          </div>
        )}
      </td>
      <td className="p-4 border-b border-slate-700 text-right">
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-2 bg-slate-900 text-green-400 rounded-lg hover:bg-green-500/10 hover:text-green-500 transition-colors"
                title="Guardar"
              >
                <Check size={18} />
              </button>
              <button
                onClick={cancelEditing}
                className="p-2 bg-slate-900 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-slate-50 transition-colors"
                title="Cancelar"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startEditing}
                className="p-2 bg-slate-900 text-indigo-400 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors"
                title="Editar Categoría"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-slate-900 text-red-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                title="Eliminar Categoría"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

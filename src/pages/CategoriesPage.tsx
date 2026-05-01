import { useState, useEffect, FormEvent } from "react";
import { Tags, PlusCircle, Trash2, Edit2, X, Check } from "lucide-react";
import { CategoryRule } from "../types";
import { getAllCategoryRules, saveCategoryRule, deleteCategoryRule, updateCategoryRule } from "../utils/database";

export function CategoriesPage() {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newKeywords, setNewKeywords] = useState("");

  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editKeywords, setEditKeywords] = useState("");

  const loadRules = async () => {
    try {
      const data = await getAllCategoryRules();
      setRules(data);
    } catch (error) {
      console.error("Error loading category rules", error);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleAddRule = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const keywordsArray = newKeywords
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const newRule: CategoryRule = {
      name: newCategoryName.trim(),
      keywords: keywordsArray,
    };

    try {
      await saveCategoryRule(newRule);
      setNewCategoryName("");
      setNewKeywords("");
      await loadRules();
    } catch (error) {
      console.error("Error saving rule", error);
      alert("Hubo un error al guardar la categoría.");
    }
  };

  const handleDeleteRule = async (id?: number) => {
    if (!id) return;
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return;

    try {
      await deleteCategoryRule(id);
      await loadRules();
    } catch (error) {
      console.error("Error deleting rule", error);
      alert("Hubo un error al eliminar la categoría.");
    }
  };

  const startEditing = (rule: CategoryRule) => {
    if (!rule.id) return;
    setEditingRuleId(rule.id);
    setEditCategoryName(rule.name);
    setEditKeywords(rule.keywords.join(", "));
  };

  const cancelEditing = () => {
    setEditingRuleId(null);
    setEditCategoryName("");
    setEditKeywords("");
  };

  const handleSaveEdit = async (id?: number) => {
    if (!id || !editCategoryName.trim()) return;

    const keywordsArray = editKeywords
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const updatedRule: CategoryRule = {
      id,
      name: editCategoryName.trim(),
      keywords: keywordsArray,
    };

    try {
      await updateCategoryRule(updatedRule);
      setEditingRuleId(null);
      await loadRules();
    } catch (error) {
      console.error("Error updating rule", error);
      alert("Hubo un error al actualizar la categoría.");
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-[fadeIn_0.5s_ease-out_forwards]">
      <div className="bg-slate-800 rounded-2xl border border-white/5 shadow-md overflow-hidden h-full">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <Tags className="text-indigo-500" />
          <h2 className="text-xl m-0 font-heading">Configuración de Categorías</h2>
        </div>
        
        <div className="p-6 border-b border-slate-700 bg-slate-800/50">
          <h3 className="text-lg font-medium text-slate-200 mb-4">Agregar Nueva Categoría</h3>
          <form onSubmit={handleAddRule} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label htmlFor="categoryName" className="block mb-2 text-sm font-medium text-slate-400">Nombre de Categoría</label>
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
              <label htmlFor="keywords" className="block mb-2 text-sm font-medium text-slate-400">Palabras Clave (separadas por coma)</label>
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

        <div className="p-6">
          <h3 className="text-lg font-medium text-slate-200 mb-4">Categorías Actuales</h3>
          <div className="overflow-x-auto border border-slate-700 rounded-xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900/50">
                  <th className="p-4 text-left border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">Nombre</th>
                  <th className="p-4 text-left border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider w-1/2">Palabras Clave (Reglas de Auto-categorización)</th>
                  <th className="p-4 text-right border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rules.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-slate-400 italic">No hay categorías configuradas.</td>
                  </tr>
                ) : (
                  rules.map((rule) => {
                    const isEditing = editingRuleId === rule.id;

                    return (
                      <tr key={rule.id} className="hover:bg-white/5 transition-all duration-300">
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
                              {rule.keywords.length > 0 ? rule.keywords.map((kw, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-900 rounded-md border border-slate-700">{kw}</span>
                              )) : (
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
                                  onClick={() => handleSaveEdit(rule.id)}
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
                                  onClick={() => startEditing(rule)}
                                  className="p-2 bg-slate-900 text-indigo-400 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors"
                                  title="Editar Categoría"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteRule(rule.id)}
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useCategories } from "./CategoriesContext";
import { CategoryRow } from "./CategoryRow";

export const CategoryList: React.FC = () => {
  const { rules, loading } = useCategories();

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-slate-200 mb-4">Categorías Actuales</h3>
      <div className="overflow-x-auto border border-slate-700 rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-900/50">
              <th className="p-4 text-left border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">
                Nombre
              </th>
              <th className="p-4 text-left border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider w-1/2">
                Palabras Clave (Reglas de Auto-categorización)
              </th>
              <th className="p-4 text-right border-b border-slate-700 font-semibold text-slate-400 uppercase text-xs tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center p-8 text-slate-400 italic">
                  Cargando categorías...
                </td>
              </tr>
            ) : rules.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-8 text-slate-400 italic">
                  No hay categorías configuradas.
                </td>
              </tr>
            ) : (
              rules.map((rule) => <CategoryRow key={rule.id} rule={rule} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

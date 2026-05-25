import { Tags } from "lucide-react";
import { CategoriesProvider } from "../components/categories/CategoriesContext";
import { CategoryForm } from "../components/categories/CategoryForm";
import { CategoryList } from "../components/categories/CategoryList";

export function CategoriesPage() {
  return (
    <CategoriesProvider>
      <div className="flex flex-col gap-8 animate-[fadeIn_0.5s_ease-out_forwards]">
        <div className="bg-slate-800 rounded-2xl border border-white/5 shadow-md overflow-hidden h-full">
          <div className="p-6 border-b border-slate-700 flex items-center gap-3">
            <Tags className="text-indigo-500" />
            <h2 className="text-xl m-0 font-heading">Configuración de Categorías</h2>
          </div>

          <CategoryForm />
          <CategoryList />
        </div>
      </div>
    </CategoriesProvider>
  );
}

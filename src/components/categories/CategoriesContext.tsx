import React, { createContext, useContext, useState, useEffect } from "react";
import { CategoryRule } from "../../types";
import {
  getAllCategoryRules,
  saveCategoryRule,
  deleteCategoryRule,
  updateCategoryRule,
} from "../../utils/database";

interface CategoriesContextType {
  rules: CategoryRule[];
  loading: boolean;
  loadRules: () => Promise<void>;
  addRule: (name: string, keywords: string) => Promise<boolean>;
  deleteRule: (id: number) => Promise<boolean>;
  updateRule: (id: number, name: string, keywords: string) => Promise<boolean>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await getAllCategoryRules();
      setRules(data);
    } catch (error) {
      console.error("Error loading category rules", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const addRule = async (name: string, keywords: string): Promise<boolean> => {
    if (!name.trim()) return false;

    const keywordsArray = keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const newRule: CategoryRule = {
      name: name.trim(),
      keywords: keywordsArray,
    };

    try {
      await saveCategoryRule(newRule);
      await loadRules();
      return true;
    } catch (error) {
      console.error("Error saving rule", error);
      alert("Hubo un error al guardar la categoría.");
      return false;
    }
  };

  const deleteRule = async (id: number): Promise<boolean> => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría?")) return false;

    try {
      await deleteCategoryRule(id);
      await loadRules();
      return true;
    } catch (error) {
      console.error("Error deleting rule", error);
      alert("Hubo un error al eliminar la categoría.");
      return false;
    }
  };

  const updateRule = async (id: number, name: string, keywords: string): Promise<boolean> => {
    if (!name.trim()) return false;

    const keywordsArray = keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const updatedRule: CategoryRule = {
      id,
      name: name.trim(),
      keywords: keywordsArray,
    };

    try {
      await updateCategoryRule(updatedRule);
      await loadRules();
      return true;
    } catch (error) {
      console.error("Error updating rule", error);
      alert("Hubo un error al actualizar la categoría.");
      return false;
    }
  };

  return (
    <CategoriesContext.Provider
      value={{
        rules,
        loading,
        loadRules,
        addRule,
        deleteRule,
        updateRule,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
};

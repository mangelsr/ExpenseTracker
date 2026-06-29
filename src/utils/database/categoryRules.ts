import { CategoryRule } from "../../types";
import { getDB, CATEGORY_RULES_STORE_NAME } from "./connection";

export function saveCategoryRule(rule: CategoryRule): Promise<number> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([CATEGORY_RULES_STORE_NAME], "readwrite");
    const store = tx.objectStore(CATEGORY_RULES_STORE_NAME);
    const request = store.add(rule);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject("Error al guardar la regla de categoría");
  });
}

export function updateCategoryRule(rule: CategoryRule): Promise<number> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([CATEGORY_RULES_STORE_NAME], "readwrite");
    const store = tx.objectStore(CATEGORY_RULES_STORE_NAME);
    const request = store.put(rule);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject("Error al actualizar la regla de categoría");
  });
}

export function getAllCategoryRules(): Promise<CategoryRule[]> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([CATEGORY_RULES_STORE_NAME], "readonly");
    const store = tx.objectStore(CATEGORY_RULES_STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as CategoryRule[]);
    request.onerror = () => reject("Error al obtener las reglas de categorías");
  });
}

export function deleteCategoryRule(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([CATEGORY_RULES_STORE_NAME], "readwrite");
    const store = tx.objectStore(CATEGORY_RULES_STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error al eliminar la regla de categoría");
  });
}

export function clearAllCategoryRules(): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([CATEGORY_RULES_STORE_NAME], "readwrite");
    const store = tx.objectStore(CATEGORY_RULES_STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error al limpiar las reglas de categorías");
  });
}

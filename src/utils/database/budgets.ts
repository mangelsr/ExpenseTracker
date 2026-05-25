import { Budget } from "../../types";
import { getDB, BUDGET_STORE_NAME } from "./connection";

export function saveBudget(budget: Budget): Promise<number> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([BUDGET_STORE_NAME], "readwrite");
    const store = tx.objectStore(BUDGET_STORE_NAME);
    const request = store.put(budget);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject("Error al guardar el presupuesto");
  });
}

export function getBudgetByMonth(month: string): Promise<Budget | undefined> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([BUDGET_STORE_NAME], "readonly");
    const store = tx.objectStore(BUDGET_STORE_NAME);
    const index = store.index("month");
    const request = index.get(month);
    
    request.onsuccess = () => resolve(request.result as Budget | undefined);
    request.onerror = () => reject("Error al obtener el presupuesto");
  });
}

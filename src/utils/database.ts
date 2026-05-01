import { Transaction, Budget, CategoryRule } from "../types";

let db: IDBDatabase;
const DB_NAME = "ExpenseTrackerDB";
const DB_VERSION = 3; // Incremented version to add category_rules store
const STORE_NAME = "transactions";
const BUDGET_STORE_NAME = "budgets";
const CATEGORY_RULES_STORE_NAME = "category_rules";

const defaultCategoryRules: Omit<CategoryRule, "id">[] = [
  { name: "Transporte", keywords: ["uber", "didi", "rides", "taxi", "transporte", "gasolina", "estacionamiento"] },
  { name: "Comida", keywords: ["mcdonald", "dunkin", "donut", "xochimilco", "pycca", "eats", "restaurant", "comida", "almuerzo", "cena", "desayuno", "supermercado", "mercado", "kfc", "pizza", "burger"] },
  { name: "Entretenimiento", keywords: ["cine", "multicine", "supercine", "steam", "netflix", "disney", "spotify", "youtube", "musica", "pelicula", "video", "juego", "entretenimiento"] },
  { name: "Compras", keywords: ["miniso", "el español", "xtrim", "tienda", "shop", "store", "ropa", "zapatos", "compras", "market", "mall", "centro comercial"] },
  { name: "Educación", keywords: ["instituto", "educa", "flywire", "universidad", "colegio", "escuela", "curso", "libro", "material", "educacion", "estudio"] },
  { name: "Servicios Digitales", keywords: ["servicio digital", "iva servicio", "app store", "google play", "software", "app", "hosting", "dominio", "vpn"] },
  { name: "Comisiones Bancarias", keywords: ["transferencia", "comision", "cargo serv", "interbanc", "pago directo", "banred", "banco", "tarjeta", "comisión", "intereses", "seguro"] },
  { name: "Salud", keywords: ["farmacia", "medicina", "hospital", "doctor", "clinica", "salud", "farma", "medico"] },
  { name: "Servicios del Hogar", keywords: ["luz", "agua", "telefono", "internet", "cable", "electricidad", "gas", "mantenimiento", "hogar", "casa"] },
];

export function initDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };

    request.onsuccess = (event: Event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });

        store.createIndex("date", "date", { unique: false });
        store.createIndex("amount", "amount", { unique: false });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("type", "type", { unique: false });
      }

      if (!db.objectStoreNames.contains(BUDGET_STORE_NAME)) {
        const budgetStore = db.createObjectStore(BUDGET_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        budgetStore.createIndex("month", "month", { unique: true });
      }

      if (!db.objectStoreNames.contains(CATEGORY_RULES_STORE_NAME)) {
        const rulesStore = db.createObjectStore(CATEGORY_RULES_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        
        // Pre-populate default rules
        defaultCategoryRules.forEach(rule => {
          rulesStore.add(rule);
        });
      }
    };
  });
}

// --- BUDGET FUNCTIONS ---
export function saveBudget(budget: Budget): Promise<number> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([BUDGET_STORE_NAME], "readwrite");
    const store = tx.objectStore(BUDGET_STORE_NAME);
    const request = store.put(budget);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject("Error al guardar el presupuesto");
  });
}

export function getBudgetByMonth(month: string): Promise<Budget | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([BUDGET_STORE_NAME], "readonly");
    const store = tx.objectStore(BUDGET_STORE_NAME);
    const index = store.index("month");
    const request = index.get(month);
    
    request.onsuccess = () => resolve(request.result as Budget | undefined);
    request.onerror = () => reject("Error al obtener el presupuesto");
  });
}

// --- CATEGORY RULES FUNCTIONS ---
export function saveCategoryRule(rule: CategoryRule): Promise<number> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([CATEGORY_RULES_STORE_NAME], "readwrite");
    const store = tx.objectStore(CATEGORY_RULES_STORE_NAME);
    const request = store.add(rule);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject("Error al guardar la regla de categoría");
  });
}

export function updateCategoryRule(rule: CategoryRule): Promise<number> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([CATEGORY_RULES_STORE_NAME], "readwrite");
    const store = tx.objectStore(CATEGORY_RULES_STORE_NAME);
    const request = store.put(rule);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject("Error al actualizar la regla de categoría");
  });
}

export function getAllCategoryRules(): Promise<CategoryRule[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([CATEGORY_RULES_STORE_NAME], "readonly");
    const store = tx.objectStore(CATEGORY_RULES_STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as CategoryRule[]);
    request.onerror = () => reject("Error al obtener las reglas de categorías");
  });
}

export function deleteCategoryRule(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([CATEGORY_RULES_STORE_NAME], "readwrite");
    const store = tx.objectStore(CATEGORY_RULES_STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error al eliminar la regla de categoría");
  });
}


export function addTransaction(transaction: Transaction): Promise<number> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(transaction);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject("Error al agregar la transacción");
  });
}

export function updateTransaction(transaction: Transaction): Promise<number> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(transaction);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject("Error al actualizar la transacción");
  });
}

export function getAllTransactions(): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as Transaction[]);
    request.onerror = () => reject("Error al obtener las transacciones");
  });
}

export function getTransaction(id: number): Promise<Transaction> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as Transaction);
    request.onerror = () => reject("Error al obtener la transacción");
  });
}

export function deleteTransaction(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error al eliminar la transacción");
  });
}

export function clearAllTransactions(): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error al limpiar las transacciones");
  });
}

export function getTransactionsAfterId(lastId: number): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);
    const result: Transaction[] = [];
    const request = store.openCursor(IDBKeyRange.lowerBound(lastId, true));

    request.onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
      if (cursor) {
        result.push(cursor.value as Transaction);
        cursor.continue();
      } else {
        resolve(result);
      }
    };
    request.onerror = () => reject("Error al obtener transacciones nuevas");
  });
}

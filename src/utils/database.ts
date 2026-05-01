import { Transaction, Budget } from "../types";

let db: IDBDatabase;
const DB_NAME = "ExpenseTrackerDB";
const DB_VERSION = 2; // Incremented version to add budgets store
const STORE_NAME = "transactions";
const BUDGET_STORE_NAME = "budgets";

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

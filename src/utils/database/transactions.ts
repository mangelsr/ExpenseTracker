import { Transaction } from "../../types";
import { getDB, STORE_NAME } from "./connection";

export function addTransaction(transaction: Transaction): Promise<number> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(transaction);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject("Error al agregar la transacción");
  });
}

export function updateTransaction(transaction: Transaction): Promise<number> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(transaction);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject("Error al actualizar la transacción");
  });
}

export function getAllTransactions(): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as Transaction[]);
    request.onerror = () => reject("Error al obtener las transacciones");
  });
}

export function getTransaction(id: number): Promise<Transaction> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as Transaction);
    request.onerror = () => reject("Error al obtener la transacción");
  });
}

export function deleteTransaction(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error al eliminar la transacción");
  });
}

export function clearAllTransactions(): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error al limpiar las transacciones");
  });
}

export function getTransactionsAfterId(lastId: number): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    const db = getDB();
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

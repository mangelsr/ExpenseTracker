let db;
const DB_NAME = "ExpenseTrackerDB";
const DB_VERSION = 1;
const STORE_NAME = "transactions";

// Inicializar la base de datos
function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("Base de datos abierta con éxito");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Crear object store si no existe
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });

        // Crear índices para búsquedas
        store.createIndex("date", "date", { unique: false });
        store.createIndex("amount", "amount", { unique: false });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("type", "type", { unique: false });
      }
    };
  });
}

// Agregar una transacción
function addTransaction(transaction) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.add(transaction);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error al agregar la transacción");
    };
  });
}

// Actualizar una transacción
function updateTransaction(transaction) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.put(transaction);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error al actualizar la transacción");
    };
  });
}

// Obtener todas las transacciones
function getAllTransactions() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error al obtener las transacciones");
    };
  });
}

// Obtener una transacción por ID
function getTransaction(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);

    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject("Error al obtener la transacción");
    };
  });
}

// Eliminar una transacción
function deleteTransaction(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject("Error al eliminar la transacción");
    };
  });
}

// Limpiar todas las transacciones
function clearAllTransactions() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject("Error al limpiar las transacciones");
    };
  });
}

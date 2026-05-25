import { CategoryRule } from "../../types";

export const DB_NAME = "ExpenseTrackerDB";
export const DB_VERSION = 4;
export const STORE_NAME = "transactions";
export const BUDGET_STORE_NAME = "budgets";
export const CATEGORY_RULES_STORE_NAME = "category_rules";
export const APPLIANCE_LOGS_STORE_NAME = "appliance_logs";

let db: IDBDatabase | null = null;

export function getDB(): IDBDatabase {
  if (!db) {
    throw new Error("Base de datos no inicializada. Llama a initDatabase primero.");
  }
  return db;
}

export function setDB(database: IDBDatabase): void {
  db = database;
}

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
      const database = (event.target as IDBOpenDBRequest).result;
      setDB(database);
      resolve(database);
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

      if (!db.objectStoreNames.contains(APPLIANCE_LOGS_STORE_NAME)) {
        const applianceStore = db.createObjectStore(APPLIANCE_LOGS_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        applianceStore.createIndex("applianceName", "applianceName", { unique: false });
        applianceStore.createIndex("date", "date", { unique: false });
        applianceStore.createIndex("type", "type", { unique: false });
      }
    };
  });
}

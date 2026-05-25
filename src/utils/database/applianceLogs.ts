import { ApplianceLog } from "../../types";
import { getDB, APPLIANCE_LOGS_STORE_NAME } from "./connection";

export function addApplianceLog(log: ApplianceLog): Promise<number> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([APPLIANCE_LOGS_STORE_NAME], "readwrite");
    const store = tx.objectStore(APPLIANCE_LOGS_STORE_NAME);
    const request = store.add(log);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject("Error al agregar el registro del electrodoméstico");
  });
}

export function updateApplianceLog(log: ApplianceLog): Promise<number> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([APPLIANCE_LOGS_STORE_NAME], "readwrite");
    const store = tx.objectStore(APPLIANCE_LOGS_STORE_NAME);
    const request = store.put(log);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject("Error al actualizar el registro del electrodoméstico");
  });
}

export function getAllApplianceLogs(): Promise<ApplianceLog[]> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([APPLIANCE_LOGS_STORE_NAME], "readonly");
    const store = tx.objectStore(APPLIANCE_LOGS_STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as ApplianceLog[]);
    request.onerror = () => reject("Error al obtener los registros de electrodomésticos");
  });
}

export function deleteApplianceLog(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tx = db.transaction([APPLIANCE_LOGS_STORE_NAME], "readwrite");
    const store = tx.objectStore(APPLIANCE_LOGS_STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Error al eliminar el registro del electrodoméstico");
  });
}

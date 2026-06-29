import { getAllTransactions, clearAllTransactions, addTransaction } from "./transactions";
import { getAllBudgets, clearAllBudgets, saveBudget } from "./budgets";
import { getAllCategoryRules, clearAllCategoryRules, saveCategoryRule } from "./categoryRules";
import { getAllApplianceLogs, clearAllApplianceLogs, addApplianceLog } from "./applianceLogs";

export interface BackupData {
  metadata: {
    version: number;
    timestamp: string;
    app: string;
    recordCounts: {
      transactions: number;
      budgets: number;
      categoryRules: number;
      applianceLogs: number;
    };
  };
  data: {
    transactions: any[];
    budgets: any[];
    categoryRules: any[];
    applianceLogs: any[];
  };
}

/**
 * Retrieves the current count of records in each IndexedDB table
 */
export async function getDatabaseSummary() {
  const [transactions, budgets, categoryRules, applianceLogs] = await Promise.all([
    getAllTransactions(),
    getAllBudgets(),
    getAllCategoryRules(),
    getAllApplianceLogs()
  ]);

  return {
    transactions: transactions.length,
    budgets: budgets.length,
    categoryRules: categoryRules.length,
    applianceLogs: applianceLogs.length
  };
}

/**
 * Exports all database records to a JSON backup file
 */
export async function exportBackup(filenamePrefix = "expense_tracker_backup"): Promise<void> {
  const [transactions, budgets, categoryRules, applianceLogs] = await Promise.all([
    getAllTransactions(),
    getAllBudgets(),
    getAllCategoryRules(),
    getAllApplianceLogs()
  ]);

  const backup: BackupData = {
    metadata: {
      version: 1,
      timestamp: new Date().toISOString(),
      app: "ExpenseTracker",
      recordCounts: {
        transactions: transactions.length,
        budgets: budgets.length,
        categoryRules: categoryRules.length,
        applianceLogs: applianceLogs.length
      }
    },
    data: {
      transactions,
      budgets,
      categoryRules,
      applianceLogs
    }
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const timestampStr = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${timestampStr}.json`;

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates if the parsed JSON object matches the required BackupData structure
 */
export function validateBackupSchema(json: any): json is BackupData {
  if (!json || typeof json !== "object") return false;
  if (!json.metadata || typeof json.metadata !== "object") return false;
  if (json.metadata.app !== "ExpenseTracker") return false;
  if (!json.data || typeof json.data !== "object") return false;
  
  const d = json.data;
  if (!Array.isArray(d.transactions)) return false;
  if (!Array.isArray(d.budgets)) return false;
  if (!Array.isArray(d.categoryRules)) return false;
  if (!Array.isArray(d.applianceLogs)) return false;
  
  return true;
}

/**
 * Imports the backup file content into the IndexedDB stores, clearing existing data first
 * and optionally downloading a safety backup first.
 */
export async function importBackup(backup: BackupData, triggerSafetyBackup = true): Promise<void> {
  if (!validateBackupSchema(backup)) {
    throw new Error("El archivo de respaldo no es válido o está corrupto.");
  }

  // 1. Safety Backup: export current database state before deleting it
  if (triggerSafetyBackup) {
    try {
      await exportBackup("auto_respaldo_seguridad");
    } catch (e) {
      console.warn("Could not download safety backup, proceeding anyway:", e);
    }
  }

  // 2. Clear all stores
  await Promise.all([
    clearAllTransactions(),
    clearAllBudgets(),
    clearAllCategoryRules(),
    clearAllApplianceLogs()
  ]);

  // 3. Populate stores with backup data
  const transactionPromises = backup.data.transactions.map((t) => addTransaction(t));
  const budgetPromises = backup.data.budgets.map((b) => saveBudget(b));
  const rulePromises = backup.data.categoryRules.map((r) => saveCategoryRule(r));
  const logPromises = backup.data.applianceLogs.map((l) => addApplianceLog(l));

  await Promise.all([
    Promise.all(transactionPromises),
    Promise.all(budgetPromises),
    Promise.all(rulePromises),
    Promise.all(logPromises)
  ]);
}

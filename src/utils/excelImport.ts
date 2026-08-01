import { read, utils } from "xlsx";
import { Transaction, CategoryRule } from "../types";
import { categorizeTransaction } from "./csvImport";

/**
 * Parses a numeric amount string formatted in Spanish (e.g., "-$14,08" or "$20,00").
 * Handles optional thousands separators and decimal commas/dots.
 */
function parseAmount(amountVal: any): number {
  if (typeof amountVal === "number") {
    return Math.abs(amountVal);
  }
  
  const str = String(amountVal || "0").trim();
  // Strip everything except digits, minus, plus, dot, and comma
  const cleaned = str.replace(/[^0-9\-+,.]/g, "");
  
  if (cleaned.includes(".") && cleaned.includes(",")) {
    const dotIdx = cleaned.indexOf(".");
    const commaIdx = cleaned.indexOf(",");
    if (dotIdx < commaIdx) {
      // 1.234,56 format (dot is thousands, comma is decimal)
      return Math.abs(parseFloat(cleaned.replace(/\./g, "").replace(",", ".")));
    } else {
      // 1,234.56 format (comma is thousands, dot is decimal)
      return Math.abs(parseFloat(cleaned.replace(/,/g, "")));
    }
  } else if (cleaned.includes(",")) {
    // Only comma is present, e.g. 14,08
    return Math.abs(parseFloat(cleaned.replace(",", ".")));
  } else {
    // Only dot or neither is present, e.g. 14.08
    return Math.abs(parseFloat(cleaned) || 0);
  }
}

/**
 * Normalizes an Excel date value (string or Date object) into YYYY-MM-DD format.
 */
function parseDate(dateVal: any): string {
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    const year = dateVal.getFullYear();
    const month = String(dateVal.getMonth() + 1).padStart(2, "0");
    const day = String(dateVal.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const str = String(dateVal || "").trim();
  
  // Format: YYYY-MM-DD, H:MM PM/AM or YYYY-M-D ...
  const matchHyphen = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (matchHyphen) {
    const year = matchHyphen[1];
    const month = matchHyphen[2].padStart(2, "0");
    const day = matchHyphen[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Format: DD/MM/YYYY
  const matchSlash = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (matchSlash) {
    const day = matchSlash[1].padStart(2, "0");
    const month = matchSlash[2].padStart(2, "0");
    const year = matchSlash[3];
    return `${year}-${month}-${day}`;
  }

  return str || new Date().toISOString().split("T")[0];
}

/**
 * Process Excel sheet buffer data and convert to Transaction array.
 */
export function processExcel(data: ArrayBuffer, rules: CategoryRule[]): Transaction[] {
  // Read array buffer with cellDates enabled to parse native Excel dates
  const workbook = read(data, { type: "array", cellDates: true });
  
  if (workbook.SheetNames.length === 0) {
    throw new Error("El archivo Excel no contiene hojas de cálculo.");
  }
  
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Convert sheet to json rows using 'A', 'B', etc. column keys
  const rows = utils.sheet_to_json<any>(sheet, { header: "A", defval: null, blankrows: true });
  const transactions: Transaction[] = [];

  for (const row of rows) {
    // A row is considered a transaction row if:
    // 1. Column D (Fecha) and Column E (Concepto) are present
    // 2. Column D is not the header text 'Fecha'
    const fechaVal = row.D;
    const conceptoVal = row.E;
    
    if (fechaVal !== null && fechaVal !== undefined && 
        conceptoVal !== null && conceptoVal !== undefined) {
      
      const dateStr = String(fechaVal).trim();
      const conceptStr = String(conceptoVal).trim();
      
      // Skip header row
      if (dateStr.toLowerCase() === "fecha" || conceptStr.toLowerCase() === "concepto") {
        continue;
      }
      
      const formattedDate = parseDate(fechaVal);
      const description = conceptStr || "Transacción sin descripción";
      const amount = parseAmount(row.O);
      
      // Determine Type (ingreso vs gasto)
      // Col K: 'Tipo' (e.g. 'Débito' -> gasto, 'Crédito' -> ingreso)
      let type: "ingreso" | "gasto" = "gasto";
      if (row.K) {
        const kStr = String(row.K).toLowerCase();
        if (kStr.includes("débito") || kStr.includes("debito") || kStr.includes("gasto")) {
          type = "gasto";
        } else if (kStr.includes("crédito") || kStr.includes("credito") || kStr.includes("ingreso")) {
          type = "ingreso";
        } else {
          // Fallback to sign of Amount column (e.g., negative sign in string)
          const isNegative = String(row.O || "").includes("-") || (typeof row.O === "number" && row.O < 0);
          type = isNegative ? "gasto" : "ingreso";
        }
      } else {
        const isNegative = String(row.O || "").includes("-") || (typeof row.O === "number" && row.O < 0);
        type = isNegative ? "gasto" : "ingreso";
      }
      
      transactions.push({
        date: formattedDate,
        description,
        amount,
        category: categorizeTransaction(description, rules),
        type,
      });
    }
  }

  return transactions;
}

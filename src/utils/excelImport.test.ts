import { vi, describe, it, expect, beforeEach } from "vitest";
import { processExcel } from "./excelImport";
import { CategoryRule } from "../types";
import * as xlsx from "xlsx";

vi.mock("xlsx", () => {
  return {
    read: vi.fn(),
    utils: {
      sheet_to_json: vi.fn(),
    },
  };
});

describe("excelImport", () => {
  const mockRules: CategoryRule[] = [
    { name: "Supermercado", keywords: ["Mercadona"] },
    { name: "Sueldo", keywords: ["Nomina"] },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw an error if the Excel file contains no sheets", () => {
    vi.mocked(xlsx.read).mockReturnValue({
      SheetNames: [],
      Sheets: {},
    });

    const emptyBuffer = new ArrayBuffer(0);
    expect(() => processExcel(emptyBuffer, mockRules)).toThrow(
      "El archivo Excel no contiene hojas de cálculo."
    );
  });

  it("should process excel sheet rows correctly into transactions", () => {
    vi.mocked(xlsx.read).mockReturnValue({
      SheetNames: ["Movimientos"],
      Sheets: { Movimientos: {} },
    });

    // Mock sheet_to_json to return specific test rows
    vi.mocked(xlsx.utils.sheet_to_json).mockReturnValue([
      // Header row should be skipped
      { D: "Fecha", E: "Concepto", K: "Tipo", O: "Importe" },
      
      // Standard debit row
      {
        D: "15/07/2026",
        E: "Compra en Mercadona",
        K: "Débito",
        O: "-$14,08",
      },
      
      // Standard credit row (Spanish date format)
      {
        D: "16/07/2026",
        E: "Sueldo del mes Nomina",
        K: "Crédito",
        O: "$2.000,50",
      },
      
      // Native Date object row, no explicit K (determines via amount)
      {
        D: new Date(2026, 6, 17), // July 17, 2026
        E: "Gasto sin Tipo",
        K: null,
        O: -35.25,
      },

      // Date in hyphen format, amount in 1,234.56 format
      {
        D: "2026-07-18",
        E: "Ingreso sin Tipo",
        K: null,
        O: "1,200.75",
      },
    ]);

    const mockBuffer = new ArrayBuffer(10);
    const result = processExcel(mockBuffer, mockRules);

    expect(result).toHaveLength(4);

    // 1st row: Compra en Mercadona
    expect(result[0]).toEqual({
      date: "2026-07-15",
      description: "Compra en Mercadona",
      amount: 14.08,
      category: "Supermercado",
      type: "gasto",
    });

    // 2nd row: Sueldo del mes Nomina
    expect(result[1]).toEqual({
      date: "2026-07-16",
      description: "Sueldo del mes Nomina",
      amount: 2000.5,
      category: "Sueldo",
      type: "ingreso",
    });

    // 3rd row: Gasto sin Tipo (from native Date object and negative numeric amount)
    expect(result[2]).toEqual({
      date: "2026-07-17",
      description: "Gasto sin Tipo",
      amount: 35.25,
      category: "Otros",
      type: "gasto",
    });

    // 4th row: Ingreso sin Tipo (from hyphen date format and positive string amount)
    expect(result[3]).toEqual({
      date: "2026-07-18",
      description: "Ingreso sin Tipo",
      amount: 1200.75,
      category: "Otros",
      type: "ingreso",
    });
  });

  it("should handle description fallbacks and unrecognized types correctly", () => {
    vi.mocked(xlsx.read).mockReturnValue({
      SheetNames: ["Movimientos"],
      Sheets: { Movimientos: {} },
    });

    vi.mocked(xlsx.utils.sheet_to_json).mockReturnValue([
      // Unrecognized tipo column values should fallback to amount sign check
      {
        D: "2026-07-20",
        E: "", // should fallback to 'Transacción sin descripción' (null/undefined will skip the row entirely)
        K: "Desconocido",
        O: "-$10.00",
      },
    ]);

    const result = processExcel(new ArrayBuffer(5), mockRules);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      date: "2026-07-20",
      description: "Transacción sin descripción",
      amount: 10,
      category: "Otros",
      type: "gasto",
    });
  });

  it("should fallback to today's date if date string is empty", () => {
    vi.mocked(xlsx.read).mockReturnValue({
      SheetNames: ["Movimientos"],
      Sheets: { Movimientos: {} },
    });

    vi.mocked(xlsx.utils.sheet_to_json).mockReturnValue([
      {
        D: "   ", // empty string
        E: "Gasto sin fecha",
        K: "Débito",
        O: "15.00",
      },
    ]);

    const result = processExcel(new ArrayBuffer(5), mockRules);
    expect(result).toHaveLength(1);
    const todayStr = new Date().toISOString().split("T")[0];
    expect(result[0].date).toBe(todayStr);
  });
});

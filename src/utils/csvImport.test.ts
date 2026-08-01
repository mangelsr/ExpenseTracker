import { describe, it, expect } from "vitest";
import { categorizeTransaction, processCSV } from "./csvImport";
import { CategoryRule } from "../types";

describe("csvImport", () => {
  const mockRules: CategoryRule[] = [
    { name: "Supermercado", keywords: ["Mercadona", "Lidl", "Dia", "Super"] },
    { name: "Sueldo", keywords: ["Nómina", "Nomina", "Transferencia recibida"] },
    { name: "Gasolina", keywords: ["Repsol", "Cepsa"] },
  ];

  describe("categorizeTransaction", () => {
    it("should categorize matching keywords correctly regardless of case", () => {
      expect(categorizeTransaction("Compra en Mercadona", mockRules)).toBe("Supermercado");
      expect(categorizeTransaction("repsol auto", mockRules)).toBe("Gasolina");
      expect(categorizeTransaction("NOMINA JULIO", mockRules)).toBe("Sueldo");
    });

    it("should return 'Otros' if no keyword matches", () => {
      expect(categorizeTransaction("Compra en Zara", mockRules)).toBe("Otros");
      expect(categorizeTransaction("Restaurante El Chiringuito", mockRules)).toBe("Otros");
    });

    it("should prioritize first matching rule if multiple rules could match", () => {
      const complexRules: CategoryRule[] = [
        { name: "Alimentación", keywords: ["Super"] },
        { name: "Mascotas", keywords: ["Super Perro"] },
      ];
      // Since "Super" is in "Alimentación" and checked first, it will match "Alimentación"
      expect(categorizeTransaction("Compra en Super Perro", complexRules)).toBe("Alimentación");
    });
  });

  describe("processCSV", () => {
    it("should skip the first 7 lines and parse valid transactions", () => {
      const mockCsvContent = [
        "Metadata Header Line 1", // index 0
        "Metadata Header Line 2", // index 1
        "Metadata Header Line 3", // index 2
        "Metadata Header Line 4", // index 3
        "Metadata Header Line 5", // index 4
        "Metadata Header Line 6", // index 5
        "Ref,Fecha,Valor,Concepto,Detalle,Info,Signo,Importe", // index 6 - Header line
        "123,15/07/2026,100,Gasto Comun,Mercadona compra,0,(-),15.50", // index 7 - 1st transaction
        "124,16/07/2026,200,Nomina,Transferencia recibida,0,(+),1500.00", // index 8
        "125,17/07/2026,300,Coche,Repsol Gasolinera,0,(-),50.00", // index 9
        "", // empty line
      ].join("\n");

      const result = processCSV(mockCsvContent, mockRules);

      expect(result).toHaveLength(3);

      expect(result[0]).toEqual({
        date: "2026-07-15",
        description: "Mercadona compra",
        amount: 15.5,
        category: "Supermercado",
        type: "gasto",
      });

      expect(result[1]).toEqual({
        date: "2026-07-16",
        description: "Transferencia recibida",
        amount: 1500.0,
        category: "Sueldo",
        type: "ingreso",
      });

      expect(result[2]).toEqual({
        date: "2026-07-17",
        description: "Repsol Gasolinera",
        amount: 50.0,
        category: "Gasolina",
        type: "gasto",
      });
    });

    it("should handle description fallbacks (use Concepto if Detalle is empty)", () => {
      const mockCsvContent = [
        "1", "2", "3", "4", "5", "6",
        "Ref,Fecha,Valor,Concepto,Detalle,Info,Signo,Importe", // index 6 (Header)
        "123,15/07/2026,100,Gasto Directo,,0,(-),25.00", // index 7
      ].join("\n");

      const result = processCSV(mockCsvContent, mockRules);
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe("Gasto Directo");
    });

    it("should handle double quotes in CSV fields correctly", () => {
      const mockCsvContent = [
        "1", "2", "3", "4", "5", "6",
        "Ref,Fecha,Valor,Concepto,Detalle,Info,Signo,Importe", // index 6 (Header)
        '123,15/07/2026,100,"Concepto con, comas","Detalle, Mercadona",0,(-),"1,200.50"', // index 7
      ].join("\n");

      const result = processCSV(mockCsvContent, mockRules);
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe("Detalle, Mercadona");
      expect(result[0].amount).toBe(1200.5);
      expect(result[0].category).toBe("Supermercado");
    });

    it("should ignore lines with less than 8 fields", () => {
      const mockCsvContent = [
        "1", "2", "3", "4", "5", "6",
        "Ref,Fecha,Valor,Concepto,Detalle,Info,Signo,Importe",
        "123,15/07/2026,100,Gasto,0,(-),15.50", // only 7 fields
      ].join("\n");

      const result = processCSV(mockCsvContent, mockRules);
      expect(result).toHaveLength(0);
    });

    it("should fallback to original date string if date does not have 3 slash-separated parts", () => {
      const mockCsvContent = [
        "1", "2", "3", "4", "5", "6",
        "Ref,Fecha,Valor,Concepto,Detalle,Info,Signo,Importe",
        "123,2026-07-15,100,Gasto,Mercadona,0,(-),15.50", // already YYYY-MM-DD
      ].join("\n");

      const result = processCSV(mockCsvContent, mockRules);
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe("2026-07-15");
    });
  });
});

import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  validateBackupSchema,
  getDatabaseSummary,
  exportBackup,
  importBackup,
} from "./backup";

// Mock the IndexedDB modules
vi.mock("./transactions", () => ({
  getAllTransactions: vi.fn(),
  clearAllTransactions: vi.fn(),
  addTransaction: vi.fn(),
}));

vi.mock("./budgets", () => ({
  getAllBudgets: vi.fn(),
  clearAllBudgets: vi.fn(),
  saveBudget: vi.fn(),
}));

vi.mock("./categoryRules", () => ({
  getAllCategoryRules: vi.fn(),
  clearAllCategoryRules: vi.fn(),
  saveCategoryRule: vi.fn(),
}));

vi.mock("./applianceLogs", () => ({
  getAllApplianceLogs: vi.fn(),
  clearAllApplianceLogs: vi.fn(),
  addApplianceLog: vi.fn(),
}));

// Import mocked functions to override resolve values
import { getAllTransactions, clearAllTransactions, addTransaction } from "./transactions";
import { getAllBudgets, clearAllBudgets, saveBudget } from "./budgets";
import { getAllCategoryRules, clearAllCategoryRules, saveCategoryRule } from "./categoryRules";
import { getAllApplianceLogs, clearAllApplianceLogs, addApplianceLog } from "./applianceLogs";

describe("backup schema validation", () => {
  it("should return true for a valid backup object structure", () => {
    const validBackup = {
      metadata: {
        version: 1,
        timestamp: "2026-08-01T20:30:00Z",
        app: "ExpenseTracker",
        recordCounts: {
          transactions: 1,
          budgets: 0,
          categoryRules: 0,
          applianceLogs: 0,
        },
      },
      data: {
        transactions: [
          {
            id: 1,
            date: "2026-07-15",
            description: "Mercadona",
            amount: 15.5,
            category: "Supermercado",
            type: "gasto",
          },
        ],
        budgets: [],
        categoryRules: [],
        applianceLogs: [],
      },
    };

    expect(validateBackupSchema(validBackup)).toBe(true);
  });

  it("should return false if backup object is null or undefined", () => {
    expect(validateBackupSchema(null)).toBe(false);
    expect(validateBackupSchema(undefined)).toBe(false);
  });

  it("should return false if app name metadata is incorrect", () => {
    const invalidBackup = {
      metadata: {
        version: 1,
        timestamp: "2026-08-01T20:30:00Z",
        app: "WrongAppName", // Not ExpenseTracker
      },
      data: {
        transactions: [],
        budgets: [],
        categoryRules: [],
        applianceLogs: [],
      },
    };
    expect(validateBackupSchema(invalidBackup)).toBe(false);
  });

  it("should return false if metadata or data is missing", () => {
    const missingMetadata = {
      data: {
        transactions: [],
        budgets: [],
        categoryRules: [],
        applianceLogs: [],
      },
    };
    expect(validateBackupSchema(missingMetadata)).toBe(false);

    const missingData = {
      metadata: {
        version: 1,
        timestamp: "2026-08-01T20:30:00Z",
        app: "ExpenseTracker",
      },
    };
    expect(validateBackupSchema(missingData)).toBe(false);
  });

  it("should return false if any required data store array is missing", () => {
    const missingTransactions = {
      metadata: {
        version: 1,
        timestamp: "2026-08-01T20:30:00Z",
        app: "ExpenseTracker",
      },
      data: {
        budgets: [],
        categoryRules: [],
        applianceLogs: [],
      },
    };
    expect(validateBackupSchema(missingTransactions)).toBe(false);

    const nonArrayBudgets = {
      metadata: {
        version: 1,
        timestamp: "2026-08-01T20:30:00Z",
        app: "ExpenseTracker",
      },
      data: {
        transactions: [],
        budgets: {}, // not an array
        categoryRules: [],
        applianceLogs: [],
      },
    };
    expect(validateBackupSchema(nonArrayBudgets)).toBe(false);

    const nonArrayCategoryRules = {
      metadata: {
        version: 1,
        timestamp: "2026-08-01T20:30:00Z",
        app: "ExpenseTracker",
      },
      data: {
        transactions: [],
        budgets: [],
        categoryRules: "string instead of array", // not an array
        applianceLogs: [],
      },
    };
    expect(validateBackupSchema(nonArrayCategoryRules)).toBe(false);

    const nonArrayApplianceLogs = {
      metadata: {
        version: 1,
        timestamp: "2026-08-01T20:30:00Z",
        app: "ExpenseTracker",
      },
      data: {
        transactions: [],
        budgets: [],
        categoryRules: [],
        applianceLogs: null, // not an array
      },
    };
    expect(validateBackupSchema(nonArrayApplianceLogs)).toBe(false);
  });
});

describe("backup utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDatabaseSummary", () => {
    it("should aggregate database counts correctly", async () => {
      vi.mocked(getAllTransactions).mockResolvedValue([{ id: 1 } as any, { id: 2 } as any]);
      vi.mocked(getAllBudgets).mockResolvedValue([{ id: 10 } as any]);
      vi.mocked(getAllCategoryRules).mockResolvedValue([]);
      vi.mocked(getAllApplianceLogs).mockResolvedValue([{ id: 100 } as any, { id: 101 } as any, { id: 102 } as any]);

      const summary = await getDatabaseSummary();
      expect(summary).toEqual({
        transactions: 2,
        budgets: 1,
        categoryRules: 0,
        applianceLogs: 3,
      });
    });
  });

  describe("exportBackup", () => {
    it("should export database contents to JSON file and trigger browser download link", async () => {
      vi.mocked(getAllTransactions).mockResolvedValue([{ id: 1, amount: 20 } as any]);
      vi.mocked(getAllBudgets).mockResolvedValue([]);
      vi.mocked(getAllCategoryRules).mockResolvedValue([]);
      vi.mocked(getAllApplianceLogs).mockResolvedValue([]);

      const mockClick = vi.fn();
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();

      const mockElement = {
        setAttribute: vi.fn(),
        style: { visibility: "" },
        click: mockClick,
      };

      vi.stubGlobal("document", {
        createElement: vi.fn().mockReturnValue(mockElement),
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      });

      const mockBlobConstructor = vi.fn().mockImplementation(function (content, options) {
        return { content, options };
      });
      vi.stubGlobal("Blob", mockBlobConstructor);

      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      const mockRevokeObjectURL = vi.fn();
      vi.stubGlobal("URL", {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      });

      await exportBackup("test_backup");

      // Verify DB fetch is executed
      expect(getAllTransactions).toHaveBeenCalled();

      // Verify Blob is constructed with right string
      expect(mockBlobConstructor).toHaveBeenCalled();
      const blobString = mockBlobConstructor.mock.calls[0][0][0];
      expect(JSON.parse(blobString)).toEqual(
        expect.objectContaining({
          metadata: expect.objectContaining({
            app: "ExpenseTracker",
          }),
          data: expect.objectContaining({
            transactions: [{ id: 1, amount: 20 }],
          }),
        })
      );

      // Verify document link creation and click trigger
      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockElement.setAttribute).toHaveBeenCalledWith("href", "blob:mock-url");
      expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

      vi.unstubAllGlobals();
    });
  });

  describe("importBackup", () => {
    const validBackupPayload = {
      metadata: {
        version: 1,
        timestamp: "2026-08-01T20:30:00Z",
        app: "ExpenseTracker",
        recordCounts: {
          transactions: 1,
          budgets: 1,
          categoryRules: 0,
          applianceLogs: 0,
        },
      },
      data: {
        transactions: [
          {
            id: 1,
            date: "2026-07-15",
            description: "Mercadona",
            amount: 15.5,
            category: "Supermercado",
            type: "gasto",
          },
        ],
        budgets: [
          {
            id: 10,
            month: "2026-07",
            plannedIncome: 2000,
            plannedExpense: 1500,
          },
        ],
        categoryRules: [],
        applianceLogs: [],
      },
    };

    it("should throw error if the backup schema fails validation check", async () => {
      const invalidBackup = { metadata: { app: "InvalidApp" } };
      await expect(importBackup(invalidBackup as any, false)).rejects.toThrow(
        "El archivo de respaldo no es válido o está corrupto."
      );
    });

    it("should clear all stores and populate them with imported values when called", async () => {
      // Mock clear operations
      vi.mocked(clearAllTransactions).mockResolvedValue(undefined);
      vi.mocked(clearAllBudgets).mockResolvedValue(undefined);
      vi.mocked(clearAllCategoryRules).mockResolvedValue(undefined);
      vi.mocked(clearAllApplianceLogs).mockResolvedValue(undefined);

      // Mock insert operations
      vi.mocked(addTransaction).mockResolvedValue(1);
      vi.mocked(saveBudget).mockResolvedValue(10);

      // Call importBackup with safety backup turned off (so we don't mock the safety download links)
      await importBackup(validBackupPayload as any, false);

      // Verify clear actions are performed
      expect(clearAllTransactions).toHaveBeenCalled();
      expect(clearAllBudgets).toHaveBeenCalled();
      expect(clearAllCategoryRules).toHaveBeenCalled();
      expect(clearAllApplianceLogs).toHaveBeenCalled();

      // Verify insert calls
      expect(addTransaction).toHaveBeenCalledWith(validBackupPayload.data.transactions[0]);
      expect(saveBudget).toHaveBeenCalledWith(validBackupPayload.data.budgets[0]);
    });

    it("should trigger safety backup when triggerSafetyBackup is true", async () => {
      vi.mocked(clearAllTransactions).mockResolvedValue(undefined);
      vi.mocked(clearAllBudgets).mockResolvedValue(undefined);
      vi.mocked(clearAllCategoryRules).mockResolvedValue(undefined);
      vi.mocked(clearAllApplianceLogs).mockResolvedValue(undefined);

      vi.mocked(getAllTransactions).mockResolvedValue([]);
      vi.mocked(getAllBudgets).mockResolvedValue([]);
      vi.mocked(getAllCategoryRules).mockResolvedValue([]);
      vi.mocked(getAllApplianceLogs).mockResolvedValue([]);

      const mockClick = vi.fn();
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();
      const mockElement = {
        setAttribute: vi.fn(),
        style: { visibility: "" },
        click: mockClick,
      };

      vi.stubGlobal("document", {
        createElement: vi.fn().mockReturnValue(mockElement),
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      });

      const mockBlobConstructor = vi.fn().mockImplementation(function (content, options) {
        return { content, options };
      });
      vi.stubGlobal("Blob", mockBlobConstructor);

      const mockCreateObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      const mockRevokeObjectURL = vi.fn();
      vi.stubGlobal("URL", {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      });

      await importBackup(validBackupPayload as any, true);

      expect(mockBlobConstructor).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith("a");

      vi.unstubAllGlobals();
    });

    it("should proceed with import if safety backup fails", async () => {
      vi.mocked(clearAllTransactions).mockResolvedValue(undefined);
      vi.mocked(clearAllBudgets).mockResolvedValue(undefined);
      vi.mocked(clearAllCategoryRules).mockResolvedValue(undefined);
      vi.mocked(clearAllApplianceLogs).mockResolvedValue(undefined);

      // Stub document to throw an error on createElement
      vi.stubGlobal("document", {
        createElement: vi.fn().mockImplementation(() => {
          throw new Error("Simulated DOM failure");
        }),
      });

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await importBackup(validBackupPayload as any, true);

      expect(warnSpy).toHaveBeenCalledWith(
        "Could not download safety backup, proceeding anyway:",
        expect.any(Error)
      );

      warnSpy.mockRestore();
      vi.unstubAllGlobals();
    });
  });
});

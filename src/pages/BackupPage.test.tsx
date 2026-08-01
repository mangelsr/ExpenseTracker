// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BackupPage } from "./BackupPage";
import * as db from "../utils/database";

vi.mock("../utils/database", () => ({
  getDatabaseSummary: vi.fn(),
  exportBackup: vi.fn(),
  importBackup: vi.fn(),
  validateBackupSchema: vi.fn(),
}));

describe("BackupPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.getDatabaseSummary).mockResolvedValue({
      transactions: 10,
      budgets: 2,
      categoryRules: 5,
      applianceLogs: 3,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("should load database summary and render titles correctly", async () => {
    await act(async () => {
      render(<BackupPage />);
    });

    expect(db.getDatabaseSummary).toHaveBeenCalled();
    expect(screen.getByText("Copia de Seguridad y Respaldos")).toBeDefined();
    
    // Check that summary values are rendered
    expect(screen.getByText("10")).toBeDefined(); // transactions count
    expect(screen.getByText("2")).toBeDefined(); // budgets count
    expect(screen.getByText("5")).toBeDefined(); // categoryRules count
    expect(screen.getByText("3")).toBeDefined(); // applianceLogs count
  });

  it("should trigger exportBackup on export button click", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<BackupPage />);
    });

    const exportBtn = screen.getByRole("button", { name: /crear y descargar respaldo/i });
    await user.click(exportBtn);

    expect(db.exportBackup).toHaveBeenCalled();
  });

  it("should handle JSON backup upload and confirm import successfully", async () => {
    const user = userEvent.setup();
    
    const validJSON = JSON.stringify({
      version: 4,
      metadata: {
        timestamp: "2026-08-01T20:00:00.000Z",
        recordCounts: {
          transactions: 10,
          budgets: 2,
          categoryRules: 5,
          applianceLogs: 3
        }
      }
    });

    const mockFileReaderInstance = {
      readAsText: vi.fn().mockImplementation(function(this: any) {
        this.onload({ target: { result: validJSON } });
      }),
    };
    vi.stubGlobal("FileReader", vi.fn().mockImplementation(function() {
      return mockFileReaderInstance;
    }));

    vi.mocked(db.validateBackupSchema).mockReturnValue(true);
    vi.mocked(db.importBackup).mockResolvedValue(undefined);

    await act(async () => {
      render(<BackupPage />);
    });

    const fileInput = screen.getByText("Arrastra tu respaldo JSON o haz clic").parentNode?.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File([validJSON], "backup.json", { type: "application/json" });

    await act(async () => {
      await user.upload(fileInput, file);
    });

    // Preview should render
    expect(screen.getByText("Advertencia de Sobrescritura")).toBeDefined();
    expect(screen.getByText("backup.json")).toBeDefined();

    // Click confirm import button
    const confirmBtn = screen.getByRole("button", { name: /confirmar restauración/i });
    
    // On confirm backup, it re-loads summary
    vi.mocked(db.getDatabaseSummary).mockResolvedValue({
      transactions: 20,
      budgets: 4,
      categoryRules: 8,
      applianceLogs: 6,
    });

    await act(async () => {
      await user.click(confirmBtn);
    });

    expect(db.importBackup).toHaveBeenCalledWith(expect.objectContaining({ version: 4 }), true);
    expect(screen.getByText("¡Restauración exitosa!")).toBeDefined();

    vi.unstubAllGlobals();
  });
});

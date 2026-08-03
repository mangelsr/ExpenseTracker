// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportDropzone } from "./ImportDropzone";
import * as csvImport from "../../utils/csvImport";
import * as excelImport from "../../utils/excelImport";
import * as db from "../../utils/database";

vi.mock("../../utils/csvImport", () => ({
  processCSV: vi.fn(),
}));

vi.mock("../../utils/excelImport", () => ({
  processExcel: vi.fn(),
}));

vi.mock("../../utils/database", () => ({
  getAllCategoryRules: vi.fn().mockResolvedValue([]),
}));

describe("ImportDropzone component", () => {
  const mockOnImportConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render dropzone placeholder initial layout correctly", () => {
    render(<ImportDropzone onImportConfirm={mockOnImportConfirm} />);

    expect(screen.getByText("Importar desde CSV o Excel Bancario")).toBeDefined();
    expect(screen.getByText("Haz clic aquí o arrastra un archivo CSV o Excel")).toBeDefined();
    expect(screen.getByText("Formatos soportados: .csv, .xlsx")).toBeDefined();
    expect(screen.getByText("CSV: Banco Bolivariano | Excel: Banco Pichincha")).toBeDefined();
  });

  it("should parse file content and display preview layout correctly on upload", async () => {
    const user = userEvent.setup();
    
    // Mock FileReader implementation to trigger onload immediately with dummy text
    const mockFileReaderInstance = {
      readAsText: vi.fn().mockImplementation(function(this: any, file: any) {
        this.onload({ target: { result: "dummy CSV file content" } });
      }),
      readAsArrayBuffer: vi.fn(),
    };
    vi.stubGlobal("FileReader", vi.fn().mockImplementation(function() {
      return mockFileReaderInstance;
    }));

    const mockTransactions = [
      { date: "2026-07-15", description: "Compra 1", amount: 15.5, category: "Otros", type: "gasto" },
    ];
    vi.mocked(csvImport.processCSV).mockReturnValue(mockTransactions as any);

    render(<ImportDropzone onImportConfirm={mockOnImportConfirm} />);

    const fileInput = screen.getByText("Haz clic aquí o arrastra un archivo CSV o Excel").parentNode?.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["dummy,csv,content"], "bank.csv", { type: "text/csv" });

    await act(async () => {
      await user.upload(fileInput, file);
    });

    // Check that preview title and list render
    expect(screen.getByText("Vista Previa (1 transacciones)")).toBeDefined();
    expect(screen.getByText("Compra 1")).toBeDefined();
    expect(screen.getByText("15/07/2026")).toBeDefined();
    expect(screen.getByText("$15.50")).toBeDefined();

    // Click cancel
    const cancelBtn = screen.getByRole("button", { name: /cancelar/i });
    await user.click(cancelBtn);

    // Verify it returned to the dropzone
    expect(screen.getByText("Haz clic aquí o arrastra un archivo CSV o Excel")).toBeDefined();

    vi.unstubAllGlobals();
  });

  it("should call onImportConfirm on confirm click", async () => {
    const user = userEvent.setup();
    const mockFileReaderInstance = {
      readAsText: vi.fn().mockImplementation(function(this: any) {
        this.onload({ target: { result: "dummy" } });
      }),
    };
    vi.stubGlobal("FileReader", vi.fn().mockImplementation(function() {
      return mockFileReaderInstance;
    }));
    
    const mockTransactions = [
      { date: "2026-07-15", description: "Compra 1", amount: 15.5, category: "Otros", type: "gasto" },
    ];
    vi.mocked(csvImport.processCSV).mockReturnValue(mockTransactions as any);

    render(<ImportDropzone onImportConfirm={mockOnImportConfirm} />);

    const fileInput = screen.getByText("Haz clic aquí o arrastra un archivo CSV o Excel").parentNode?.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["dummy"], "bank.csv", { type: "text/csv" });

    await act(async () => {
      await user.upload(fileInput, file);
    });

    const confirmBtn = screen.getByRole("button", { name: /confirmar importación/i });
    await user.click(confirmBtn);

    expect(mockOnImportConfirm).toHaveBeenCalledWith(mockTransactions);
    
    vi.unstubAllGlobals();
  });
});

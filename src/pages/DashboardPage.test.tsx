// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardPage } from "./DashboardPage";
import * as db from "../utils/database";
import * as exportUtil from "../utils/export";

vi.mock("../utils/database", () => ({
  getAllTransactions: vi.fn(),
  addTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  clearAllTransactions: vi.fn(),
  getAllCategoryRules: vi.fn().mockResolvedValue([]),
}));

vi.mock("../utils/export", () => ({
  exportToCSV: vi.fn(),
}));

vi.mock("react-chartjs-2", () => ({
  Doughnut: () => <div data-testid="mock-doughnut" />,
}));

describe("DashboardPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.getAllTransactions).mockResolvedValue([
      { id: 1, date: "2026-07-15", description: "Compra A", amount: 50, category: "Comida", type: "gasto" },
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  it("should load transactions on mount and render components correctly", async () => {
    await act(async () => {
      render(<DashboardPage />);
    });

    expect(db.getAllTransactions).toHaveBeenCalled();
    expect(screen.getByText("Compra A")).toBeDefined();
  });

  it("should trigger export when Exportar a CSV is clicked", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<DashboardPage />);
    });

    const exportBtn = screen.getByRole("button", { name: /exportar a csv/i });
    await user.click(exportBtn);

    expect(exportUtil.exportToCSV).toHaveBeenCalledWith([
      { id: 1, date: "2026-07-15", description: "Compra A", amount: 50, category: "Comida", type: "gasto" }
    ]);
  });

  it("should prompt confirm and clear all transactions on Limpiar datos click", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("confirm", () => true);
    vi.mocked(db.clearAllTransactions).mockResolvedValue(undefined);

    await act(async () => {
      render(<DashboardPage />);
    });

    const clearBtn = screen.getByRole("button", { name: /limpiar datos/i });
    
    vi.mocked(db.getAllTransactions).mockResolvedValue([]);

    await act(async () => {
      await user.click(clearBtn);
    });

    expect(db.clearAllTransactions).toHaveBeenCalled();
    expect(screen.queryByText("Compra A")).toBeNull();

    vi.unstubAllGlobals();
  });
});

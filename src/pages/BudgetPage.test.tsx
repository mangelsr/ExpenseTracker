// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BudgetPage } from "./BudgetPage";
import * as db from "../utils/database";

vi.mock("../utils/database", () => ({
  getBudgetByMonth: vi.fn(),
  saveBudget: vi.fn(),
}));

describe("BudgetPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should fetch budget on mount and render layout", async () => {
    vi.mocked(db.getBudgetByMonth).mockResolvedValue({
      month: new Date().toISOString().slice(0, 7),
      plannedIncome: 3000,
      plannedExpense: 1500,
    });

    await act(async () => {
      render(<BudgetPage />);
    });

    expect(db.getBudgetByMonth).toHaveBeenCalled();
    expect(screen.getByText("Configuración de Presupuesto")).toBeDefined();
    
    // Expect input value attributes to show loaded values
    const incomeInput = screen.getByLabelText("Ingresos Esperados") as HTMLInputElement;
    const expenseInput = screen.getByLabelText("Gastos Esperados") as HTMLInputElement;
    expect(incomeInput.value).toBe("3000");
    expect(expenseInput.value).toBe("1500");
  });

  it("should trigger saveBudget and display success message on submit", async () => {
    const user = userEvent.setup();
    vi.mocked(db.getBudgetByMonth).mockResolvedValue(null);
    vi.mocked(db.saveBudget).mockResolvedValue(1);

    await act(async () => {
      render(<BudgetPage />);
    });

    const incomeInput = screen.getByLabelText("Ingresos Esperados");
    const expenseInput = screen.getByLabelText("Gastos Esperados");
    const saveBtn = screen.getByRole("button", { name: "Guardar Presupuesto" });

    // Type new budget inputs
    await user.type(incomeInput, "2000");
    await user.type(expenseInput, "1000");

    await act(async () => {
      await user.click(saveBtn);
    });

    expect(db.saveBudget).toHaveBeenCalledWith(expect.objectContaining({
      plannedIncome: 2000,
      plannedExpense: 1000,
    }));

    // Expect success message
    expect(screen.getByText("¡Presupuesto guardado exitosamente!")).toBeDefined();
  });
});

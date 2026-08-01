// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SummaryCards } from "./SummaryCards";
import { Transaction } from "../../types";

describe("SummaryCards component", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render summaries of income, expenses, and balance correctly", () => {
    const transactions: Transaction[] = [
      { id: 1, date: "2026-07-15", description: "Ingreso 1", amount: 2500, category: "Sueldo", type: "ingreso" },
      { id: 2, date: "2026-07-16", description: "Gasto 1", amount: 450, category: "Alquiler", type: "gasto" },
      { id: 3, date: "2026-07-17", description: "Gasto 2", amount: 50.5, category: "Comida", type: "gasto" },
    ];

    render(<SummaryCards transactions={transactions} />);

    expect(screen.getByText("Ingresos")).toBeDefined();
    expect(screen.getByText("Gastos")).toBeDefined();
    expect(screen.getByText("Balance Total")).toBeDefined();

    // Check computed values
    // Income = $2,500.00
    // Expense = $500.50
    // Balance = $1,999.50
    // Note: Intl.NumberFormat es-US might format currency as "$2,500.00" or similar depending on the JSDOM locales setup.
    // Let's use flexible string checks or regex checks
    const incomeEl = screen.getByText(/2,500/);
    const expenseEl = screen.getByText(/500\.5/);
    const balanceEl = screen.getByText(/1,999\.5/);

    expect(incomeEl).toBeDefined();
    expect(expenseEl).toBeDefined();
    expect(balanceEl).toBeDefined();
  });
});

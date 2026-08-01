// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CategoryChart } from "./CategoryChart";
import { Transaction } from "../../types";

vi.mock("react-chartjs-2", () => ({
  Doughnut: vi.fn(() => <div data-testid="mock-doughnut-chart" />),
}));

describe("CategoryChart component", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render placeholder when there are no expenses", () => {
    const transactions: Transaction[] = [
      { id: 1, date: "2026-07-15", description: "Ingreso 1", amount: 1000, category: "Sueldo", type: "ingreso" },
    ];

    render(<CategoryChart transactions={transactions} />);

    expect(screen.getByText("Distribución de Gastos")).toBeDefined();
    expect(screen.getByText("No hay gastos para mostrar.")).toBeDefined();
    expect(screen.queryByTestId("mock-doughnut-chart")).toBeNull();
  });

  it("should render doughnut chart when expenses are present", () => {
    const transactions: Transaction[] = [
      { id: 1, date: "2026-07-15", description: "Compra 1", amount: 50, category: "Supermercado", type: "gasto" },
      { id: 2, date: "2026-07-16", description: "Ingreso 1", amount: 1000, category: "Sueldo", type: "ingreso" }, // skipped since it's income
    ];

    render(<CategoryChart transactions={transactions} />);

    expect(screen.getByText("Distribución de Gastos")).toBeDefined();
    expect(screen.queryByText("No hay gastos para mostrar.")).toBeNull();
    expect(screen.getByTestId("mock-doughnut-chart")).toBeDefined();
  });
});

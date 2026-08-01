// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionTable } from "./TransactionTable";
import { Transaction } from "../../types";

describe("TransactionTable component", () => {
  const mockOnDelete = vi.fn();
  const transactions: Transaction[] = [
    { id: 1, date: "2026-07-15", description: "Compra A", amount: 50.5, category: "Comida", type: "gasto" },
    { id: 2, date: "2026-07-16", description: "Ingreso B", amount: 1500, category: "Otros", type: "ingreso" },
    ...Array.from({ length: 10 }, (_, i) => ({
      id: i + 3,
      date: `2026-07-17`,
      description: `Gasto Paginado ${i}`,
      amount: 10,
      category: "Transporte",
      type: "gasto",
    })),
  ] as Transaction[];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render transaction list and handle pagination correctly", async () => {
    const user = userEvent.setup();
    render(<TransactionTable transactions={transactions} onDelete={mockOnDelete} />);

    expect(screen.getByText("Historial de Transacciones")).toBeDefined();
    
    // Page 1 should show Compra A, Ingreso B and some page items
    expect(screen.getByText("Compra A")).toBeDefined();
    expect(screen.getByText("Ingreso B")).toBeDefined();

    // Verify pagination indicator (Page 1 / 2)
    expect(screen.getByText("1 / 2")).toBeDefined();

    // Click next button
    // The next button contains the ChevronRight icon. We can find by title or select it as the last button or via icon class/selector.
    // The buttons have classes: hover:scale-110, disabled:...
    // Let's get the button by role or selector
    const paginationButtons = screen.getAllByRole("button");
    // Since there are other buttons or clear filters in DOM, let's find buttons with chevron symbols or index
    // The last button is ChevronRight. Let's click it.
    const nextBtn = paginationButtons[paginationButtons.length - 1];
    await user.click(nextBtn);

    // Verify page changed to 2 / 2
    expect(screen.getByText("2 / 2")).toBeDefined();
    expect(screen.queryByText("Compra A")).toBeNull();
  });

  it("should apply filters correctly and display clear button", async () => {
    const user = userEvent.setup();
    render(<TransactionTable transactions={transactions} onDelete={mockOnDelete} />);

    // Select "Comida" category filter
    const comboboxes = screen.getAllByRole("combobox");
    const categoryFilter = comboboxes[0];
    const typeFilter = comboboxes[1];

    await user.selectOptions(categoryFilter, "Comida");

    // Only Comida row should remain
    expect(screen.getByText("Compra A")).toBeDefined();
    expect(screen.queryByText("Ingreso B")).toBeNull();

    // Verify clear button is rendered and works
    const clearBtn = screen.getByRole("button", { name: "Limpiar" });
    await user.click(clearBtn);

    // All items should be back
    expect(screen.getByText("Compra A")).toBeDefined();
    expect(screen.getByText("Ingreso B")).toBeDefined();
  });

  it("should invoke onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<TransactionTable transactions={[transactions[0]]} onDelete={mockOnDelete} />);

    const deleteBtn = screen.getByTitle("Eliminar");
    await user.click(deleteBtn);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});

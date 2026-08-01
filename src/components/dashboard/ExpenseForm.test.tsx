// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseForm } from "./ExpenseForm";
import * as db from "../../utils/database";

vi.mock("../../utils/database", () => ({
  getAllCategoryRules: vi.fn(),
}));

describe("ExpenseForm component", () => {
  const mockOnAddTransaction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.getAllCategoryRules).mockResolvedValue([
      { id: 1, name: "Comida", keywords: [] },
      { id: 2, name: "Entretenimiento", keywords: [] },
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  it("should render inputs and load categories correctly on mount", async () => {
    await act(async () => {
      render(<ExpenseForm onAddTransaction={mockOnAddTransaction} />);
    });

    expect(screen.getByText("Agregar Gasto/Ingreso")).toBeDefined();
    expect(screen.getByLabelText("Descripción")).toBeDefined();
    expect(screen.getByLabelText("Monto ($)")).toBeDefined();
    expect(screen.getByLabelText("Categoría")).toBeDefined();
    expect(screen.getByLabelText("Fecha")).toBeDefined();
    expect(screen.getByLabelText("Tipo")).toBeDefined();

    // Verify loaded categories are rendered inside select options
    expect(screen.getByText("Comida")).toBeDefined();
    expect(screen.getByText("Entretenimiento")).toBeDefined();
    expect(screen.getByText("Otros")).toBeDefined();
  });

  it("should call onAddTransaction with correct values on submit", async () => {
    const user = userEvent.setup();
    mockOnAddTransaction.mockResolvedValue(undefined);

    await act(async () => {
      render(<ExpenseForm onAddTransaction={mockOnAddTransaction} />);
    });

    const descInput = screen.getByLabelText("Descripción");
    const amountInput = screen.getByLabelText("Monto ($)");
    const categorySelect = screen.getByLabelText("Categoría");
    const dateInput = screen.getByLabelText("Fecha");
    const typeSelect = screen.getByLabelText("Tipo");
    const submitBtn = screen.getByRole("button", { name: "Agregar Transacción" });

    // Type in fields
    await user.type(descInput, "Cena restaurante");
    await user.type(amountInput, "45.5");
    await user.selectOptions(categorySelect, "Comida");
    await user.clear(dateInput);
    await user.type(dateInput, "2026-07-15");
    await user.selectOptions(typeSelect, "gasto");

    await act(async () => {
      await user.click(submitBtn);
    });

    expect(mockOnAddTransaction).toHaveBeenCalledWith({
      description: "Cena restaurante",
      amount: 45.5,
      category: "Comida",
      date: "2026-07-15",
      type: "gasto",
    });

    // Check that form was reset (except date, which goes to today's date)
    expect((descInput as HTMLInputElement).value).toBe("");
    expect((amountInput as HTMLInputElement).value).toBe("");
    expect((categorySelect as HTMLSelectElement).value).toBe("");
  });
});

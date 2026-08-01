// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryRow } from "./CategoryRow";
import { useCategories } from "./CategoriesContext";
import { CategoryRule } from "../../types";

vi.mock("./CategoriesContext", () => ({
  useCategories: vi.fn(),
}));

describe("CategoryRow component", () => {
  const mockDeleteRule = vi.fn();
  const mockUpdateRule = vi.fn();

  const rule: CategoryRule = {
    id: 1,
    name: "Viajes",
    keywords: ["avion", "hotel"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCategories).mockReturnValue({
      deleteRule: mockDeleteRule,
      updateRule: mockUpdateRule,
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("should render row details in non-editing mode correctly", () => {
    render(
      <table>
        <tbody>
          <CategoryRow rule={rule} />
        </tbody>
      </table>
    );

    expect(screen.getByText("Viajes")).toBeDefined();
    expect(screen.getByText("avion")).toBeDefined();
    expect(screen.getByText("hotel")).toBeDefined();

    // Verify edit/delete button titles
    expect(screen.getByTitle("Editar Categoría")).toBeDefined();
    expect(screen.getByTitle("Eliminar Categoría")).toBeDefined();
  });

  it("should transition to edit mode when Edit button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <table>
        <tbody>
          <CategoryRow rule={rule} />
        </tbody>
      </table>
    );

    const editBtn = screen.getByTitle("Editar Categoría");
    await user.click(editBtn);

    // Verify inputs render with current values
    const nameInput = screen.getByDisplayValue("Viajes") as HTMLInputElement;
    const keywordsInput = screen.getByDisplayValue("avion, hotel") as HTMLInputElement;
    expect(nameInput).toBeDefined();
    expect(keywordsInput).toBeDefined();

    expect(screen.getByTitle("Guardar")).toBeDefined();
    expect(screen.getByTitle("Cancelar")).toBeDefined();
  });

  it("should invoke updateRule when save button is clicked in edit mode", async () => {
    const user = userEvent.setup();
    mockUpdateRule.mockResolvedValue(true);

    render(
      <table>
        <tbody>
          <CategoryRow rule={rule} />
        </tbody>
      </table>
    );

    // Open edit mode
    await user.click(screen.getByTitle("Editar Categoría"));

    // Modify values
    const nameInput = screen.getByDisplayValue("Viajes");
    const keywordsInput = screen.getByDisplayValue("avion, hotel");

    await user.clear(nameInput);
    await user.type(nameInput, "Vacaciones");
    await user.type(keywordsInput, ", playa");

    // Click Save
    await user.click(screen.getByTitle("Guardar"));

    expect(mockUpdateRule).toHaveBeenCalledWith(1, "Vacaciones", "avion, hotel, playa");
  });

  it("should cancel edit mode when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <table>
        <tbody>
          <CategoryRow rule={rule} />
        </tbody>
      </table>
    );

    await user.click(screen.getByTitle("Editar Categoría"));
    expect(screen.getByDisplayValue("Viajes")).toBeDefined();

    // Click cancel
    await user.click(screen.getByTitle("Cancelar"));

    // Check that we returned to plain text and inputs are gone
    expect(screen.queryByDisplayValue("Viajes")).toBeNull();
    expect(screen.getByText("Viajes")).toBeDefined();
  });

  it("should invoke deleteRule when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <table>
        <tbody>
          <CategoryRow rule={rule} />
        </tbody>
      </table>
    );

    const deleteBtn = screen.getByTitle("Eliminar Categoría");
    await user.click(deleteBtn);

    expect(mockDeleteRule).toHaveBeenCalledWith(1);
  });
});

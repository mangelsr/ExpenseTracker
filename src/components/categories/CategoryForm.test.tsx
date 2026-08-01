// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryForm } from "./CategoryForm";
import { useCategories } from "./CategoriesContext";

afterEach(() => {
  cleanup();
});

// Mock the context hook
vi.mock("./CategoriesContext", () => {
  return {
    useCategories: vi.fn(),
  };
});

describe("CategoryForm component", () => {
  const mockAddRule = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCategories).mockReturnValue({
      rules: [],
      loading: false,
      loadRules: vi.fn(),
      addRule: mockAddRule,
      deleteRule: vi.fn(),
      updateRule: vi.fn(),
    });
  });

  it("should render labels, inputs, and the submit button correctly", () => {
    render(<CategoryForm />);

    expect(screen.getByText("Agregar Nueva Categoría")).toBeDefined();
    expect(screen.getByLabelText("Nombre de Categoría")).toBeDefined();
    expect(screen.getByLabelText("Palabras Clave (separadas por coma)")).toBeDefined();
    expect(screen.getByRole("button", { name: "Agregar" })).toBeDefined();
  });

  it("should call addRule with correct arguments when values are filled and form is submitted", async () => {
    const user = userEvent.setup();
    mockAddRule.mockResolvedValue(true);

    render(<CategoryForm />);

    const nameInput = screen.getByLabelText("Nombre de Categoría");
    const keywordsInput = screen.getByLabelText("Palabras Clave (separadas por coma)");
    const submitBtn = screen.getByRole("button", { name: "Agregar" });

    // Type in fields
    await user.type(nameInput, "Viajes");
    await user.type(keywordsInput, "avion, hotel, maleta");

    // Submit
    await user.click(submitBtn);

    expect(mockAddRule).toHaveBeenCalledWith("Viajes", "avion, hotel, maleta");
  });

  it("should clear input fields upon successful rule creation", async () => {
    const user = userEvent.setup();
    // mock successful addRule
    mockAddRule.mockResolvedValue(true);

    render(<CategoryForm />);

    const nameInput = screen.getByLabelText("Nombre de Categoría") as HTMLInputElement;
    const keywordsInput = screen.getByLabelText("Palabras Clave (separadas por coma)") as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: "Agregar" });

    await user.type(nameInput, "Ocio");
    await user.type(keywordsInput, "cine, bar");

    await user.click(submitBtn);

    // Inputs should be cleared
    expect(nameInput.value).toBe("");
    expect(keywordsInput.value).toBe("");
  });

  it("should not clear inputs if addRule returns false", async () => {
    const user = userEvent.setup();
    // mock failed addRule
    mockAddRule.mockResolvedValue(false);

    render(<CategoryForm />);

    const nameInput = screen.getByLabelText("Nombre de Categoría") as HTMLInputElement;
    const keywordsInput = screen.getByLabelText("Palabras Clave (separadas por coma)") as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: "Agregar" });

    await user.type(nameInput, "Fallo");
    await user.type(keywordsInput, "test");

    await user.click(submitBtn);

    // Inputs should NOT be cleared
    expect(nameInput.value).toBe("Fallo");
    expect(keywordsInput.value).toBe("test");
  });

  it("should not call addRule if category name is empty", async () => {
    const user = userEvent.setup();

    render(<CategoryForm />);

    const nameInput = screen.getByLabelText("Nombre de Categoría") as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: "Agregar" });

    // Try submitting without typing name
    await user.click(submitBtn);

    // In CategoryForm.tsx, name input has 'required' attribute, and also a JS guard:
    // 'if (!newCategoryName.trim()) return;'
    expect(mockAddRule).not.toHaveBeenCalled();
  });
});

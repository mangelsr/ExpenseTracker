// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CategoryList } from "./CategoryList";
import { useCategories } from "./CategoriesContext";

vi.mock("./CategoriesContext", () => ({
  useCategories: vi.fn(),
}));

vi.mock("./CategoryRow", () => ({
  CategoryRow: ({ rule }: any) => (
    <tr data-testid="mock-category-row">
      <td>{rule.name}</td>
    </tr>
  ),
}));

describe("CategoryList component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render loading state correctly", () => {
    vi.mocked(useCategories).mockReturnValue({
      rules: [],
      loading: true,
    } as any);

    render(<CategoryList />);

    expect(screen.getByText("Cargando categorías...")).toBeDefined();
  });

  it("should render empty placeholder when there are no rules", () => {
    vi.mocked(useCategories).mockReturnValue({
      rules: [],
      loading: false,
    } as any);

    render(<CategoryList />);

    expect(screen.getByText("No hay categorías configuradas.")).toBeDefined();
  });

  it("should render category rows when rules are loaded", () => {
    vi.mocked(useCategories).mockReturnValue({
      rules: [
        { id: 1, name: "Transporte", keywords: [] },
        { id: 2, name: "Comida", keywords: [] },
      ],
      loading: false,
    } as any);

    render(<CategoryList />);

    const rows = screen.getAllByTestId("mock-category-row");
    expect(rows).toHaveLength(2);
    expect(screen.getByText("Transporte")).toBeDefined();
    expect(screen.getByText("Comida")).toBeDefined();
  });
});

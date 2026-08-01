// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplianceFilters } from "./ApplianceFilters";
import { useAppliances } from "./AppliancesContext";

vi.mock("./AppliancesContext", () => ({
  useAppliances: vi.fn(),
}));

describe("ApplianceFilters component", () => {
  const mockSetSearchQuery = vi.fn();
  const mockSetTypeFilter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppliances).mockReturnValue({
      searchQuery: "refrig",
      setSearchQuery: mockSetSearchQuery,
      typeFilter: "buy",
      setTypeFilter: mockSetTypeFilter,
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("should render filter inputs and active states correctly", () => {
    render(<ApplianceFilters />);

    const searchInput = screen.getByPlaceholderText("Buscar electrodoméstico...") as HTMLInputElement;
    expect(searchInput.value).toBe("refrig");

    // Verify all filter buttons are rendered
    expect(screen.getByRole("button", { name: "Todos" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Compras" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Instalaciones" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Mantenimiento" })).toBeDefined();

    // Check that "Compras" has active styling, "Todos" has inactive styling
    const comprasBtn = screen.getByRole("button", { name: "Compras" });
    const todosBtn = screen.getByRole("button", { name: "Todos" });

    expect(comprasBtn.className).toContain("bg-indigo-500");
    expect(todosBtn.className).toContain("bg-slate-900");
  });

  it("should invoke setSearchQuery when search input changes", async () => {
    const user = userEvent.setup();
    render(<ApplianceFilters />);

    const searchInput = screen.getByPlaceholderText("Buscar electrodoméstico...");
    await user.type(searchInput, "a");

    expect(mockSetSearchQuery).toHaveBeenCalled();
  });

  it("should invoke setTypeFilter when filter buttons are clicked", async () => {
    const user = userEvent.setup();
    render(<ApplianceFilters />);

    const todosBtn = screen.getByRole("button", { name: "Todos" });
    await user.click(todosBtn);

    expect(mockSetTypeFilter).toHaveBeenCalledWith("all");

    const installationBtn = screen.getByRole("button", { name: "Instalaciones" });
    await user.click(installationBtn);
    expect(mockSetTypeFilter).toHaveBeenCalledWith("installation");
  });
});

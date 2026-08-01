// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ApplianceSummary } from "./ApplianceSummary";
import { useAppliances } from "./AppliancesContext";

vi.mock("./AppliancesContext", () => ({
  useAppliances: vi.fn(),
}));

describe("ApplianceSummary component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should display totals correctly", () => {
    vi.mocked(useAppliances).mockReturnValue({
      totals: {
        buy: 1200.5,
        installation: 150,
        maintenance: 80.75,
        total: 1431.25,
      },
    } as any);

    render(<ApplianceSummary />);

    expect(screen.getByText("Total Compras")).toBeDefined();
    expect(screen.getByText("$1200.50")).toBeDefined();

    expect(screen.getByText("Total Instalaciones")).toBeDefined();
    expect(screen.getByText("$150.00")).toBeDefined();

    expect(screen.getByText("Total Mantenimientos")).toBeDefined();
    expect(screen.getByText("$80.75")).toBeDefined();

    expect(screen.getByText("Gasto General")).toBeDefined();
    expect(screen.getByText("$1431.25")).toBeDefined();
  });
});

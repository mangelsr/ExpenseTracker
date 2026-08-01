// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ApplianceList } from "./ApplianceList";
import { useAppliances } from "./AppliancesContext";

vi.mock("./AppliancesContext", () => ({
  useAppliances: vi.fn(),
}));

// Mock ApplianceCard since it's tested separately
vi.mock("./ApplianceCard", () => ({
  ApplianceCard: ({ log }: any) => <div data-testid="mock-appliance-card">{log.applianceName}</div>,
}));

describe("ApplianceList component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render a placeholder when there are no logs", () => {
    vi.mocked(useAppliances).mockReturnValue({
      filteredLogs: [],
    } as any);

    render(<ApplianceList />);

    expect(screen.getByText("No se encontraron registros")).toBeDefined();
    expect(screen.getByText("Registra tu primer electrodoméstico o ajusta tus filtros.")).toBeDefined();
  });

  it("should render cards list when logs are present", () => {
    vi.mocked(useAppliances).mockReturnValue({
      filteredLogs: [
        { id: 1, applianceName: "Refrigerador LG" },
        { id: 2, applianceName: "Televisor Sony" },
      ],
    } as any);

    render(<ApplianceList />);

    const cardElements = screen.getAllByTestId("mock-appliance-card");
    expect(cardElements).toHaveLength(2);
    expect(screen.getByText("Refrigerador LG")).toBeDefined();
    expect(screen.getByText("Televisor Sony")).toBeDefined();
  });
});

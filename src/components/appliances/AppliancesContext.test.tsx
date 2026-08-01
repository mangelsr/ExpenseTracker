// @vitest-environment jsdom
import React from "react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppliancesProvider, useAppliances } from "./AppliancesContext";
import * as db from "../../utils/database";

vi.mock("../../utils/database", () => ({
  getAllApplianceLogs: vi.fn(),
  addApplianceLog: vi.fn(),
  updateApplianceLog: vi.fn(),
  deleteApplianceLog: vi.fn(),
}));

const TestConsumer: React.FC = () => {
  const {
    logs,
    loading,
    applianceName,
    setApplianceName,
    cost,
    setCost,
    date,
    setDate,
    performer,
    setPerformer,
    handleSubmit,
    handleDelete,
    totals,
  } = useAppliances();

  return (
    <div>
      <span data-testid="loading">{loading ? "yes" : "no"}</span>
      <span data-testid="logs-count">{logs.length}</span>
      <span data-testid="total-cost">{totals.total}</span>
      
      <input
        data-testid="name-input"
        value={applianceName}
        onChange={(e) => setApplianceName(e.target.value)}
      />
      <input
        data-testid="cost-input"
        value={cost}
        onChange={(e) => setCost(e.target.value)}
      />
      <input
        data-testid="date-input"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        data-testid="performer-input"
        value={performer}
        onChange={(e) => setPerformer(e.target.value)}
      />
      
      <button data-testid="submit-btn" onClick={(e) => handleSubmit(e as any)}>Submit</button>
      <button data-testid="delete-btn" onClick={() => handleDelete(1)}>Delete</button>
    </div>
  );
};

describe("AppliancesContext / Provider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should load logs on mount and calculate totals correctly", async () => {
    vi.mocked(db.getAllApplianceLogs).mockResolvedValue([
      { id: 1, applianceName: "Refrigerador", type: "buy", cost: 1000, performer: "LG", date: "2026-07-15", dateType: "exact" },
      { id: 2, applianceName: "Instalación Refri", type: "installation", cost: 150, performer: "LG", date: "2026-07-16", dateType: "exact", parentId: 1 },
    ]);

    await act(async () => {
      render(
        <AppliancesProvider>
          <TestConsumer />
        </AppliancesProvider>
      );
    });

    expect(screen.getByTestId("loading").textContent).toBe("no");
    expect(screen.getByTestId("logs-count").textContent).toBe("2");
    expect(screen.getByTestId("total-cost").textContent).toBe("1150");
  });

  it("should add a new log on handleSubmit success", async () => {
    const user = userEvent.setup();
    vi.mocked(db.getAllApplianceLogs).mockResolvedValue([]);
    vi.mocked(db.addApplianceLog).mockResolvedValue(1);

    await act(async () => {
      render(
        <AppliancesProvider>
          <TestConsumer />
        </AppliancesProvider>
      );
    });

    const nameInput = screen.getByTestId("name-input");
    const costInput = screen.getByTestId("cost-input");
    const dateInput = screen.getByTestId("date-input");
    const performerInput = screen.getByTestId("performer-input");
    const submitBtn = screen.getByTestId("submit-btn");

    await user.type(nameInput, "Microondas");
    await user.type(costInput, "120");
    await user.clear(dateInput);
    await user.type(dateInput, "2026-07-18");
    await user.type(performerInput, "Samsung");

    // Mock getAllApplianceLogs to return the new log on reload after adding
    vi.mocked(db.getAllApplianceLogs).mockResolvedValue([
      { id: 1, applianceName: "Microondas", type: "buy", cost: 120, performer: "Samsung", date: "2026-07-18", dateType: "exact" }
    ]);

    await act(async () => {
      await user.click(submitBtn);
    });

    expect(db.addApplianceLog).toHaveBeenCalledWith(expect.objectContaining({
      applianceName: "Microondas",
      cost: 120,
      performer: "Samsung",
      date: "2026-07-18",
    }));

    expect(screen.getByTestId("logs-count").textContent).toBe("1");
    expect(screen.getByTestId("total-cost").textContent).toBe("120");
  });

  it("should delete a log on handleDelete click", async () => {
    const user = userEvent.setup();
    vi.mocked(db.getAllApplianceLogs).mockResolvedValue([
      { id: 1, applianceName: "Refrigerador", type: "buy", cost: 1000, performer: "LG", date: "2026-07-15", dateType: "exact" }
    ]);
    vi.mocked(db.deleteApplianceLog).mockResolvedValue(undefined);
    
    // Stub confirm dialog
    vi.stubGlobal("confirm", () => true);

    await act(async () => {
      render(
        <AppliancesProvider>
          <TestConsumer />
        </AppliancesProvider>
      );
    });

    expect(screen.getByTestId("logs-count").textContent).toBe("1");

    vi.mocked(db.getAllApplianceLogs).mockResolvedValue([]);

    const deleteBtn = screen.getByTestId("delete-btn");
    await act(async () => {
      await user.click(deleteBtn);
    });

    expect(db.deleteApplianceLog).toHaveBeenCalledWith(1);
    expect(screen.getByTestId("logs-count").textContent).toBe("0");

    vi.unstubAllGlobals();
  });
});

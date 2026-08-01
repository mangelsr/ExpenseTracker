// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { AppliancesPage } from "./AppliancesPage";
import * as db from "../utils/database";

vi.mock("../utils/database", () => ({
  getAllApplianceLogs: vi.fn().mockResolvedValue([]),
  addApplianceLog: vi.fn(),
  updateApplianceLog: vi.fn(),
  deleteApplianceLog: vi.fn(),
}));

describe("AppliancesPage component", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render page header and components correctly", async () => {
    await act(async () => {
      render(<AppliancesPage />);
    });

    expect(screen.getByText("Registro de Electrodomésticos")).toBeDefined();
    expect(screen.getByText("Total Compras")).toBeDefined();
  });
});

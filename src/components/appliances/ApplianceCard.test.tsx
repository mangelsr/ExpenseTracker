// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplianceCard } from "./ApplianceCard";
import { useAppliances } from "./AppliancesContext";
import { ApplianceLog } from "../../types";

vi.mock("./AppliancesContext", () => ({
  useAppliances: vi.fn(),
}));

describe("ApplianceCard component", () => {
  const mockHandleEdit = vi.fn();
  const mockHandleDelete = vi.fn();

  const buyLog: ApplianceLog = {
    id: 1,
    applianceName: "Refrigerador",
    date: "2026-07-15",
    dateType: "exact",
    type: "buy",
    performer: "Tienda LG",
    cost: 1200,
    notes: "Nuevo refrigerador LG",
  };

  const maintenanceLog: ApplianceLog = {
    id: 2,
    applianceName: "Lavadora Mantenimiento",
    date: "2026-07-16",
    dateType: "estimated",
    type: "maintenance",
    performer: "Técnico Juan",
    cost: 80,
    notes: "Cambio de filtro",
    parentId: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppliances).mockReturnValue({
      logs: [buyLog, maintenanceLog],
      editingId: undefined,
      applianceName: "",
      type: "buy",
      date: "",
      dateType: "exact",
      performer: "",
      cost: "",
      notes: "",
      parentId: undefined,
      fileBase64: undefined,
      fileName: undefined,
      fileType: undefined,
      searchQuery: "",
      typeFilter: "all",
      setEditingId: vi.fn(),
      setApplianceName: vi.fn(),
      setType: vi.fn(),
      setDate: vi.fn(),
      setDateType: vi.fn(),
      setPerformer: vi.fn(),
      setCost: vi.fn(),
      setNotes: vi.fn(),
      setParentId: vi.fn(),
      setFileBase64: vi.fn(),
      setFileName: vi.fn(),
      setFileType: vi.fn(),
      setSearchQuery: vi.fn(),
      setTypeFilter: vi.fn(),
      loadLogs: vi.fn(),
      handleFileChange: vi.fn(),
      removeAttachedFile: vi.fn(),
      handleTypeChange: vi.fn(),
      handleSubmit: vi.fn(),
      handleEdit: mockHandleEdit,
      handleDelete: mockHandleDelete,
      resetForm: vi.fn(),
      filteredLogs: [buyLog, maintenanceLog],
      parentAppliances: [buyLog],
      totalCost: 1280,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("should render buy log details correctly", () => {
    render(<ApplianceCard log={buyLog} />);

    expect(screen.getByText("Refrigerador")).toBeDefined();
    expect(screen.getByText("Compra")).toBeDefined();
    expect(screen.getByText("Tienda LG")).toBeDefined();
    expect(screen.getByText("$1200.00")).toBeDefined();
    expect(screen.getByText("Nuevo refrigerador LG")).toBeDefined();
  });

  it("should render maintenance log details correctly with parent relationship indicator", () => {
    render(<ApplianceCard log={maintenanceLog} />);

    expect(screen.getByText("Lavadora Mantenimiento")).toBeDefined();
    expect(screen.getByText("Mantenimiento")).toBeDefined();
    expect(screen.getByText("Técnico Juan")).toBeDefined();
    expect(screen.getByText("$80.00")).toBeDefined();
    expect(screen.getByText("Cambio de filtro")).toBeDefined();
    
    // Parent description indicator check (buyLog is parent)
    expect(screen.getByText(/Vinculado a:/)).toBeDefined();
    expect(screen.getByText(/Refrigerador/)).toBeDefined();
  });

  it("should invoke handleEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<ApplianceCard log={buyLog} />);

    const editBtn = screen.getByRole("button", { name: /editar/i } || { label: /editar/i });
    expect(editBtn).toBeDefined();

    await user.click(editBtn);
    expect(mockHandleEdit).toHaveBeenCalledWith(buyLog);
  });

  it("should invoke handleDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<ApplianceCard log={buyLog} />);

    const deleteBtn = screen.getByRole("button", { name: /eliminar/i });
    expect(deleteBtn).toBeDefined();

    await user.click(deleteBtn);
    expect(mockHandleDelete).toHaveBeenCalledWith(buyLog.id);
  });
});

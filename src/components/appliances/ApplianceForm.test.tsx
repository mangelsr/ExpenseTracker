// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplianceForm } from "./ApplianceForm";
import { useAppliances } from "./AppliancesContext";

vi.mock("./AppliancesContext", () => ({
  useAppliances: vi.fn(),
}));

describe("ApplianceForm component", () => {
  const mockSetApplianceName = vi.fn();
  const mockSetPerformer = vi.fn();
  const mockSetCost = vi.fn();
  const mockSetDate = vi.fn();
  const mockSetDateType = vi.fn();
  const mockSetNotes = vi.fn();
  const mockSetParentId = vi.fn();
  const mockHandleSubmit = vi.fn();
  const mockHandleTypeChange = vi.fn();
  const mockResetForm = vi.fn();
  const mockRemoveAttachedFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAppliances).mockReturnValue({
      logs: [
        { id: 1, applianceName: "Refrigerador", type: "buy", cost: 1000, performer: "LG", date: "2026-07-15", dateType: "exact" },
      ],
      editingId: undefined,
      applianceName: "Refrigerador LG",
      type: "buy",
      date: "2026-07-15",
      dateType: "exact",
      performer: "Tienda LG",
      cost: "1200",
      notes: "Nota de test",
      parentId: undefined,
      fileName: undefined,
      fileBase64: undefined,
      fileType: undefined,
      setApplianceName: mockSetApplianceName,
      setDate: mockSetDate,
      setDateType: mockSetDateType,
      setPerformer: mockSetPerformer,
      setCost: mockSetCost,
      setNotes: mockSetNotes,
      setParentId: mockSetParentId,
      handleFileChange: vi.fn(),
      removeAttachedFile: mockRemoveAttachedFile,
      handleTypeChange: mockHandleTypeChange,
      handleSubmit: mockHandleSubmit,
      resetForm: mockResetForm,
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("should render correctly in creation mode", () => {
    render(<ApplianceForm />);

    expect(screen.getByText("Nuevo Registro")).toBeDefined();
    expect(screen.getByLabelText("Electrodoméstico *")).toBeDefined();
    expect(screen.getByLabelText("Realizado por *")).toBeDefined();
    expect(screen.getByLabelText("Costo ($) *")).toBeDefined();
    expect(screen.getByLabelText("Fecha *")).toBeDefined();
    
    // Check that parent association select is not displayed when type is "buy"
    expect(screen.queryByLabelText("Vincular a Equipo Comprado")).toBeNull();
    
    // Check submit button text
    expect(screen.getByRole("button", { name: /agregar registro/i })).toBeDefined();
  });

  it("should render correctly in editing mode", () => {
    vi.mocked(useAppliances).mockReturnValue({
      logs: [
        { id: 1, applianceName: "Refrigerador", type: "buy", cost: 1000, performer: "LG", date: "2026-07-15", dateType: "exact" },
      ],
      editingId: 1,
      applianceName: "Refrigerador LG",
      type: "installation", // change type to show parent ID select
      date: "2026-07-15",
      dateType: "exact",
      performer: "Tienda LG",
      cost: "1200",
      notes: "Nota de test",
      parentId: undefined,
      fileName: "invoice.pdf",
      fileBase64: "data:pdf",
      fileType: "application/pdf",
      setApplianceName: mockSetApplianceName,
      setDate: mockSetDate,
      setDateType: mockSetDateType,
      setPerformer: mockSetPerformer,
      setCost: mockSetCost,
      setNotes: mockSetNotes,
      setParentId: mockSetParentId,
      handleFileChange: vi.fn(),
      removeAttachedFile: mockRemoveAttachedFile,
      handleTypeChange: mockHandleTypeChange,
      handleSubmit: mockHandleSubmit,
      resetForm: mockResetForm,
    } as any);

    render(<ApplianceForm />);

    expect(screen.getByText("Editar Registro")).toBeDefined();
    expect(screen.getByRole("button", { name: "Guardar Cambios" })).toBeDefined();

    // Verify parent selection label is rendered because type is installation
    expect(screen.getByLabelText("Vincular a Equipo Comprado")).toBeDefined();

    // Verify filename indicator is shown
    expect(screen.getByText("invoice.pdf")).toBeDefined();
  });

  it("should invoke handler events on value changes", async () => {
    const user = userEvent.setup();
    render(<ApplianceForm />);

    const nameInput = screen.getByLabelText("Electrodoméstico *");
    await user.type(nameInput, "!");
    expect(mockSetApplianceName).toHaveBeenCalled();

    const performerInput = screen.getByLabelText("Realizado por *");
    await user.type(performerInput, "!");
    expect(mockSetPerformer).toHaveBeenCalled();

    const costInput = screen.getByLabelText("Costo ($) *");
    await user.type(costInput, "0");
    expect(mockSetCost).toHaveBeenCalled();
  });

  it("should trigger handleTypeChange when type buttons are clicked", async () => {
    const user = userEvent.setup();
    render(<ApplianceForm />);

    // Click on Instalación type button
    const instBtn = screen.getByRole("button", { name: /instalación/i });
    await user.click(instBtn);

    expect(mockHandleTypeChange).toHaveBeenCalledWith("installation");
  });

  it("should call handleSubmit on form submit", async () => {
    const user = userEvent.setup();
    render(<ApplianceForm />);

    const submitBtn = screen.getByRole("button", { name: /agregar registro/i });
    
    // We mock handleSubmit in hook. The form submit should trigger it.
    await user.click(submitBtn);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("should call removeAttachedFile when attachment cancel is clicked", async () => {
    vi.mocked(useAppliances).mockReturnValue({
      logs: [],
      editingId: 1,
      applianceName: "Refrigerador LG",
      type: "buy",
      date: "2026-07-15",
      dateType: "exact",
      performer: "Tienda LG",
      cost: "1200",
      notes: "Nota de test",
      parentId: undefined,
      fileName: "invoice.pdf",
      fileBase64: "data:pdf",
      fileType: "application/pdf",
      removeAttachedFile: mockRemoveAttachedFile,
      setApplianceName: vi.fn(),
      setDate: vi.fn(),
      setDateType: vi.fn(),
      setPerformer: vi.fn(),
      setCost: vi.fn(),
      setNotes: vi.fn(),
      setParentId: vi.fn(),
      handleFileChange: vi.fn(),
      handleTypeChange: vi.fn(),
      handleSubmit: vi.fn(),
      resetForm: mockResetForm,
    } as any);

    render(<ApplianceForm />);

    // Cancel file button has title="Remover Archivo" or is adjacent to the filename
    const removeFileBtn = screen.getByTitle("Remover Archivo");
    const user = userEvent.setup();
    await user.click(removeFileBtn);

    expect(mockRemoveAttachedFile).toHaveBeenCalled();
  });
});

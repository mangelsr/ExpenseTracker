import { vi, describe, it, expect } from "vitest";
import { exportToCSV } from "./export";
import { Transaction } from "../types";

describe("exportToCSV", () => {
  it("should format transactions to CSV and trigger download in browser", () => {
    const mockClick = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();

    const mockElement = {
      setAttribute: vi.fn(),
      style: {
        visibility: "",
      },
      click: mockClick,
    };

    vi.stubGlobal("document", {
      createElement: vi.fn().mockReturnValue(mockElement),
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
      },
    });

    const mockBlobConstructor = vi.fn().mockImplementation(function (content, options) {
      return { content, options };
    });
    vi.stubGlobal("Blob", mockBlobConstructor);

    const mockCreateObjectURL = vi.fn().mockReturnValue("blob:http://localhost/1234");
    vi.stubGlobal("URL", {
      createObjectURL: mockCreateObjectURL,
    });

    const mockTransactions: Transaction[] = [
      {
        date: "2026-07-15",
        description: "Mercadona compra",
        amount: 15.5,
        category: "Supermercado",
        type: "gasto",
      },
      {
        date: "2026-07-16",
        description: "Nómina recibida",
        amount: 1500,
        category: "Sueldo",
        type: "ingreso",
      },
    ];

    exportToCSV(mockTransactions);

    // Verify Blob creation with correct CSV formatted content
    expect(mockBlobConstructor).toHaveBeenCalled();
    const blobContent = mockBlobConstructor.mock.calls[0][0][0];
    expect(blobContent).toBe(
      "date,description,amount,category,type\n" +
      "2026-07-15,Mercadona compra,15.5,Supermercado,gasto\n" +
      "2026-07-16,Nómina recibida,1500,Sueldo,ingreso\n"
    );

    // Verify DOM interaction
    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockElement.setAttribute).toHaveBeenCalledWith("href", "blob:http://localhost/1234");
    expect(mockElement.setAttribute).toHaveBeenCalledWith("download", "gastos.csv");
    expect(mockElement.style.visibility).toBe("hidden");
    expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);

    // Cleanup globals stubbing
    vi.unstubAllGlobals();
  });
});

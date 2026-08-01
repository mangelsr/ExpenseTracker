// @vitest-environment jsdom
import React from "react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoriesProvider, useCategories } from "./CategoriesContext";
import * as db from "../../utils/database";

vi.mock("../../utils/database", () => ({
  getAllCategoryRules: vi.fn(),
  saveCategoryRule: vi.fn(),
  updateCategoryRule: vi.fn(),
  deleteCategoryRule: vi.fn(),
}));

const TestConsumer: React.FC = () => {
  const {
    rules,
    loading,
    addRule,
    deleteRule,
    updateRule,
  } = useCategories();

  return (
    <div>
      <span data-testid="loading">{loading ? "yes" : "no"}</span>
      <span data-testid="rules-count">{rules.length}</span>
      <button data-testid="add-btn" onClick={() => addRule("Supermercado", "Mercadona, Dia")}>Add</button>
      <button data-testid="update-btn" onClick={() => updateRule(1, "Super", "Lidl")}>Update</button>
      <button data-testid="delete-btn" onClick={() => deleteRule(1)}>Delete</button>
    </div>
  );
};

describe("CategoriesContext / Provider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should load rules on mount", async () => {
    vi.mocked(db.getAllCategoryRules).mockResolvedValue([
      { id: 1, name: "Transporte", keywords: ["uber"] },
    ]);

    await act(async () => {
      render(
        <CategoriesProvider>
          <TestConsumer />
        </CategoriesProvider>
      );
    });

    // Check loading goes to false after resolution
    expect(screen.getByTestId("loading").textContent).toBe("no");
    // Verify count of loaded rules
    expect(screen.getByTestId("rules-count").textContent).toBe("1");
  });

  it("should add a new rule on addRule call", async () => {
    const user = userEvent.setup();
    vi.mocked(db.getAllCategoryRules).mockResolvedValue([]);
    vi.mocked(db.saveCategoryRule).mockResolvedValue(1);

    await act(async () => {
      render(
        <CategoriesProvider>
          <TestConsumer />
        </CategoriesProvider>
      );
    });

    const addBtn = screen.getByTestId("add-btn");

    vi.mocked(db.getAllCategoryRules).mockResolvedValue([
      { id: 1, name: "Supermercado", keywords: ["Mercadona", "Dia"] },
    ]);

    await act(async () => {
      await user.click(addBtn);
    });

    expect(db.saveCategoryRule).toHaveBeenCalledWith(expect.objectContaining({
      name: "Supermercado",
      keywords: ["Mercadona", "Dia"],
    }));
    expect(screen.getByTestId("rules-count").textContent).toBe("1");
  });

  it("should update a rule on updateRule call", async () => {
    const user = userEvent.setup();
    vi.mocked(db.getAllCategoryRules).mockResolvedValue([
      { id: 1, name: "Transporte", keywords: ["uber"] },
    ]);
    vi.mocked(db.updateCategoryRule).mockResolvedValue(1);

    await act(async () => {
      render(
        <CategoriesProvider>
          <TestConsumer />
        </CategoriesProvider>
      );
    });

    const updateBtn = screen.getByTestId("update-btn");

    vi.mocked(db.getAllCategoryRules).mockResolvedValue([
      { id: 1, name: "Super", keywords: ["Lidl"] },
    ]);

    await act(async () => {
      await user.click(updateBtn);
    });

    expect(db.updateCategoryRule).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      name: "Super",
      keywords: ["Lidl"],
    }));
  });

  it("should delete a rule on deleteRule call", async () => {
    const user = userEvent.setup();
    vi.mocked(db.getAllCategoryRules).mockResolvedValue([
      { id: 1, name: "Transporte", keywords: ["uber"] },
    ]);
    vi.mocked(db.deleteCategoryRule).mockResolvedValue(undefined);

    vi.stubGlobal("confirm", () => true);

    await act(async () => {
      render(
        <CategoriesProvider>
          <TestConsumer />
        </CategoriesProvider>
      );
    });

    const deleteBtn = screen.getByTestId("delete-btn");

    vi.mocked(db.getAllCategoryRules).mockResolvedValue([]);

    await act(async () => {
      await user.click(deleteBtn);
    });

    expect(db.deleteCategoryRule).toHaveBeenCalledWith(1);
    expect(screen.getByTestId("rules-count").textContent).toBe("0");

    vi.unstubAllGlobals();
  });
});

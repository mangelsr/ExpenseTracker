// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { CategoriesPage } from "./CategoriesPage";
import * as db from "../utils/database";

vi.mock("../utils/database", () => ({
  getAllCategoryRules: vi.fn().mockResolvedValue([]),
  saveCategoryRule: vi.fn(),
  updateCategoryRule: vi.fn(),
  deleteCategoryRule: vi.fn(),
}));

describe("CategoriesPage component", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render page titles and components correctly", async () => {
    await act(async () => {
      render(<CategoriesPage />);
    });

    expect(screen.getByText("Configuración de Categorías")).toBeDefined();
    expect(screen.getByText("Palabras Clave (Reglas de Auto-categorización)")).toBeDefined();
  });
});

// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navigation } from "./Navigation";

afterEach(() => {
  cleanup();
});

describe("Navigation component", () => {
  it("should render all navigation links with correct text", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Navigation />
      </MemoryRouter>
    );

    // Verify all link texts are present
    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Presupuesto")).toBeDefined();
    expect(screen.getByText("Categorías")).toBeDefined();
    expect(screen.getByText("Electrodomésticos")).toBeDefined();
    expect(screen.getByText("Respaldo")).toBeDefined();
  });

  it("should apply active styles to the current active route link and inactive styles to others", () => {
    // Render with budget page route active
    render(
      <MemoryRouter initialEntries={["/budget"]}>
        <Navigation />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    const budgetLink = screen.getByText("Presupuesto").closest("a");
    const categoriesLink = screen.getByText("Categorías").closest("a");

    // The active style in Navigation.tsx is: bg-indigo-500/10 text-indigo-500
    // The inactive style is: text-slate-400 hover:bg-slate-700 hover:text-slate-50
    expect(budgetLink?.className).toContain("bg-indigo-500/10");
    expect(budgetLink?.className).toContain("text-indigo-500");

    expect(dashboardLink?.className).not.toContain("bg-indigo-500/10");
    expect(dashboardLink?.className).toContain("text-slate-400");

    expect(categoriesLink?.className).not.toContain("bg-indigo-500/10");
    expect(categoriesLink?.className).toContain("text-slate-400");
  });
});

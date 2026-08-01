# Expense Tracker Agent Guidelines

Welcome, Agent! These guidelines are established to ensure that code contributions, refactorings, and features align with the architectural design, styling, and coding practices of the Expense Tracker project.

---

## 🚀 Technical Stack & Architecture

This application is a frontend-only React application designed for personal finance management and appliance logs.

- **Frontend**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) + [TypeScript 6](https://www.typescriptlang.org/)
- **Routing**: [React Router 7](https://reactrouter.com/) (using client-side routing)
- **Database**: Browser-native **IndexedDB** (`ExpenseTrackerDB`), accessed directly without external ODM wrappers
- **Styling**: **Tailwind CSS v4** with a custom theme configuration (using `@import "tailwindcss";` in `src/index.css`)
- **Visuals & Charts**: [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Parsing**: [PapaParse](https://www.papaparse.com/) (CSV) + [xlsx](https://sheetjs.com/) (Excel)
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) + [jsdom](https://github.com/jsdom/jsdom)

---

## 📁 Project Structure

Ensure all new files and modifications are placed in the appropriate directory following this modular structure:

```
src/
├── components/          # Reusable UI components split by domain
│   ├── appliances/      # Appliance forms, filters, list, and context state
│   ├── categories/      # Category rules forms, list, row, and context state
│   ├── dashboard/       # Charts, forms, import zone, table, and summary cards
│   └── Navigation.tsx   # Global navigation bar
├── pages/               # Page-level containers (Dashboard, Budget, Categories, Appliances, Backup)
│   ├── DashboardPage.tsx
│   ├── BudgetPage.tsx
│   ├── CategoriesPage.tsx
│   ├── AppliancesPage.tsx
│   ├── BackupPage.tsx   # Database backup and restore management page
│   └── index.ts         # Pages barrel export
├── utils/               # Utility helper modules
│   ├── database/        # Modular IndexedDB API logic
│   │   ├── connection.ts
│   │   ├── transactions.ts
│   │   ├── budgets.ts
│   │   ├── categoryRules.ts
│   │   ├── applianceLogs.ts
│   │   └── backup.ts    # JSON backup & restore utilities
│   ├── csvImport.ts     # CSV transaction parser & rule mapper
│   ├── excelImport.ts   # Excel (.xlsx) transaction parser
│   ├── export.ts        # CSV transactions exporter
│   └── database.ts      # Database barrel export
├── types.ts             # TypeScript type declarations
├── index.css            # Stylesheet containing CSS custom variables & design system
├── main.tsx             # Entry point
└── App.tsx              # Main application shell & routing
```

---

## 🌐 Language & Naming Conventions

The codebase has a bilingual structure that must be carefully respected:

1. **Code Identifiers (English)**:
   - File names, variables, function names, classes, interfaces, hooks, and context names must be written in **English**.
   - Database store names (`transactions`, `budgets`, `category_rules`, `appliance_logs`) and columns/keys are in English.
   - Example: `Transaction`, `ApplianceLog`, `CategoryRule`, `initDatabase()`, `useCategories()`.

2. **User Interface & Core Values (Spanish)**:
   - User-facing text, error messages, form labels, and category names must be written in **Spanish**.
   - The type of transaction must strictly be `"ingreso" | "gasto"`.
   - Default keywords in category rules are in Spanish (e.g., `["supermercado", "gasolina", "comida"]`).
   - Example: `"Base de datos no inicializada. Llama a initDatabase primero."`

---

## 💾 Database Guidelines (IndexedDB)

The local database store (`ExpenseTrackerDB`) runs on version `4` and contains four main stores:

1. `transactions`: IDB store for income/expenses.
2. `budgets`: Monthly planning targets (indexed by unique `month` in `YYYY-MM` format).
3. `category_rules`: Custom rules for automatic categorization mapping.
4. `appliance_logs`: Purchase, installation, and maintenance events for appliances.

### Key Rules

- **Initialization**: Always initialize the database before interacting with stores using `initDatabase()` or through context providers.
- **Transactions**: Use the modular db helpers in [src/utils/database/](file:///home/miguel/code/ExpenseTracker/src/utils/database/) instead of raw indexedDB calls.
- **Database Upgrades**: If you need to add store configurations, indexes, or modify schemas, do so in [connection.ts](file:///home/miguel/code/ExpenseTracker/src/utils/database/connection.ts) and increment the `DB_VERSION` constant. Never downgrade the version.
- **State Integration**: Connect database actions with Context Providers (like `CategoriesContext.tsx` or `AppliancesContext.tsx`) to trigger state updates in the UI when the DB changes.

---

## 🎨 Styling & UI Design System

We aim to create a **premium, responsive, and cohesive user experience**.

- **Tailwind CSS v4**: Use utility classes wherever possible. Do not invent custom styling rules unless they are registered in the Tailwind config or `@theme`.
- **Typography**: The design system uses:
  - **Inter** for body text and labels (`font-sans`).
  - **Outfit** for headings and title displays (`font-heading`).
- **Visual Aesthetic**:
  - Theme: Sleek dark mode (`bg-slate-900` background with `text-slate-50` body).
  - Cards: Semi-transparent glassmorphism with subtle borders (`bg-slate-800/50 backdrop-blur-md border border-slate-700/50`).
  - Interactive elements: Smooth hover micro-animations, transitions, and clear active states.
  - Colors: Avoid generic pure colors. Use slate, indigo, emerald, rose, and amber variants for status and category styling.

---

## 🔧 Workflow & Quality Checks

Before finishing any task or claiming success, ensure the following checks pass:

1. **Linting**: Run lint rules via ESLint to ensure clean code style:

   ```bash
   pnpm run lint
   ```

2. **Unit Testing**: Run the unit test suite to ensure no regressions are introduced:

   ```bash
   pnpm run test
   ```

   If you have added or updated code logic, always make sure to write corresponding unit tests beside the source code.
   You can also check test coverage using:

   ```bash
   pnpm run test:coverage
   ```

   Note that specific folders (like the IndexedDB connection setups or type files) are excluded from coverage calculations as configured in [vite.config.ts](file:///home/miguel/code/ExpenseTracker/vite.config.ts).
3. **Production Build**: Verify that compilation, TypeScript checks, and bundler packaging succeed without any warnings or errors:

   ```bash
   pnpm run build
   ```

4. **TypeScript Types**: Maintain strict typing and export interfaces from [types.ts](file:///home/miguel/code/ExpenseTracker/src/types.ts). Avoid the `any` keyword.

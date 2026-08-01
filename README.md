# React Expense Tracker

A modern, responsive, and fully-featured Expense Tracker application built with React, Vite, and TypeScript. This application allows users to manage their personal finances securely with local data storage using IndexedDB.

## Features

- **Dashboard Overview**: Get a quick glance at your total balance, total income, and total expenses with beautifully designed summary cards.
- **Transaction Management**: Easily add, edit, and delete transactions. Categorize transactions as income or expense.
- **Visual Analytics**: Interactive charts using Chart.js to visualize your spending and income by category over time.
- **Local Storage**: All data is stored locally in your browser using IndexedDB, ensuring complete privacy, zero server dependency, and fast access.
- **CSV & Excel Import/Export**:
  - Import your existing financial data via CSV (powered by PapaParse) or Excel (.xlsx, powered by SheetJS) using the intuitive drag-and-drop interface.
  - Automatically maps and categorizes transactions based on your rules.
  - Export your transactions to a CSV file for backup or external analysis.
- **Monthly Budget Configuration**:
  - Set expected income and expense targets for any month.
  - Compare planned figures versus actual performance to calculate your expected monthly balance.
- **Categorization Rules**:
  - Define custom category rules mapping keyword lists to categories (e.g. food, transport, digital services).
  - Automatically matches keywords against description fields when importing transaction files.
- **Electrodomestics Log Tracker**:
  - Keep a structured history of purchases, installations, and maintenance for household appliances.
  - Track costs, dates (exact or estimated), responsible performers, and current status (active, in maintenance, retired).
  - Attach receipts, invoices, or manuals directly using Base64 file attachments.
- **Database Backup & Restore**:
  - Full database management page allowing you to backup the entire IndexedDB store (transactions, budgets, rules, appliance logs) as a single JSON file.
  - Restore database state instantly by uploading a previously exported JSON backup file.
- **Premium Design**: A polished, custom UI built with Vanilla CSS for maximum flexibility, featuring custom responsive layouts, smooth animations, glassmorphism, and a dark/sleek theme.

## Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router](https://reactrouter.com/)
- **State Management**: React Context APIs (`CategoryContext`, `ApplianceContext`)
- **Styling**: Vanilla CSS with custom properties for modern styling & theming
- **Database**: IndexedDB API
- **Charts**: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **File Parsing**: [PapaParse](https://www.papaparse.com/) (CSV) & [xlsx](https://sheetjs.com/) (Excel)
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/mangelsr/ExpenseTracker.git
   ```

2. Navigate to the project directory:

   ```bash
   cd ExpenseTracker
   ```

3. Install the dependencies:

   ```bash
   pnpm install
   ```

### Running the Development Server

Start the Vite development server:

```bash
pnpm run dev
```

Open `http://localhost:5173` in your browser to view the application.

### Running Tests

The project includes a comprehensive unit test suite using Vitest and React Testing Library:

- Run tests once:

  ```bash
  pnpm run test
  ```

- Run tests in watch mode:

  ```bash
  pnpm run test:watch
  ```

- Run tests with coverage:

  ```bash
  pnpm run test:coverage
  ```

### Building for Production

To create a production-ready build:

```bash
pnpm run build
```

You can preview the production build locally:

```bash
pnpm run preview
```

## Project Structure

The project has been refactored for clean separation of concerns and modularity:

```
src/
├── components/          # Reusable UI components
│   ├── appliances/      # Appliance logging forms, filters, list, and context state
│   ├── categories/      # Category rules forms, list, row, and context state
│   ├── dashboard/       # Charts, forms, import zone, table, and summary cards
│   └── Navigation.tsx   # Global navigation bar
├── pages/               # Page-level containers
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

## Database Schema (IndexedDB)

The local database (`ExpenseTrackerDB`) is organized into four main object stores (running on version `4`):

1. `transactions`: Stores individual income/expense items with date, description, amount, category, and type.
2. `budgets`: Stores monthly planned income and expenses (indexed by month in `YYYY-MM` format).
3. `category_rules`: Stores automatic categorization mapping rules, mapping category names to lists of keywords. Pre-populated with default utility rules.
4. `appliance_logs`: Stores purchase, installation, and maintenance events for appliances, including performer, cost, date (exact/estimated), and Base64 attachment files.

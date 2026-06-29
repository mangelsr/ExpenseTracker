# React Expense Tracker

A modern, responsive, and fully-featured Expense Tracker application built with React, Vite, and TypeScript. This application allows users to manage their personal finances securely with local data storage using IndexedDB.

## Features

- **Dashboard Overview**: Get a quick glance at your total balance, total income, and total expenses with beautifully designed summary cards.
- **Transaction Management**: Easily add, edit, and delete transactions. Categorize transactions as income or expense.
- **Visual Analytics**: Interactive charts using Chart.js to visualize your spending and income by category over time.
- **Local Storage**: All data is stored locally in your browser using IndexedDB, ensuring complete privacy, zero server dependency, and fast access.
- **CSV Import/Export**:
  - Import your existing financial data via CSV using the intuitive drag-and-drop interface powered by PapaParse.
  - Export your transactions to a CSV file for backup or external analysis.
- **Monthly Budget Configuration**:
  - Set expected income and expense targets for any month.
  - Compare planned figures versus actual performance to calculate your expected monthly balance.
- **Categorization Rules**:
  - Define custom category rules mapping keyword lists to categories (e.g. food, transport, digital services).
  - Automatically matches keywords against description fields when importing transaction CSVs.
- **Electrodomestics Log Tracker**:
  - Keep a structured history of purchases, installations, and maintenance for household appliances.
  - Track costs, dates (exact or estimated), responsible performers, and current status (active, in maintenance, retired).
  - Attach receipts, invoices, or manuals directly using Base64 file attachments.
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
- **CSV Parsing**: [PapaParse](https://www.papaparse.com/)

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
   pnpm install # or npm install / yarn install
   ```

### Running the Development Server

Start the Vite development server:

```bash
pnpm run dev # or npm run dev
```

Open `http://localhost:5173` (or the port specified in your terminal) in your browser to view the application.

### Building for Production

To create a production-ready build:

```bash
pnpm run build # or npm run build
```

You can preview the production build locally:

```bash
pnpm run preview # or npm run preview
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
│   └── index.ts         # Pages barrel export
├── utils/               # Utility helper modules
│   ├── database/        # Modular IndexedDB API logic (transactions, budgets, category rules, appliance logs)
│   ├── csvImport.ts     # CSV transaction parser & rule mapper
│   ├── export.ts        # CSV transactions exporter
│   └── database.ts      # Database barrel export
├── types.ts             # TypeScript type declarations
├── index.css            # Stylesheet containing CSS custom variables & design system
├── main.tsx             # Entry point
└── App.tsx              # Main application shell & routing
```

## Database Schema (IndexedDB)

The local database (`ExpenseTrackerDB`) is organized into four main object stores:

1. `transactions`: Stores individual income/expense items with date, description, amount, category, and type.
2. `budgets`: Stores monthly planned income and expenses (indexed by month in `YYYY-MM` format).
3. `category_rules`: Stores automatic categorization mapping rules, mapping category names to lists of keywords. Pre-populated with default utility rules.
4. `appliance_logs`: Stores purchase, installation, and maintenance events for appliances, including performer, cost, date (exact/estimated), and Base64 attachment files.

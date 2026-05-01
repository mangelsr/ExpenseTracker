# React Expense Tracker

A modern, responsive, and fully-featured Expense Tracker application built with React, Vite, and TypeScript. This application allows users to manage their personal finances securely with local data storage using IndexedDB.

## Features

- **Dashboard Overview**: Get a quick glance at your total balance, total income, and total expenses with beautifully designed summary cards.
- **Transaction Management**: Easily add, edit, and delete transactions. Categorize transactions as income or expense.
- **Visual Analytics**: Interactive charts using Chart.js to visualize your spending and income by category over time.
- **Local Storage**: All data is stored locally in your browser using IndexedDB, ensuring complete privacy and fast access. No server setup is required.
- **CSV Import/Export**:
  - Import your existing financial data via CSV using the intuitive drag-and-drop interface powered by PapaParse.
  - Export your transactions to a CSV file for backup or external analysis.
- **Premium Design**: A polished, custom UI built with Vanilla CSS for maximum flexibility, featuring responsive layouts, smooth animations, and a modern aesthetic.

## Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS with custom properties for theming
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
   npm install
   ```

### Running the Development Server

Start the Vite development server:

```bash
npm run dev
```

Open `http://localhost:5173` (or the port specified in your terminal) in your browser to view the application.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

You can preview the production build locally:

```bash
npm run preview
```

## Project Structure

- `src/components/`: React components (`SummaryCards`, `TransactionTable`, `ExpenseForm`, `CategoryChart`, `ImportDropzone`)
- `src/utils/`: Utility functions for database interactions (`database.ts`) and CSV processing (`csvImport.ts`, `export.ts`)
- `src/index.css`: Main stylesheet containing the design system tokens and styling rules.
- `src/App.tsx`: Main application component tying everything together.

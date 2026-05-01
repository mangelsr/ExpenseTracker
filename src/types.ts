export interface Transaction {
  id?: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "ingreso" | "gasto";
}

export interface Budget {
  id?: number;
  month: string; // YYYY-MM format
  plannedIncome: number;
  plannedExpense: number;
}

export interface CategoryRule {
  id?: number;
  name: string;
  keywords: string[];
}

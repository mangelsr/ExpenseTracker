import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Transaction } from "../types";

interface SummaryCardsProps {
  transactions: Transaction[];
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const income = transactions
    .filter((t) => t.type === "ingreso")
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const expense = transactions
    .filter((t) => t.type === "gasto")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = income - expense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="summary-grid">
      <div className="summary-card income">
        <div className="summary-icon-wrapper">
          <TrendingUp className="icon" />
        </div>
        <div className="summary-content">
          <p className="summary-label">Ingresos</p>
          <h3 className="summary-value">{formatCurrency(income)}</h3>
        </div>
      </div>
      
      <div className="summary-card expense">
        <div className="summary-icon-wrapper">
          <TrendingDown className="icon" />
        </div>
        <div className="summary-content">
          <p className="summary-label">Gastos</p>
          <h3 className="summary-value">{formatCurrency(expense)}</h3>
        </div>
      </div>

      <div className="summary-card balance">
        <div className="summary-icon-wrapper">
          <DollarSign className="icon" />
        </div>
        <div className="summary-content">
          <p className="summary-label">Balance Total</p>
          <h3 className="summary-value">{formatCurrency(balance)}</h3>
        </div>
      </div>
    </div>
  );
}

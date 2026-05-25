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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500">
          <TrendingUp />
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">Ingresos</p>
          <h3 className="text-2xl font-bold m-0">{formatCurrency(income)}</h3>
        </div>
      </div>
      
      <div className="bg-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-red-500/10 text-red-500">
          <TrendingDown />
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">Gastos</p>
          <h3 className="text-2xl font-bold m-0">{formatCurrency(expense)}</h3>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-indigo-500/10 text-indigo-500">
          <DollarSign />
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">Balance Total</p>
          <h3 className="text-2xl font-bold m-0">{formatCurrency(balance)}</h3>
        </div>
      </div>
    </div>
  );
}

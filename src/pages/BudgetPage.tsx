import { useState, useEffect } from 'react';
import { Save, Target, TrendingDown, TrendingUp, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Budget } from '../types';
import { saveBudget, getBudgetByMonth } from '../utils/database';

export function BudgetPage() {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [plannedIncome, setPlannedIncome] = useState<number>(0);
  const [plannedExpense, setPlannedExpense] = useState<number>(0);
  const [budgetData, setBudgetData] = useState<Budget | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadBudget(selectedMonth);
  }, [selectedMonth]);

  const loadBudget = async (month: string) => {
    try {
      const budget = await getBudgetByMonth(month);
      if (budget) {
        setPlannedIncome(budget.plannedIncome);
        setPlannedExpense(budget.plannedExpense);
        setBudgetData(budget);
      } else {
        setPlannedIncome(0);
        setPlannedExpense(0);
        setBudgetData(null);
      }
    } catch (error) {
      console.error("Error cargando el presupuesto:", error);
    }
  };

  const handlePrevMonth = () => {
    const date = new Date(selectedMonth + '-01T00:00:00');
    date.setMonth(date.getMonth() - 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const date = new Date(selectedMonth + '-01T00:00:00');
    date.setMonth(date.getMonth() + 1);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const formattedMonth = new Date(selectedMonth + '-01T00:00:00').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const displayMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget: Budget = {
      ...budgetData,
      month: selectedMonth,
      plannedIncome,
      plannedExpense
    };

    try {
      await saveBudget(newBudget);
      setBudgetData(newBudget);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Error guardando el presupuesto:", error);
      alert("Hubo un error al guardar el presupuesto.");
    }
  };

  return (
    <div className="max-w-[800px] mx-auto animate-[fadeIn_0.4s_ease-out_forwards]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-heading mb-2 text-white">Configuración de Presupuesto</h2>
        <p className="text-slate-400">Establece tus metas de ingresos y gastos para el mes seleccionado.</p>
      </div>

      <div className="flex flex-col gap-8">
        <form onSubmit={handleSave} className="bg-slate-800/70 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-md">
          <div className="mb-6">
            <label className="text-center block mb-3 font-medium text-slate-400 flex items-center justify-center gap-2">
              <Target size={18} />
              Mes del Presupuesto
            </label>
            <div className="flex items-center justify-center gap-6 bg-slate-700/50 rounded-2xl p-2 border border-slate-600">
              <button type="button" className="bg-slate-800 text-slate-50 border border-white/5 shadow-sm p-2 rounded-full cursor-pointer transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:-translate-y-0.5" onClick={handlePrevMonth}>
                <ChevronLeft size={24} />
              </button>
              
              <div className="flex items-center justify-center min-w-[200px] cursor-pointer p-2 px-4 rounded-xl transition-all duration-300 hover:bg-white/5 relative" onClick={() => document.getElementById('hidden-month-input')?.showPicker?.()}>
                <CalendarDays size={20} className="mr-2 text-indigo-500" />
                <span className="text-xl font-heading m-0">{displayMonth}</span>
                <input
                  type="month"
                  id="hidden-month-input"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ opacity: 0, position: 'absolute', pointerEvents: 'none', width: 0, height: 0 }}
                  required
                />
              </div>

              <button type="button" className="bg-slate-800 text-slate-50 border border-white/5 shadow-sm p-2 rounded-full cursor-pointer transition-all duration-300 hover:bg-indigo-500 hover:text-white hover:-translate-y-0.5" onClick={handleNextMonth}>
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label htmlFor="planned-income" className="block mb-2 text-emerald-500 font-medium flex items-center gap-2">
                <TrendingUp size={18} />
                Ingresos Esperados
              </label>
              <div className="flex items-center">
                <span className="bg-slate-700 border border-slate-600 border-r-0 py-3 px-4 rounded-l-xl text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  id="planned-income"
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-r-xl text-emerald-500 font-bold font-sans transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20 text-[0.95rem]"
                  value={plannedIncome || ''}
                  onChange={(e) => setPlannedIncome(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="planned-expense" className="block mb-2 text-red-500 font-medium flex items-center gap-2">
                <TrendingDown size={18} />
                Gastos Esperados
              </label>
              <div className="flex items-center">
                <span className="bg-slate-700 border border-slate-600 border-r-0 py-3 px-4 rounded-l-xl text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  id="planned-expense"
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-r-xl text-red-500 font-bold font-sans transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20 text-[0.95rem]"
                  value={plannedExpense || ''}
                  onChange={(e) => setPlannedExpense(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold font-sans cursor-pointer transition-all duration-300 border-none text-[0.95rem] bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)] hover:-translate-y-0.5">
            <Save size={20} />
            Guardar Presupuesto
          </button>

          {isSaved && (
            <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500 mt-4 p-3 text-center rounded-lg animate-[fadeIn_0.4s_ease-out_forwards]">
              ¡Presupuesto guardado exitosamente!
            </div>
          )}
        </form>

        <div className="bg-slate-800/70 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-md mt-4">
          <h3 className="text-xl font-heading mb-4">Resumen de {displayMonth}</h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Ingresos:</span>
              <span className="text-emerald-500 font-bold text-xl m-0">${plannedIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Gastos:</span>
              <span className="text-red-500 font-bold text-xl m-0">${plannedExpense.toFixed(2)}</span>
            </div>
            <hr className="my-2 border-slate-700" />
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Balance Esperado:</span>
              <span className={`font-bold text-2xl m-0 ${plannedIncome - plannedExpense >= 0 ? 'text-indigo-500' : 'text-red-500'}`}>
                ${(plannedIncome - plannedExpense).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

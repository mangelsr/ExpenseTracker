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
    <div className="budget-page fade-in">
      <div className="budget-header">
        <h2>Configuración de Presupuesto</h2>
        <p>Establece tus metas de ingresos y gastos para el mes seleccionado.</p>
      </div>

      <div className="budget-container">
        <form onSubmit={handleSave} className="budget-form glass-card">
          <div className="form-group mb-4">
            <label className="form-label text-center d-block mb-3">
              <Target size={18} className="mr-2" />
              Mes del Presupuesto
            </label>
            <div className="custom-month-selector">
              <button type="button" className="btn-icon month-nav-btn" onClick={handlePrevMonth}>
                <ChevronLeft size={24} />
              </button>
              
              <div className="month-display" onClick={() => document.getElementById('hidden-month-input')?.showPicker?.()}>
                <CalendarDays size={20} className="mr-2 text-accent" />
                <span className="h4 mb-0">{displayMonth}</span>
                <input
                  type="month"
                  id="hidden-month-input"
                  className="hidden-month-input"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ opacity: 0, position: 'absolute', pointerEvents: 'none', width: 0, height: 0 }}
                  required
                />
              </div>

              <button type="button" className="btn-icon month-nav-btn" onClick={handleNextMonth}>
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="budget-inputs-grid">
            <div className="form-group">
              <label htmlFor="planned-income" className="form-label text-success">
                <TrendingUp size={18} className="mr-2" />
                Ingresos Esperados
              </label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  id="planned-income"
                  className="form-control text-success font-weight-bold"
                  value={plannedIncome || ''}
                  onChange={(e) => setPlannedIncome(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="planned-expense" className="form-label text-danger">
                <TrendingDown size={18} className="mr-2" />
                Gastos Esperados
              </label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  id="planned-expense"
                  className="form-control text-danger font-weight-bold"
                  value={plannedExpense || ''}
                  onChange={(e) => setPlannedExpense(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 flex-center mt-4 p-3">
            <Save size={20} className="mr-2" />
            Guardar Presupuesto
          </button>

          {isSaved && (
            <div className="alert-success mt-3 p-2 text-center rounded fade-in">
              ¡Presupuesto guardado exitosamente!
            </div>
          )}
        </form>

        <div className="budget-summary glass-card mt-4">
          <h3 className="mb-3">Resumen de {displayMonth}</h3>
          <div className="summary-details">
            <div className="detail-item">
              <span className="text-muted">Total Ingresos:</span>
              <span className="text-success font-weight-bold h4 mb-0">${plannedIncome.toFixed(2)}</span>
            </div>
            <div className="detail-item mt-3">
              <span className="text-muted">Total Gastos:</span>
              <span className="text-danger font-weight-bold h4 mb-0">${plannedExpense.toFixed(2)}</span>
            </div>
            <hr className="my-3 border-secondary" />
            <div className="detail-item">
              <span className="text-muted">Balance Esperado:</span>
              <span className={`font-weight-bold h3 mb-0 ${plannedIncome - plannedExpense >= 0 ? 'text-primary' : 'text-danger'}`}>
                ${(plannedIncome - plannedExpense).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { getAllTransactions, addTransaction, deleteTransaction, clearAllTransactions } from '../utils/database';
import { exportToCSV } from '../utils/export';
import { ExpenseForm } from '../components/ExpenseForm';
import { SummaryCards } from '../components/SummaryCards';
import { TransactionTable } from '../components/TransactionTable';
import { ImportDropzone } from '../components/ImportDropzone';
import { CategoryChart } from '../components/CategoryChart';
import { Transaction } from '../types';

export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAllTransactions();
      // Sort by date descending
      setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error("Error al cargar datos", error);
    }
  };

  const handleAddTransaction = async (transaction: Transaction) => {
    await addTransaction(transaction);
    await loadData();
  };

  const handleDeleteTransaction = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta transacción?")) {
      await deleteTransaction(id);
      await loadData();
    }
  };

  const handleImportConfirm = async (newTransactions: Transaction[]) => {
    for (const transaction of newTransactions) {
      await addTransaction(transaction);
    }
    await loadData();
    alert(`${newTransactions.length} transacciones importadas con éxito`);
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    exportToCSV(transactions);
  };

  const handleClearAll = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.")) {
      await clearAllTransactions();
      await loadData();
    }
  };

  return (
    <div className="dashboard-grid">
      <div className="sidebar-col">
        <ExpenseForm onAddTransaction={handleAddTransaction} />
      </div>
      
      <div className="main-col">
        <SummaryCards transactions={transactions} />
        
        <div className="charts-import-grid">
          <CategoryChart transactions={transactions} />
          <div className="import-export-section">
            <ImportDropzone onImportConfirm={handleImportConfirm} />
            <div className="action-buttons mt-4">
              <button className="btn btn-outline-primary w-100 mb-2 flex-center" onClick={handleExport}>
                <Download size={18} className="mr-2" /> Exportar a CSV
              </button>
              <button className="btn btn-outline-danger w-100 flex-center" onClick={handleClearAll}>
                <Trash2 size={18} className="mr-2" /> Limpiar datos
              </button>
            </div>
          </div>
        </div>

        <TransactionTable 
          transactions={transactions} 
          onDelete={handleDeleteTransaction} 
        />
      </div>
    </div>
  );
}

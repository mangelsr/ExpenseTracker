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
    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 items-start">
      <div className="sticky top-4">
        <ExpenseForm onAddTransaction={handleAddTransaction} />
      </div>
      
      <div className="flex flex-col gap-8">
        <SummaryCards transactions={transactions} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CategoryChart transactions={transactions} />
          <div className="flex flex-col h-full">
            <ImportDropzone onImportConfirm={handleImportConfirm} />
            <div className="flex gap-4 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold font-sans cursor-pointer transition-all duration-300 border border-indigo-500 bg-transparent text-indigo-500 hover:bg-indigo-500 hover:text-white" onClick={handleExport}>
                <Download size={18} /> Exportar a CSV
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold font-sans cursor-pointer transition-all duration-300 border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white" onClick={handleClearAll}>
                <Trash2 size={18} /> Limpiar datos
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

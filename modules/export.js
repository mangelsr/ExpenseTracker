// Exportar a CSV
function exportToCSV(transactions) {
  let csvContent = "date,description,amount,category,type\n";

  transactions.forEach((transaction) => {
    csvContent += `${transaction.date},${transaction.description},${transaction.amount},${transaction.category},${transaction.type}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "gastos.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

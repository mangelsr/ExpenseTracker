let categoryChart; // Gráfico de categorías

// Actualizar gráfico de categorías
function updateCategoryChart(transactions) {
  // Filtrar solo gastos
  const expenses = transactions.filter((t) => t.type === "gasto");

  // Agrupar por categoría
  const categories = {};
  expenses.forEach((expense) => {
    if (!categories[expense.category]) {
      categories[expense.category] = 0;
    }
    categories[expense.category] += parseFloat(expense.amount);
  });

  // Preparar datos para el gráfico
  const labels = Object.keys(categories);
  const data = Object.values(categories);

  // Colores para las categorías
  const backgroundColors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6384",
    "#C9CBCF",
    "#7CFC00",
    "#20B2AA",
  ];

  // Destruir gráfico existente si hay uno
  if (categoryChart) {
    categoryChart.destroy();
  }

  // Crear nuevo gráfico
  const ctx = document.getElementById("categoryChart").getContext("2d");
  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 12,
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

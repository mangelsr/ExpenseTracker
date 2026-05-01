import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Transaction } from "../types";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#f43f5e", // Rose
  "#64748b", // Slate
];

interface CategoryChartProps {
  transactions: Transaction[];
}

export function CategoryChart({ transactions }: CategoryChartProps) {
  const expenses = transactions.filter((t) => t.type === "gasto");

  const categoryTotals = expenses.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const labels = Object.keys(categoryTotals);
  const dataValues = Object.values(categoryTotals);

  const data = {
    labels: labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: COLORS.slice(0, labels.length),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#cbd5e1", // Assuming dark mode slate text
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat("es-US", {
                style: "currency",
                currency: "USD",
              }).format(context.parsed);
            }
            return label;
          },
        },
      },
    },
    cutout: "70%",
  };

  return (
    <div className="card chart-card">
      <div className="card-header">
        <h2>Distribución de Gastos</h2>
      </div>
      <div className="card-body chart-container">
        {expenses.length === 0 ? (
          <div className="empty-state">No hay gastos para mostrar.</div>
        ) : (
          <div style={{ height: "300px", width: "100%" }}>
            <Doughnut data={data} options={options} />
          </div>
        )}
      </div>
    </div>
  );
}

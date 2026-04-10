import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { StockHistoryPoint } from "../store/stocksSlice";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface Props {
  symbol: string;
  data: StockHistoryPoint[];
}

export function StockHistoryChart({ symbol, data }: Props) {
 data = data.slice().reverse();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };
  const chartData = {
    labels: data.map((p) => p.date),
    datasets: [
      {
        label: `${symbol} (open)`,
        data: data.map((p) => p.open),
        borderColor: "#0dcaf0",
        backgroundColor: "#0dcaf080"
      },
    ],
  };

  return (
    <div className="mb-4 position-relative canvas-block">
      <Line options={options} data={chartData} />
    </div>
  );
}

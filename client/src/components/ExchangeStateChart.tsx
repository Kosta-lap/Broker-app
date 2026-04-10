import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { useAppSelector } from "../store";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

function colorForIndex(index: number) {
  const hue = (index * 25) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export function ExchangeStateChart() {
  const { timeline } = useAppSelector((s) => s.exchange);

  if (!timeline.length) {
    return <p className="text-muted">Данные пока не получены. Нажмите «Начало торгов».</p>;
  }

  // X — даты из имитации
  const labels = timeline.map((t) => t.date);

  // множество всех тикеров, которые встречались
  const symbolSet = new Set<string>();
  timeline.forEach((tick) => {
    tick.prices.forEach((p) => symbolSet.add(p.symbol));
  });
  const symbols = Array.from(symbolSet);

  const datasets = symbols.map((sym, idx) => {
    const color = colorForIndex(idx);

    const data = timeline.map((tick) => {
      const found = tick.prices.find((p) => p.symbol === sym);
      if (!found) return null;

      const num = Number(found.price);
      return Number.isFinite(num) ? num : null;
    });

    return {
      label: sym,
      data,
      fill: false,
      tension: 0.2,
      borderColor: color,
      backgroundColor: color,
      pointRadius: 3,
      pointHoverRadius: 5,
    };
  });

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: "Динамика цен активных акций в процессе имитации",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="position-relative canvas-block">
      <Line data={data} options={options} />
    </div>
  );
}

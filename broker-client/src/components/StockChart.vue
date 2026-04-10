<template>
    <Line :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
    Chart,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps<{
    symbol: string;
    points: { date: string; price: number }[];
}>();

const chartData = computed(() => ({
    labels: props.points.map((p) => p.date),
    datasets: [
        {
            label: props.symbol,
            data: props.points.map((p) => p.price),

            borderWidth: 2,
            borderColor: "#0dcaf0",
            backgroundColor: "#0dcaf080",

            pointRadius: 4,
            pointHoverRadius: 6,
            pointHitRadius: 8,
            fill: false,
        },
    ],
}));

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
};
</script>

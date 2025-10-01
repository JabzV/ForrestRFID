<template>
  <div class="w-full h-full">
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const props = defineProps({
  currentValue: {
    type: Number,
    required: true,
    default: 0,
  },
  previousValue: {
    type: Number,
    required: true,
    default: 0,
  },
  currentLabel: {
    type: String,
    default: "This Month",
  },
  previousLabel: {
    type: String,
    default: "Last Month",
  },
  changeType: {
    type: String,
    default: "positive",
    validator: (value) => ["positive", "negative"].includes(value),
  },
  formatAsDuration: {
    type: Boolean,
    default: false,
  },
});

// Compute chart data
const chartData = computed(() => {
  const currentColor = props.changeType === "positive" ? "#10b981" : "#f59e0b"; // green-500 or amber-500
  const previousColor = "#e5e7eb"; // gray-200

  return {
    labels: [props.previousLabel, props.currentLabel],
    datasets: [
      {
        label: "Value",
        data: [props.previousValue, props.currentValue],
        backgroundColor: [previousColor, currentColor],
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };
});

// Chart options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 8,
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      displayColors: false,
      callbacks: {
        label: function (context) {
          const value = context.parsed.y;
          if (props.formatAsDuration) {
            const hours = Math.floor(value / 60);
            const mins = Math.round(value % 60);
            return `${hours}h ${mins}m`;
          }
          return value.toString();
        },
      },
    },
  },
  scales: {
    x: {
      display: false,
      grid: {
        display: false,
      },
    },
    y: {
      display: false,
      grid: {
        display: false,
      },
      beginAtZero: true,
    },
  },
}));
</script>

<style scoped>
/* Ensure the chart container maintains proper sizing */
</style>

<template>
  <div class="w-full h-full">
    <Line v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => [],
  },
  label: {
    type: String,
    default: "Data",
  },
  color: {
    type: String,
    default: "#3b82f6", // blue-500
  },
  changeType: {
    type: String,
    default: "positive",
    validator: (value) => ["positive", "negative"].includes(value),
  },
});

// Compute chart data
const chartData = computed(() => {
  console.log("📊 MiniLineChart received data:", props.data);

  if (!props.data || props.data.length === 0) {
    console.log("⚠️ No data available for chart");
    return null;
  }

  const labels = props.data.map((item) => {
    if (item.date) {
      const date = new Date(item.date);
      // Check if this is hourly data (for today's metrics)
      if (item.hour || (item.date && item.date.includes(":"))) {
        // Format as hour (e.g., "9 AM", "2 PM")
        const hour = date.getHours();
        return hour === 0
          ? "12 AM"
          : hour === 12
          ? "12 PM"
          : hour > 12
          ? `${hour - 12} PM`
          : `${hour} AM`;
      }
      // Format as month name for yearly data
      return date.toLocaleDateString("en-US", { month: "short" });
    }
    return "";
  });

  const values = props.data.map((item) => {
    // Handle different data structures
    if (item.count !== undefined) return item.count;
    if (item.avg_duration !== undefined) return item.avg_duration;
    if (item.value !== undefined) return item.value;
    return 0;
  });

  const lineColor = props.changeType === "positive" ? "#10b981" : "#f59e0b"; // green-500 or amber-500
  const backgroundColor =
    props.changeType === "positive"
      ? "rgba(16, 185, 129, 0.1)"
      : "rgba(245, 158, 11, 0.1)";

  return {
    labels,
    datasets: [
      {
        label: props.label,
        data: values,
        borderColor: lineColor,
        backgroundColor: backgroundColor,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
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
      mode: "index",
      intersect: false,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 8,
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      displayColors: false,
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          const value = context.parsed.y;
          // Format based on data type
          if (props.data[0]?.avg_duration !== undefined) {
            // Duration formatting
            const hours = Math.floor(value / 60);
            const mins = Math.round(value % 60);
            label += `${hours}h ${mins}m`;
          } else if (props.data[0]?.value !== undefined) {
            // Revenue formatting
            label += `₱${value.toFixed(2)}`;
          } else {
            label += value;
          }
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        color: "#9ca3af",
        font: {
          size: 9,
        },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
      },
    },
    y: {
      display: true,
      grid: {
        color: "rgba(156, 163, 175, 0.1)",
      },
      ticks: {
        color: "#9ca3af",
        font: {
          size: 9,
        },
        callback: function (value) {
          // Format based on data type
          if (props.data[0]?.avg_duration !== undefined) {
            // Duration - show hours
            const hours = Math.floor(value / 60);
            return hours + "h";
          } else if (props.data[0]?.value !== undefined) {
            // Revenue - show currency
            return (
              "₱" +
              (value >= 1000
                ? (value / 1000).toFixed(0) + "K"
                : value.toFixed(0))
            );
          }
          return value;
        },
      },
      beginAtZero: true,
    },
  },
  interaction: {
    mode: "nearest",
    axis: "x",
    intersect: false,
  },
}));
</script>

<style scoped>
/* Ensure the chart container maintains proper sizing */
</style>

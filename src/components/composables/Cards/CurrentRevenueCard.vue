<template>
  <div
    class="bg-[#fdfeff] border border-gray-300 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 xl:p-6 h-72 md:h-80 lg:h-96"
  >
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="mb-3 md:mb-4 lg:mb-6">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-lg md:text-xl lg:text-lg font-bold text-gray-500">
            {{ title.toUpperCase() }}
          </h2>
          <!-- Dropdown -->
          <select
            v-model="selectedPeriod"
            class="text-xs border border-gray-300 rounded-lg px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium min-w-[100px]"
          >
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
        <div class="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
          {{ displayRevenue.value }}
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <div class="flex items-center gap-1">
            <div
              class="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center"
              :class="getChangeIconClass(displayRevenue.changeType)"
            >
              <i
                class="text-xs"
                :class="getChangeIcon(displayRevenue.changeType)"
              ></i>
            </div>
            <span
              class="text-xs font-bold"
              :class="getChangeTextClass(displayRevenue.changeType)"
            >
              {{ displayRevenue.change }}
            </span>
          </div>
          <p class="text-gray-600 text-xs font-medium">
            {{ displayRevenue.description }}
          </p>
        </div>
      </div>

      <!-- Chart Area -->
      <div class="flex-1 flex flex-col justify-end min-h-0">
        <!-- Chart Container -->
        <div class="relative h-full w-full min-h-[120px]">
          <Line v-if="chartData" :data="chartData" :options="chartOptions" />
          <div
            v-else
            class="flex items-center justify-center h-full text-gray-400"
          >
            <div class="text-center">
              <i class="pi pi-chart-line text-2xl mb-1"></i>
              <p class="text-xs">No data available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
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
  title: {
    type: String,
    required: true,
  },
  revenue: {
    type: Object,
    required: true,
  },
});

const selectedPeriod = ref("month");

// Compute the display revenue based on selected period
const displayRevenue = computed(() => {
  if (selectedPeriod.value === "year") {
    return (
      props.revenue.year || {
        value: "₱0.00",
        change: "0%",
        changeType: "positive",
        description: "Compared to last year",
        chartData: [],
      }
    );
  }
  return (
    props.revenue.month ||
    props.revenue || {
      value: "₱0.00",
      change: "0%",
      changeType: "positive",
      description: "Compared to last month",
      chartData: [],
    }
  );
});

// Compute chart data for line chart
const chartData = computed(() => {
  if (
    !displayRevenue.value.chartData ||
    displayRevenue.value.chartData.length === 0
  ) {
    return null;
  }

  const data = displayRevenue.value.chartData;
  const isYearly = selectedPeriod.value === "year";

  // Format labels based on period
  const labels = data.map((item, index) => {
    const date = new Date(item.date);
    if (isYearly) {
      // Show month names for yearly view
      return date.toLocaleDateString("en-US", { month: "short" });
    } else {
      // Show day number for monthly view, but hide most to avoid clutter
      const day = date.getDate();
      // Show every 5th day
      if (day % 5 === 0 || day === 1) {
        return day.toString();
      }
      return "";
    }
  });

  const lineColor =
    displayRevenue.value.changeType === "positive" ? "#10b981" : "#f59e0b";
  const backgroundColor =
    displayRevenue.value.changeType === "positive"
      ? "rgba(16, 185, 129, 0.1)"
      : "rgba(245, 158, 11, 0.1)";

  return {
    labels,
    datasets: [
      {
        label: isYearly ? "Monthly Revenue" : "Daily Revenue",
        data: data.map((item) => item.value),
        borderColor: lineColor,
        backgroundColor: backgroundColor,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: lineColor,
        pointHoverBackgroundColor: lineColor,
        pointBorderColor: "#fff",
        pointHoverBorderColor: "#fff",
        pointBorderWidth: 2,
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
      padding: 10,
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      callbacks: {
        label: function (context) {
          return `Revenue: ₱${context.parsed.y.toFixed(2)}`;
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
          size: 10,
        },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 10,
      },
      title: {
        display: true,
        text: selectedPeriod.value === "year" ? "Months" : "Days",
        color: "#6b7280",
        font: {
          size: 11,
          weight: "600",
        },
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
          size: 10,
        },
        callback: function (value) {
          return "₱" + value.toFixed(0);
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

// Helper functions for styling
const getChangeIconClass = (changeType) => {
  return changeType === "positive" ? "bg-green-100" : "bg-orange-100";
};

const getChangeIcon = (changeType) => {
  return changeType === "positive"
    ? "pi pi-arrow-up text-green-600"
    : "pi pi-arrow-down text-orange-600";
};

const getChangeTextClass = (changeType) => {
  return changeType === "positive" ? "text-green-600" : "text-orange-600";
};
</script>

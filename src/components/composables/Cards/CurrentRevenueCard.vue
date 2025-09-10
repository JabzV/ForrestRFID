<template>
  <div class="bg-[#fdfeff] border border-gray-300 rounded-2xl p-5 h-130">
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-gray-800 mb-2">{{ title }}</h2>
        <div class="text-3xl font-bold text-gray-900">{{ revenue.value }}</div>
        <p class="text-gray-500 text-sm mt-1">{{ revenue.description }}</p>
      </div>

      <!-- Chart Area -->
      <div class="flex-1 flex flex-col justify-end">
        <!-- Chart Container -->
        <div class="relative h-24 w-full flex items-center justify-center">
          <!-- Graph Placeholder -->
          <div class="text-center text-gray-400">
            <i class="pi pi-chart-line text-2xl mb-1"></i>
            <p class="text-xs">Graph</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  revenue: {
    type: Object,
    required: true,
  },
});
</script>

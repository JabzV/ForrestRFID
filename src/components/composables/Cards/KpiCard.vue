<template>
  <div
    class="bg-[#fdfeff] border border-gray-300 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 xl:p-6"
    :class="heightClass"
  >
    <div class="flex flex-col md:flex-row h-full gap-3 md:gap-4 lg:gap-6">
      <!-- Left KPI Section -->
      <div class="flex-1 flex gap-2 md:gap-3 lg:gap-4">
        <div class="flex-1 flex flex-col justify-center">
          <h3
            class="text-gray-600 text-xs font-semibold mb-1.5 md:mb-2 tracking-wider uppercase"
          >
            {{ leftKpi.title }}
          </h3>
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <div
              class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900"
            >
              {{ leftKpi.value }}
            </div>
            <div class="flex items-center gap-1">
              <div
                class="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
                :class="getChangeIconClass(leftKpi.changeType)"
              >
                <i
                  class="text-xs md:text-sm"
                  :class="getChangeIcon(leftKpi.changeType)"
                ></i>
              </div>
              <span
                class="text-xs font-bold"
                :class="getChangeTextClass(leftKpi.changeType)"
                >{{ leftKpi.change }}</span
              >
            </div>
          </div>
          <p class="text-gray-500 text-xs">
            {{ leftKpi.description }}
          </p>
        </div>
        <div
          v-if="showGraphs"
          class="flex-1 flex items-center justify-center min-h-[100px] md:min-h-0"
        >
          <slot name="left-graph">
            <div class="text-center text-gray-400">
              <i class="pi pi-chart-line text-2xl mb-1"></i>
              <p class="text-xs">Graph</p>
            </div>
          </slot>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-full md:w-px h-px md:h-auto bg-gray-200"></div>

      <!-- Right KPI Section -->
      <div class="flex-1 flex gap-2 md:gap-3 lg:gap-4">
        <div class="flex-1 flex flex-col justify-center">
          <h3
            class="text-gray-600 text-xs font-semibold mb-1.5 md:mb-2 tracking-wider uppercase"
          >
            {{ rightKpi.title }}
          </h3>
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <div
              class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900"
            >
              {{ rightKpi.value }}
            </div>
            <div class="flex items-center gap-1">
              <div
                class="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center"
                :class="getChangeIconClass(rightKpi.changeType)"
              >
                <i
                  class="text-xs md:text-sm"
                  :class="getChangeIcon(rightKpi.changeType)"
                ></i>
              </div>
              <span
                class="text-xs font-bold"
                :class="getChangeTextClass(rightKpi.changeType)"
                >{{ rightKpi.change }}</span
              >
            </div>
          </div>
          <p class="text-gray-500 text-xs">
            {{ rightKpi.description }}
          </p>
        </div>
        <div
          v-if="showGraphs"
          class="flex-1 flex items-center justify-center min-h-[100px] md:min-h-0"
        >
          <slot name="right-graph">
            <div class="text-center text-gray-400">
              <i class="pi pi-chart-line text-2xl mb-1"></i>
              <p class="text-xs">Graph</p>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  leftKpi: {
    type: Object,
    required: true,
  },
  rightKpi: {
    type: Object,
    required: true,
  },
  showGraphs: {
    type: Boolean,
    default: true,
  },
  height: {
    type: String,
    default: "fixed",
  },
});

// Computed properties
const heightClass = computed(() => {
  return props.height === "auto"
    ? "h-auto min-h-[180px] md:min-h-0"
    : "h-auto md:h-56 lg:h-64";
});

// Helper functions for dynamic styling
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

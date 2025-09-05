<template>
  <div class="bg-[#fdfeff] border border-gray-300 rounded-2xl p-5" :class="heightClass">
    <div class="flex h-full gap-6">
      <!-- Left KPI Section -->
      <div class="flex-1 flex gap-4">
        <div class="flex-1 flex flex-col justify-center">
          <h3 class="text-gray-700 text-sm font-semibold mb-3 tracking-wide">{{ leftKpi.title }}</h3>
          <div class="flex items-center gap-3 mb-4">
            <div class="text-2xl font-bold text-gray-900 tracking-tight">{{ leftKpi.value }}</div>
            <div class="flex items-center gap-1">
              <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="getChangeIconClass(leftKpi.changeType)">
                <i class="text-sm" :class="getChangeIcon(leftKpi.changeType)"></i>
              </div>
              <span class="text-sm font-semibold" :class="getChangeTextClass(leftKpi.changeType)">{{ leftKpi.change }}</span>
            </div>
          </div>
          <p class="text-gray-500 text-xs leading-relaxed">{{ leftKpi.description }}</p>
        </div>
        <div v-if="showGraphs" class="flex-1 flex items-center justify-center">
          <slot name="left-graph">
            <div class="text-center text-gray-400">
              <i class="pi pi-chart-line text-2xl mb-1"></i>
              <p class="text-xs">Graph</p>
            </div>
          </slot>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-px bg-gray-200"></div>

      <!-- Right KPI Section -->
      <div class="flex-1 flex gap-4">
        <div class="flex-1 flex flex-col justify-center">
          <h3 class="text-gray-700 text-sm font-semibold mb-3 tracking-wide">{{ rightKpi.title }}</h3>
          <div class="flex items-center gap-3 mb-4">
            <div class="text-2xl font-bold text-gray-900 tracking-tight">{{ rightKpi.value }}</div>
            <div class="flex items-center gap-1">
              <div class="w-6 h-6 rounded-full flex items-center justify-center" :class="getChangeIconClass(rightKpi.changeType)">
                <i class="text-sm" :class="getChangeIcon(rightKpi.changeType)"></i>
              </div>
              <span class="text-sm font-semibold" :class="getChangeTextClass(rightKpi.changeType)">{{ rightKpi.change }}</span>
            </div>
          </div>
          <p class="text-gray-500 text-xs leading-relaxed">{{ rightKpi.description }}</p>
        </div>
        <div v-if="showGraphs" class="flex-1 flex items-center justify-center">
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
import { computed } from 'vue';

const props = defineProps({
  leftKpi: {
    type: Object,
    required: true
  },
  rightKpi: {
    type: Object,
    required: true
  },
  showGraphs: {
    type: Boolean,
    default: true
  },
  height: {
    type: String,
    default: 'fixed'
  }
});

// Computed properties
const heightClass = computed(() => {
  return props.height === 'auto' ? 'h-auto' : 'h-48';
});

// Helper functions for dynamic styling
const getChangeIconClass = (changeType) => {
  return changeType === 'positive' ? 'bg-green-100' : 'bg-orange-100';
};

const getChangeIcon = (changeType) => {
  return changeType === 'positive' 
    ? 'pi pi-arrow-up text-green-600' 
    : 'pi pi-arrow-down text-orange-600';
};

const getChangeTextClass = (changeType) => {
  return changeType === 'positive' ? 'text-green-600' : 'text-orange-600';
};
</script>

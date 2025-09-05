<template>
  <div>
    <div
      v-if="latestActivity"
      class="p-3 w-full"
    >
      <!-- Simple flex layout with fixed widths for perfect alignment -->
      <div class="flex items-center gap-2 justify-between h-full w-full overflow-hidden">
        <!-- User info section -->
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0"
            :class="latestActivity.name === 'Non-Member' ? 'bg-orange-500' : 'bg-primary1/80'"
          >
            {{ getInitials(latestActivity.name) }}
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="font-medium text-gray-800 text-base truncate">{{ latestActivity.name }}</h4>
            <p class="text-sm text-gray-700 truncate">RFID: {{ latestActivity.rfid }}</p>
          </div>
        </div>

        <!-- Time and Action section -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <div class="w-24 text-right">
            <p class="text-sm font-medium text-gray-800">{{ latestActivity.time }}</p>
            <p class="text-xs text-gray-700">{{ latestActivity.action }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-4 text-gray-500">
      <i class="pi pi-clock text-2xl mb-2"></i>
      <p class="text-sm">No recent activity</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  }
});

// Get the latest activity (first item in the array)
const latestActivity = computed(() => {
  return props.activities.length > 0 ? props.activities[0] : null;
});

// Get user initials for avatar
const getInitials = (name) => {
  if (name === 'Non-Member') {
    return 'NM';
  }
  
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
</script>

<style scoped>
/* Custom styles if needed */
</style>

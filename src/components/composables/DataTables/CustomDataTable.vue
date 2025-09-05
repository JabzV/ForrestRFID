<template>
  <div
    class="bg-gray-100 rounded-xl px-5 py-2 mb-3 grid text-gray-700 text-sm"
    :class="`${gridColsClass} ${gapClass}`"
  >
    <span v-for="header in headers" :key="header" class="flex justify-center">{{
      header
    }}</span>
  </div>

  <div class="space-y-3">
    <slot />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  gapClass: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["edit", "delete"]);

const gridColsClass = computed(() => {
  const colCount = props.headers.length;
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
    8: "grid-cols-8",
    9: "grid-cols-9",
    10: "grid-cols-10",
    11: "grid-cols-11",
    12: "grid-cols-12",
  };
  return gridClasses[colCount] || "grid-cols-1";
});
</script>

<style scoped></style>

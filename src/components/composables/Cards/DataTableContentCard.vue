<template>
  <div class="border border-gray-300 rounded-2xl p-5">
    <div class="grid items-center" :class="`${gridColsClass} ${gapClass}`">
      <!-- Profile Name -->
      <div
        v-for="(item, key) in profileWithoutId"
        :key="key"
        class="flex flex-col"
      >
        <span
          v-if="key === 'rate_amount'"
          class="text-gray-800 font-medium flex justify-center"
          >{{ "₱" + item }}</span
        >
        <span
          v-else-if="key === 'benefits_type'"
          class="text-gray-800 font-medium flex justify-center"
        >
          {{ item === "fixed" ? "₱" : "%" }}
        </span>
        <span v-else class="text-gray-800 font-medium flex justify-center">{{
          item
        }}</span>
      </div>
      <!-- Actions -->
      <div class="flex justify-center gap-3 lg:gap-4">
        <IconButton
          icon="pi pi-pen-to-square"
          iconSize="1"
          iconColor="text-warning"
          buttonColor="bg-warning-light"
          containerSize="w-9 h-9"
          @click="$emit('edit', item)"
        />

        <IconButton
          icon="pi pi-trash"
          iconSize="1"
          iconColor="text-danger"
          buttonColor="bg-danger-light"
          containerSize="w-9 h-9"
          @click="$emit('delete', item)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import IconButton from "@/components/shared/Clickables/IconButton.vue";
import { formatDate } from "@/services/utils";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  columnNumber: {
    type: Number,
    required: true,
  },
  gapClass: {
    type: String,
    required: true,
  },
});

const profileWithoutId = computed(() => {
  const filtered = Object.fromEntries(
    Object.entries(props.item).filter(
      ([key]) => key !== "id" && key !== "updated_at" && key !== "deleted_at"
    )
  );
  if (filtered.created_at) {
    filtered.created_at = formatDate(filtered.created_at);
  }
  return filtered;
});

const gridColsClass = computed(() => {
  const colCount = props.columnNumber;
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

defineEmits(["edit", "delete"]);
</script>

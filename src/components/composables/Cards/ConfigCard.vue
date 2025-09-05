<template>
  <div class="border border-gray-300 rounded-3xl p-7" :class="`${customClass}`">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-4">
      <div class="flex items-center gap-4">
        <i :class="iconClass" class="text-xl text-success"></i>
        <h3 class="text-gray-800 text-xl font-semibold">{{ title }}</h3>
      </div>
      <button
        v-if="showAddButton"
        class="ml-auto bg-primary1 text-white px-5 py-2 rounded-2xl text-sm font-medium hover:bg-primary1/90 transition-colors cursor-pointer"
        @click="$emit('add')"
      >
        {{ addButtonText }}
      </button>
    </div>

    <!-- Divider -->
    <hr class="border-gray-200 mb-4" />

    <!-- Content Slot -->
    <div class="flex-1">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  iconClass: {
    type: String,
    default: "pi pi-cog",
  },
  showAddButton: {
    type: Boolean,
    default: false,
  },
  addButtonText: {
    type: String,
    default: "Add Profile",
  },
  customClass: {
    type: String,
    default: "",
  },
});

defineEmits(["add"]);
</script>

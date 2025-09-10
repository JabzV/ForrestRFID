<template>
  <div
    class="border border-gray-300 rounded-3xl p-7 bg-white"
    :class="`${customClass}`"
  >
    <!-- Header -->
    <div class="flex items-center gap-4 mb-4">
      <div class="flex items-center gap-4">
        <i :class="iconClass" class="text-xl text-success"></i>
        <h3 class="text-gray-800 text-xl font-semibold">{{ title }}</h3>
      </div>
      <button
        v-if="showAddButton"
        class="ml-auto px-5 py-2 rounded-2xl text-sm font-medium"
        :class="`
          ${
            disableButton
              ? 'opacity-50'
              : 'cursor-pointer hover:contrast-80 hover:scale-105 transition-all duration-300'
          } ${bgColor} ${textColor}
        `"
        :disabled="disableButton"
        @click="$emit('add')"
      >
        {{ addButtonText }}
      </button>
    </div>

    <!-- Divider -->
    <hr class="border-gray-200 mb-4" />

    <!-- Content Slot -->
    <div class="flex-1 overflow-y-auto" :class="maxHeight">
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
  maxHeight: {
    type: String,
    default: "max-h-full",
  },
  disableButton: {
    type: Boolean,
    default: false,
  },
  bgColor: {
    type: String,
    default: "bg-primary1",
  },
  textColor: {
    type: String,
    default: "text-white",
  },
});

defineEmits(["add"]);
</script>

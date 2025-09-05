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
      <div class="ml-auto flex items-center gap-3">
        <input
          v-if="showInputField"
          v-model="inputValue"
          :placeholder="inputPlaceholder"
          :type="inputType"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary1 focus:border-transparent"
          @input="$emit('input-change', inputValue)"
        />
        <button
          v-if="showAddButton"
          class="bg-primary1 text-white px-5 py-2 rounded-2xl text-sm font-medium hover:bg-primary1/90 transition-colors cursor-pointer"
          @click="$emit('add')"
        >
          {{ addButtonText }}
        </button>
      </div>
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
import { ref } from 'vue';

const inputValue = ref('');

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
  showInputField: {
    type: Boolean,
    default: false,
  },
  inputPlaceholder: {
    type: String,
    default: "Enter value...",
  },
  inputType: {
    type: String,
    default: "text",
  },
  customClass: {
    type: String,
    default: "",
  },
  maxHeight: {
    type: String,
    default: "max-h-full",
  },
});

defineEmits(["add", "input-change"]);
</script>

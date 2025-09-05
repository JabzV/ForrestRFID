<template>
  <div class="p-6 text-center">
    <!-- Warning Icon -->
    <div class="mb-4">
      <i class="pi pi-exclamation-triangle text-4xl text-warning"></i>
    </div>

    <!-- Confirmation Text -->
    <h3 class="text-2xl font-semibold text-gray-800 mb-2">
      {{ title }}
    </h3>
    <p class="text-gray-600 mb-6">{{ message }}</p>

    <!-- Buttons -->
    <div class="flex gap-3 justify-center">
      <!-- Cancel Button -->
      <button
        type="button"
        class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        @click="$emit('cancel')"
      >
        Cancel
      </button>

      <!-- Proceed Button -->
      <button
        type="button"
        class="px-6 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors"
        @click="$emit('proceed')"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

defineEmits(["cancel", "proceed"]);
</script>

<style scoped></style>

<template>
  <div
    class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 h-18"
  >
    <!-- Left Section -->
    <div class="flex items-center gap-4">
      <IconButton icon="pi pi-arrow-left" size="1.3" @click="clickBackArrow" />
      <h1 class="text-2xl font-semibold text-gray-800">Dashboard</h1>
    </div>

    <!-- Right Section -->
    <div class="flex items-center gap-14">
      <!-- Action Buttons -->
      <div class="flex items-center gap-16">
        <IconButton icon="pi pi-cog" size="1.3" @click="clickCog" />
        <IconButton icon="pi pi-bell" size="1.2" @click="clickBell" />
      </div>

      <!-- Add Session Button -->
      <button
        type="button"
        class="bg-primary1 text-white px-8 py-3 rounded-full font-medium hover:bg-primary1/90 transition-colors"
        @click="addSession"
      >
        Add Session
      </button>
    </div>
  </div>
</template>

<script setup>
import IconButton from "../shared/IconButton.vue";

//functions
const clickCog = () => {
  console.log("cog clicked");
};

const clickBell = () => {
  console.log("bell clicked");
};

const clickBackArrow = () => {
  console.log("back arrow clicked");
};
</script>

<style scoped></style>

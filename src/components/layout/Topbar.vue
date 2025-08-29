<template>
  <div class="flex items-center justify-between px-6 py-4 bg-background h-18">
    <!-- Left Section -->
    <div class="flex items-center gap-4">
      <IconButton
        v-if="title !== 'Dashboard'"
        icon="pi pi-arrow-left"
        size="1.3"
        @click="clickBackArrowButton"
      />
      <h1 class="text-2xl font-semibold text-gray-800">{{ title }}</h1>
    </div>

    <!-- Right Section -->
    <div class="flex items-center gap-14">
      <!-- Action Buttons -->
      <div class="flex items-center gap-12">
        <IconButton icon="pi pi-cog" size="1.3" @click="clickCogButton" />
        <IconButton icon="pi pi-bell" size="1.2" @click="clickBellButton" />
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
import IconButton from "../shared/IconTextButton.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  title: String,
});

//Button functions
const clickCogButton = () => {
  console.log("cog clicked");
};

const clickBellButton = () => {
  console.log("bell clicked");
};

const clickBackArrowButton = () => {
  router.push("/");
};
</script>

<style scoped></style>

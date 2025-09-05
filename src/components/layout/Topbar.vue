<template>
  <div class="flex items-center justify-between px-6 py-4 bg-background h-18">
    <!-- Left Section -->
    <div class="flex items-center gap-2">
      <ClickableIcon
        v-if="title !== 'Dashboard'"
        icon="pi pi-arrow-left"
        iconSize="1.3"
        containerSize="h-10 w-10"
        @click="clickBackArrowButton"
      />
      <h1 class="text-2xl font-semibold text-gray-800">{{ title }}</h1>
    </div>

    <!-- Right Section -->
    <div class="flex items-center">
      <!-- Action Buttons -->
      <div class="flex items-center gap-10 pr-6">
        <ClickableIcon
          icon="pi pi-cog"
          iconSize="1.3"
          containerSize="h-10 w-10"
          :hoverEffect="true"
          @click="clickCogButton"
        />
        <ClickableIcon
          icon="pi pi-refresh"
          iconSize="1.2"
          containerSize="h-10 w-10"
          :hoverEffect="true"
          @click="clickRefreshButton"
        />
      </div>

      <!-- Add Session Button -->
      <button
        v-if="topbarButtonState.buttonLabel"
        type="button"
        class="bg-primary1 text-white px-8 py-3 rounded-full font-medium hover:bg-primary1/90 transition-all duration-200 hover:scale-102 active:scale-95 active:contrast-90 cursor-pointer"
        @click="clickTopbarButton"
      >
        {{ topbarButtonState.buttonLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import ClickableIcon from "../shared/Clickables/ClickableIcon.vue";
import { useRouter } from "vue-router";
import { onMounted } from "vue";
import { useTopbarButtonState } from "../../../store/vueStore/topbarButtonState";

const router = useRouter();
const topbarButtonState = useTopbarButtonState();

const props = defineProps({
  title: String,
});

//Button functions
const clickCogButton = () => {
  router.push("/settings");
};

const clickRefreshButton = () => {
  window.location.reload();
};

const clickBackArrowButton = () => {
  router.push("/");
};

const clickTopbarButton = () => {
  topbarButtonState.triggerButtonFunction();
};

onMounted(() => {
  setTimeout(() => {
    if (window.HSStaticMethods) {
      window.HSStaticMethods.autoInit();
    }
  }, 100);
});
</script>

<style scoped></style>

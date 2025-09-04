<template>
  <div class="flex flex-col items-center justify-center px-8 pb-4">
    <!-- Scanner Icon -->
    <div class="mb-4">
      <i class="pi pi-credit-card text-6xl text-primary1 animate-pulse"></i>
    </div>

    <!-- Scanning Text with Animated Dots -->
    <div class="flex items-center mb-4">
      <h1 class="text-2xl font-bold text-primary1 mr-2">SCANNING</h1>
      <div class="flex space-x-1">
        <span
          class="animate-bounce text-3xl font-bold text-primary1"
          style="animation-delay: 0s"
          >.</span
        >
        <span
          class="animate-bounce text-3xl font-bold text-primary1"
          style="animation-delay: 0.2s"
          >.</span
        >
        <span
          class="animate-bounce text-3xl font-bold text-primary1"
          style="animation-delay: 0.4s"
          >.</span
        >
      </div>
    </div>

    <!-- Countdown Timer -->
    <div class="mb-4">
      <!-- <div class="flex items-center justify-center gap-2 mb-2">
        <i class="pi pi-clock text-lg text-gray-600"></i>
        <span class="text-lg font-medium text-gray-700">
          {{ Math.ceil(remainingTime / 1000) }}s remaining
        </span>
      </div> -->
      <!-- Progress Bar -->
      <div class="w-64 bg-gray-200 rounded-full h-2">
        <div
          class="bg-primary1/80 h-2 rounded-full transition-all duration-1000 ease-linear"
          :style="{ width: `${(remainingTime / timeout) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Warning Subtext -->
    <div class="text-center mb-6 max-w-md">
      <div
        class="text-warning text-sm font-medium mb-1 flex items-center justify-center gap-1"
      >
        <i class="pi pi-exclamation-triangle"></i> Warning
      </div>
      <p class="text-gray-600 text-sm">
        Dont click or type anything during scanning!
        <br />Place the card on top of the scanner before the timer runs out.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  timeout: {
    type: Number,
    default: 30000, // 30 seconds default
  },
});

const emit = defineEmits(["timeout"]);

const remainingTime = ref(props.timeout);
let intervalId = null;

onMounted(() => {
  intervalId = setInterval(() => {
    remainingTime.value -= 1000;

    if (remainingTime.value <= 0) {
      clearInterval(intervalId);
      emit("timeout");
    }
  }, 1000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
/* Custom bounce animation with staggered delay */
@keyframes bounce-dots {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce-dots 1.4s infinite;
}
</style>

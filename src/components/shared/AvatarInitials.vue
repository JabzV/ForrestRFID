<template>
  <div class="flex-shrink-0">
    <div
      :class="`${size} rounded-full ${backgroundColor} flex items-center justify-center`"
    >
      <span :class="`text-white ${textSize} font-semibold leading-none`">{{
        initials
      }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  name: String,
  size: String,
  color: String,
  textSize: String,
  backgroundColor: String,
});

const initials = computed(() => {
  return props.name
    .split(" ")
    .map((n) => n[0])
    .join("");
});
</script>

<style scoped></style>

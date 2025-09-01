<template>
  <button
    class="rounded-[10px] border-none cursor-pointer flex items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-90 hover:contrast-90 active:contrast-70"
    :class="`${buttonColor}  ${containerSize}`"
    @click="onClick"
  >
    <i :class="`${icon} ${iconColor}`" :style="`font-size: ${iconSize}rem`"></i>
  </button>
</template>

<script setup>
const props = defineProps({
  icon: String,
  iconSize: String,
  iconColor: String,
  onClick: Function,
  buttonColor: String,
  containerSize: String,
});
</script>

<style scoped></style>

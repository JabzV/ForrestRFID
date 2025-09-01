<template>
  <button
    type="button"
    class="flex items-center justify-center text-black rounded-full cursor-pointer"
    @click="onClick"
    :class="`${containerSize} ${
      hoverEffect ? 'hover:bg-gray-200 hover: transition-all duration-200' : ''
    }`"
  >
    <i :class="`${icon}`" :style="`font-size: ${iconSize}rem`"></i>
  </button>
</template>

<script setup>
const props = defineProps({
  icon: String,
  iconSize: String,
  containerSize: String,
  onClick: Function,
  hoverEffect: Boolean,
});
</script>

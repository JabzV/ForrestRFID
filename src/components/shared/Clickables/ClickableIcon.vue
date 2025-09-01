<template>
  <button
    type="button"
    class="flex items-center justify-center text-black rounded-full cursor-pointer"
    :class="`${containerSize} ${
      hoverEffect ? 'hover:bg-gray-200 hover: transition-all duration-200' : ''
    }`"
    :data-hs-overlay="canHideOverlay ? '#hs-scale-animation-modal' : null"
    @click="props.onClick"
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
  canHideOverlay: Boolean,
});
</script>

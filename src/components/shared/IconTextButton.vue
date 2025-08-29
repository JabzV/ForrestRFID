<template>
  <button
    type="button"
    class="flex items-center justify-center w-8 h-8 text-black hover:text-gray-600 transition-colors"
    @click="props.onClick"
  >
    <i :class="`${icon}`" :style="`font-size: ${size}rem`"></i>
  </button>
</template>

<script setup>
const props = defineProps({
  icon: String,
  size: String,
  onClick: Function,
});
</script>

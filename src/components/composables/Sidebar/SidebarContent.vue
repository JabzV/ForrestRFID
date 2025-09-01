<template>
  <RouterLink
    :to="href"
    class="min-h-[36px] flex items-center gap-x-3.5 py-2 px-2.5 text-md text-gray-800 rounded-lg hover:bg-primary1/6 focus:outline-hidden focus:bg-primary1/25 transition-all duration-300"
    :class="{ 'bg-primary1/25': isActive }"
  >
    <i :class="`${icon}`" style="font-size: 1.2rem"></i>
    <span class="hs-overlay-minified:hidden text-lg">{{ label }}</span>
  </RouterLink>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  icon: String,
  label: String,
  href: String,
});

const route = useRoute();

const isActive = computed(() => {
  return route.path === props.href;
});
</script>

<style scoped></style>

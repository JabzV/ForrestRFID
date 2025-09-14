<template>
  <div
    class="flex flex-col gap-1 w-32"
    :class="`${textAlign} ${computedClass}`"
  >
    <h3
      class="m-0 leading-tight truncate"
      :class="`${headerColor} ${textSize} ${
        semibold ? 'font-semibold' : ''
      } ${setUniformwidth}`"
    >
      {{ header }}
    </h3>
    <p class="text-sm text-[#737373] m-0 leading-tight">
      {{ subtext }}
    </p>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  header: [String, Number],
  headerColor: {
    type: String,
    default: "text-black",
  },
  subtext: String,
  textSize: {
    type: String,
    default: "text-lg",
  },
  semibold: Boolean,
  textAlign: {
    type: String,
    default: "text-center",
  },
  setUniformwidth: {
    type: Boolean,
    default: true,
  },
});

const computedClass = computed(() => {
  if (props.setUniformwidth) {
    return `w-32`;
  } else {
    return `w-full`;
  }
});
</script>

<style scoped></style>

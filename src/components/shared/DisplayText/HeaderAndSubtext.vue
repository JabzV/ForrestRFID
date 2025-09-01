<template>
  <div class="flex flex-col gap-1 min-w-0" :class="textAlign">
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
const props = defineProps({
  header: String,
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
    default: "text-left",
  },
  setUniformwidth: {
    type: String,
    default: "w-full",
  },
});
</script>

<style scoped></style>

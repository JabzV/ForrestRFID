<template>
  <select
    class="px-4 h-10 block w-full border border-gray-300 rounded-xl sm:text-sm focus:border-none focus:ring-1 focus:ring-primary1 disabled:opacity-50 disabled:pointer-events-none outline-none"
    :class="customClass"
    :value="modelValue"
    @input="$emit('update:modelValue', smartConvert($event.target.value))"
  >
    <option disabled value="" class="text-lg">{{ placeholder }}</option>
    <option
      v-for="option in options"
      class="text-lg"
      :key="option.id ? option.id : option"
      :value="option.id ? option.id : option"
    >
      {{ option.name ? option.name : option }}
    </option>
  </select>
</template>

<script setup>
import { smartConvert } from "../../../services/utils";

const props = defineProps({
  placeholder: String,
  options: Array,
  modelValue: String,
  customClass: String,
  value: String,
});

defineEmits(["update:modelValue"]);
</script>

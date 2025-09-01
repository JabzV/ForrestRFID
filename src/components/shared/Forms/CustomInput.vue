<template>
  <div class="flex flex-col gap-1" :class="customClass">
    <label v-if="label" for="inputLabel" class="text-md pl-1">{{
      label
    }}</label>

    <CustomDropdown
      v-if="type === 'dropdown'"
      :options="options"
      :placeholder="placeholder"
      :modelValue="modelValue"
      :customClass="customInputClass"
      @update:modelValue="$emit('update:modelValue', $event)"
    />

    <input
      v-else
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="sm:py-5 px-4 h-10 block w-full border border-gray-300 rounded-xl sm:text-sm focus:border-none focus:ring-1 focus:ring-primary1 disabled:opacity-50 disabled:pointer-events-none outline-none"
      :class="customInputClass"
      :placeholder="placeholder"
      :pattern="pattern"
    />
  </div>
</template>

<script setup>
import CustomDropdown from "./CustomDropdown.vue";

const props = defineProps({
  placeholder: String,
  type: String,
  modelValue: String,
  customClass: String,
  customInputClass: String,
  label: String,
  pattern: String,
  options: Array,
});

defineEmits(["update:modelValue"]);
</script>

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
      :isRequired="isRequired"
    />

    <input
      v-else-if="type === 'date'"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      :placeholder="placeholder"
      onfocus="(this.type='date')"
      onblur="if(!this.value) this.type='text'"
      class="placeholder-gray-400 sm:py-5 px-4 h-10 block w-full text-black border border-gray-300 rounded-xl sm:text-sm focus:border-none focus:ring-1 focus:ring-primary1 disabled:opacity-50 disabled:pointer-events-none outline-none"
      :class="customInputClass"
      :pattern="pattern"
      :required="isRequired"
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
      :required="isRequired"
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
  isRequired: Boolean,
});

defineEmits(["update:modelValue"]);
</script>

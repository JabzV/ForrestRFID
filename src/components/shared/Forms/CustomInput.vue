<template>
  <form
    ref="formRef"
    class="overflow-y-auto grid grid-cols-1 lg:grid-cols-2"
    :class="customClass ? customClass : 'gap-4 p-4'"
  >
    <div
      v-for="item in dialogFields"
      :key="item.field"
      class="w-full flex flex-col gap-1"
      :class="item.divClass"
    >
      <label v-if="item.label" for="inputLabel" class="text-md pl-1">{{
        item.label
      }}</label>

      <CustomDropdown
        v-if="item.type === 'dropdown'"
        :options="item.options"
        :placeholder="item.placeholder"
        :modelValue="payload[item.field]"
        :customClass="item.customClass"
        :isRequired="item.isRequired"
        @update:modelValue="payload[item.field] = $event"
        :disabled="disabled"
      />

      <input
        v-else-if="item.type === 'date'"
        :value="payload[item.field]"
        type="text"
        :placeholder="item.placeholder"
        onfocus="(this.type='date')"
        onblur="if(!this.value) this.type='text'"
        class="placeholder-gray-400 sm:py-5 px-4 h-10 block w-full text-black border border-gray-300 rounded-xl sm:text-sm focus:border-none focus:ring-1 focus:ring-primary1 disabled:opacity-50 disabled:pointer-events-none outline-none"
        :class="item.customClass"
        :pattern="item.pattern"
        :required="item.isRequired"
        @input="payload[item.field] = $event.target.value"
        :disabled="disabled"
      />

      <input
        v-else
        :type="item.type"
        :value="payload[item.field]"
        class="sm:py-5 px-4 h-10 block w-full border border-gray-300 rounded-xl sm:text-sm focus:border-none focus:ring-1 focus:ring-primary1 disabled:opacity-50 disabled:pointer-events-none outline-none"
        :class="item.customClass"
        :placeholder="item.placeholder"
        :pattern="item.pattern"
        :required="item.isRequired"
        @input="payload[item.field] = $event.target.value"
        :disabled="disabled"
      />

      <span v-if="item.subtext" class="text-xs text-gray-400 mt-1 ml-1">{{
        item.subtext
      }}</span>
    </div>
    <div class="col-span-1 lg:col-span-2 flex justify-center items-center pt-3">
      <button
        v-if="showSubmitButton"
        type="button"
        class="bg-primary1/95 text-white px-6 py-2 w-full rounded-xl hover:bg-primary1/80 transition-all duration-200 active:scale-95 active:bg-primary1 cursor-pointer"
        @click="submitPayload"
      >
        Submit
      </button>
    </div>
  </form>
</template>

<script setup>
import CustomDropdown from "./CustomDropdown.vue";
import { useToast } from "../../../services/useToast";
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  customClass: String,
  dialogFields: Array,
  showSubmitButton: {
    type: Boolean,
    default: true,
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit:data", "watch:payload"]);

const formRef = ref(null);
const payload = ref({});
const { toast } = useToast();

// Initialize payload with initialData
onMounted(() => {
  payload.value = { ...props.initialData };
});

// Watch for changes in initialData and update payload
watch(
  () => props.initialData,
  (newData) => {
    payload.value = { ...newData };
  },
  { deep: true }
);

watch(
  () => payload.value,
  (newData) => {
    if (props.initialData !== newData) {
      emit("watch:payload", newData);
    }
  },
  { deep: true }
);

const submitPayload = () => {
  if (formRef.value.reportValidity()) {
    emit("submit:data", payload.value);
  } else {
    toast("Please fill in required fields", "danger");
  }
};
</script>

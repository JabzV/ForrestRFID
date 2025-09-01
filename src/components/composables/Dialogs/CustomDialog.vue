<template>
  <div
    id="hs-scale-animation-modal"
    class="hs-overlay hidden size-full fixed top-0 start-0 z-80 overflow-x-hidden overflow-y-auto pointer-events-none"
    role="dialog"
    tabindex="-1"
    aria-labelledby="hs-scale-animation-modal-label"
  >
    <div
      class="hs-overlay-open:opacity-100 opacity-0 transition-opacity duration-300 fixed inset-0 bg-gray-800/40"
      data-hs-overlay="#hs-scale-animation-modal"
    ></div>

    <div
      :class="`hs-overlay-animation-target hs-overlay-open:scale-120 hs-overlay-open:opacity-100 scale-95 opacity-0 ease-in-out transition-all duration-100 max-w-sm lg:max-w-xl m-3 mx-auto min-h-[calc(85vh)] flex items-center relative z-10`"
    >
      <div
        class="w-full flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl pointer-events-auto"
      >
        <div class="flex justify-between items-center py-3 px-4">
          <h3 class="font-semibold text-xl text-gray-800">
            {{ title }}
          </h3>
          <ClickableIcon
            icon="pi pi-times"
            iconSize="1"
            containerSize="h-8 w-8"
            hoverEffect="true"
            @click="closeModal"
            :canHideOverlay="true"
          />
        </div>
        <form
          ref="formRef"
          @submit.prevent="printPayload"
          class="p-4 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <CustomInput
            v-for="item in dialogFields"
            :key="item.field"
            :placeholder="item.placeholder"
            :type="item.type"
            :customClass="item.customClass"
            :label="item.label"
            v-model="payload[item.field]"
            :options="item.options"
            :pattern="item.pattern"
          />
        </form>
        <div class="justify-center items-center gap-x-2 py-4 px-4">
          <button
            type="button"
            class="bg-primary1/95 text-white px-6 py-2 w-full rounded-xl hover:bg-primary1/80 transition-all duration-200 active:scale-95 active:bg-primary1 cursor-pointer"
            data-hs-overlay="#hs-scale-animation-modal"
            @click="printPayload"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import ClickableIcon from "../../shared/Clickables/ClickableIcon.vue";
import CustomInput from "../../shared/Forms/CustomInput.vue";

const props = defineProps({
  title: String,
  content: String,
  dialogFields: Array,
});

const payload = ref({});

const formRef = ref(null);

const printPayload = () => {
  if (formRef.value.reportValidity()) {
    console.log(payload.value);
  } else {
    alert("Please fill in all fields");
  }
};

const closeModal = () => {
  // Reset payload when closing modal
  payload.value = {};
};

onMounted(() => {
  setTimeout(() => {
    if (window.HSStaticMethods) {
      window.HSStaticMethods.autoInit();
    }
  }, 100);
});
</script>

<style scoped></style>

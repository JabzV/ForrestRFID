<template>
  <div
    ref="modal"
    :id="`hs-modal-${modalId}`"
    class="hs-overlay hidden size-full fixed top-0 start-0 z-80 overflow-x-hidden overflow-y-auto pointer-events-none"
    role="dialog"
    tabindex="-1"
    :aria-labelledby="`hs-modal-${modalId}-label`"
  >
    <div
      class="hs-overlay-open:opacity-100 opacity-0 transition-opacity duration-300 fixed inset-0 bg-gray-800/40"
      @click="closeModal"
    ></div>

    <div
      :class="`hs-overlay-animation-target hs-overlay-open:scale-100 hs-overlay-open:opacity-100 scale-95 opacity-0 ease-in-out transition-all duration-100 max-w-sm lg:max-w-xl m-3 mx-auto min-h-[calc(85vh)] flex items-center relative z-10`"
    >
      <div
        class="w-full flex flex-col bg-white border border-gray-200 shadow-2xs rounded-xl pointer-events-auto"
      >
        <div class="flex justify-between items-center py-3 px-4">
          <h3
            :id="`hs-modal-${modalId}-label`"
            class="font-semibold text-xl text-gray-800"
          >
            {{ title }}
          </h3>
          <ClickableIcon
            v-if="closable"
            icon="pi pi-times"
            iconSize="1"
            containerSize="h-8 w-8"
            hoverEffect="true"
            @click="closeModal"
          />
        </div>

        <slot />
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import ClickableIcon from "../../shared/Clickables/ClickableIcon.vue";

const modal = ref(null);
const modalId = ref(Math.random().toString(36).substr(2, 9));
const emit = defineEmits(["opened", "closed"]);

const props = defineProps({
  title: String,
  closable: Boolean,
});

const openModal = () => {
  if (window.HSOverlay && modal.value) {
    window.HSOverlay.open(modal.value);
    emit("opened");
  } else {
    console.error("HSOverlay not available or modal not found");
  }
};

const closeModal = () => {
  if (window.HSOverlay && modal.value) {
    window.HSOverlay.close(modal.value);
    emit("closed");
  }
};

onMounted(() => {
  // Initialize Preline for this modal
  setTimeout(() => {
    if (window.HSStaticMethods) {
      window.HSStaticMethods.autoInit();
    }
  }, 100);
});

defineExpose({ openModal, closeModal });
</script>

<style scoped></style>

<template>
  <div
    class="flex items-center justify-between bg-[#fdfeff] border border-gray-300 rounded-[20px] py-4 px-8 mt-6"
  >
    <!-- Results Info -->
    <div class="text-sm text-gray-600">
      Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} results
    </div>

    <!-- Pagination Controls -->
    <div class="flex items-center gap-2">
      <!-- Previous Button -->
      <IconButton
        icon="pi pi-chevron-left"
        iconSize="0.8"
        iconColor="text-gray-600"
        buttonColor="bg-gray-100 hover:bg-gray-200"
        containerSize="w-9 h-9"
        :onClick="() => goToPage(currentPage - 1)"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
        :disabled="currentPage === 1"
      />

      <!-- Page Numbers -->
      <div class="flex items-center gap-1">
        <!-- First page -->
        <button
          v-if="showFirstPage"
          class="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-200"
          :class="
            currentPage === 1
              ? 'bg-primary1 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
          @click="goToPage(1)"
        >
          1
        </button>

        <!-- First ellipsis -->
        <span v-if="showFirstEllipsis" class="px-2 text-gray-400">...</span>

        <!-- Visible page numbers -->
        <button
          v-for="page in visiblePages"
          :key="page"
          class="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-200"
          :class="
            currentPage === page
              ? 'bg-primary1 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <!-- Last ellipsis -->
        <span v-if="showLastEllipsis" class="px-2 text-gray-400">...</span>

        <!-- Last page -->
        <button
          v-if="showLastPage"
          class="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-200"
          :class="
            currentPage === totalPages
              ? 'bg-primary1 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          "
          @click="goToPage(totalPages)"
        >
          {{ totalPages }}
        </button>
      </div>

      <!-- Next Button -->
      <IconButton
        icon="pi pi-chevron-right"
        iconSize="0.8"
        iconColor="text-gray-600"
        buttonColor="bg-gray-100 hover:bg-gray-200"
        containerSize="w-9 h-9"
        :onClick="() => goToPage(currentPage + 1)"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
        :disabled="currentPage === totalPages"
      />
    </div>

    <!-- Items per page selector -->
    <div class="flex items-center gap-2 text-sm text-gray-600">
      <span>Items per page:</span>
      <CustomDropdown
        :options="itemsPerPageOptions"
        :modelValue="itemsPerPage"
        @update:modelValue="handleItemsPerPageChange"
        customClass="h-8 text-sm w-20"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import IconButton from "../Clickables/IconButton.vue";
import CustomDropdown from "../Forms/CustomDropdown.vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true,
  },
  maxVisiblePages: {
    type: Number,
    default: 5,
  },
});

const emit = defineEmits(["pageChanged", "itemsPerPageChanged"]);

const itemsPerPageOptions = [
  { name: "5", id: 5 },
  { name: "10", id: 10 },
  { name: "20", id: 20 },
  { name: "50", id: 50 },
];

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage);
});

const startItem = computed(() => {
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage;
  return end > props.totalItems ? props.totalItems : end;
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = props.maxVisiblePages;
  const total = totalPages.value;
  const current = props.currentPage;

  if (total <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Calculate range around current page
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // Don't include first and last page in visible pages if they're shown separately
    if (start === 1) start = 2;
    if (end === total) end = total - 1;

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});

const showFirstPage = computed(() => {
  return (
    totalPages.value > props.maxVisiblePages &&
    props.currentPage > Math.ceil(props.maxVisiblePages / 2)
  );
});

const showLastPage = computed(() => {
  return (
    totalPages.value > props.maxVisiblePages &&
    props.currentPage < totalPages.value - Math.floor(props.maxVisiblePages / 2)
  );
});

const showFirstEllipsis = computed(() => {
  return showFirstPage.value && visiblePages.value[0] > 2;
});

const showLastEllipsis = computed(() => {
  return (
    showLastPage.value &&
    visiblePages.value[visiblePages.value.length - 1] < totalPages.value - 1
  );
});

// Methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit("pageChanged", page);
  }
};

const handleItemsPerPageChange = (newItemsPerPage) => {
  emit("itemsPerPageChanged", newItemsPerPage);
};
</script>

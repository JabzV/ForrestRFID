<template>
  <div class="mb-7">
    <!-- Filters Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div class="flex flex-col gap-2">
        <label class="text-md pl-1 text-gray-700">Search by Name or RFID</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Enter name or RFID..."
          class="px-4 h-11 block w-full border border-gray-300 rounded-xl sm:text-sm focus:border-none focus:ring-1 focus:ring-primary1 outline-none"
          @input="handleSearchChange"
        />
      </div>

      <!-- Date Range Filter -->
      <div class="flex flex-col gap-2">
        <label class="text-md pl-1 text-gray-700">Date Range</label>
        <div class="flex gap-2">
          <input
            v-model="dateFrom"
            type="date"
            class="px-3 h-10 block w-full border border-gray-300 rounded-xl text-sm focus:border-none focus:ring-1 focus:ring-primary1 outline-none"
            @change="handleFilterChange"
          />
          <input
            v-model="dateTo"
            type="date"
            class="px-3 h-10 block w-full border border-gray-300 rounded-xl text-sm focus:border-none focus:ring-1 focus:ring-primary1 outline-none"
            @change="handleFilterChange"
          />
        </div>
      </div>

      <!-- Total Time Sort -->
      <div class="flex flex-col gap-2">
        <label class="text-md pl-1 text-gray-700">Sort by Total Time</label>
        <CustomDropdown
          :options="sortOptions"
          placeholder="Sort by Total Time"
          :modelValue="totalTimeSort"
          @update:modelValue="
            totalTimeSort = $event;
            handleFilterChange();
          "
        />
      </div>

      <!-- Total Paid Sort -->
      <div class="flex flex-col gap-2">
        <label class="text-md pl-1 text-gray-700">Sort by Total Paid</label>
        <CustomDropdown
          :options="sortOptions"
          placeholder="Sort by Total Paid"
          :modelValue="totalPaidSort"
          @update:modelValue="
            totalPaidSort = $event;
            handleFilterChange();
          "
        />
      </div>

      <!-- Items per page -->
      <!-- <div class="flex flex-col gap-2">
        <label class="text-md pl-1 text-gray-700">Items per page</label>
        <CustomDropdown
          :options="itemsPerPageOptions"
          placeholder="Select items..."
          :modelValue="itemsPerPage"
          @update:modelValue="
            itemsPerPage = $event;
            handleFilterChange();
          "
        />
      </div> -->
    </div>

    <!-- Action Buttons -->
    <!-- <div class="flex gap-3 justify-end">
      <button
        type="button"
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200"
        @click="clearFilters"
      >
        Clear Filters
      </button>
      <button
        type="button"
        class="px-4 py-2 bg-primary1/95 text-white rounded-xl hover:opacity-85 transition-all duration-200"
        @click="applyFilters"
      >
        Apply Filters
      </button>
    </div> -->
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import CustomDropdown from "../../shared/Forms/CustomDropdown.vue";

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["filtersChanged", "search"]);

// Search and filter state
const searchQuery = ref("");
const dateFrom = ref("");
const dateTo = ref("");
const totalTimeSort = ref("");
const totalPaidSort = ref("");
const itemsPerPage = ref(10);

// Options for dropdowns
const sortOptions = [
  { name: "Ascending", id: "asc" },
  { name: "Descending", id: "desc" },
];

const itemsPerPageOptions = [
  { name: "5", id: 5 },
  { name: "10", id: 10 },
  { name: "20", id: 20 },
  { name: "50", id: 50 },
  { name: "All", id: "all" },
];

// Initialize with props if provided
if (props.initialFilters) {
  searchQuery.value = props.initialFilters.searchQuery || "";
  dateFrom.value = props.initialFilters.dateFrom || "";
  dateTo.value = props.initialFilters.dateTo || "";
  totalTimeSort.value = props.initialFilters.totalTimeSort || "";
  totalPaidSort.value = props.initialFilters.totalPaidSort || "";
  itemsPerPage.value = props.initialFilters.itemsPerPage || 10;
}

// Debounced search
let searchTimeout = null;
const handleSearchChange = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    emit("search", searchQuery.value);
  }, 300);
};

const handleFilterChange = () => {
  const filters = {
    searchQuery: searchQuery.value,
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    totalTimeSort: totalTimeSort.value,
    totalPaidSort: totalPaidSort.value,
    itemsPerPage: itemsPerPage.value,
  };
  emit("filtersChanged", filters);
};

const clearFilters = () => {
  searchQuery.value = "";
  dateFrom.value = "";
  dateTo.value = "";
  totalTimeSort.value = "";
  totalPaidSort.value = "";
  itemsPerPage.value = 10;
  handleFilterChange();
};

const applyFilters = () => {
  handleFilterChange();
};

// Watch for search query changes
watch(searchQuery, (newValue) => {
  if (newValue === "") {
    handleFilterChange();
  }
});
</script>

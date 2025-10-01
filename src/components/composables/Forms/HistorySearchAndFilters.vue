<template>
  <div class="mb-7">
    <!-- Filters Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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

      <!-- Status Filter -->
      <div class="flex flex-col gap-2">
        <label class="text-md pl-1 text-gray-700">Filter by Status</label>
        <CustomDropdown
          :options="statusOptions"
          placeholder="Filter by Status"
          :modelValue="statusFilter"
          @update:modelValue="
            statusFilter = $event;
            handleFilterChange();
          "
        />
      </div>

      <!-- Member Type Filter -->
      <div class="flex flex-col gap-2">
        <label class="text-md pl-1 text-gray-700">Filter by Member Type</label>
        <CustomDropdown
          :options="memberTypeOptions"
          placeholder="Filter by Member Type"
          :modelValue="memberTypeFilter"
          @update:modelValue="
            memberTypeFilter = $event;
            handleFilterChange();
          "
        />
      </div>

      <!-- Total Time Sort -->
      <div class="flex flex-col gap-2">
        <label class="text-md pl-1 text-gray-700">Sort by Duration</label>
        <CustomDropdown
          :options="sortOptions"
          placeholder="Sort by Duration"
          :modelValue="totalTimeSort"
          @update:modelValue="
            totalTimeSort = $event;
            handleFilterChange();
          "
        />
      </div>

      <!-- Total Paid Sort -->
      <div class="flex flex-col gap-2">
        <label class="text-md pl-1 text-gray-700">Sort by Amount Paid</label>
        <CustomDropdown
          :options="sortOptions"
          placeholder="Sort by Amount Paid"
          :modelValue="totalPaidSort"
          @update:modelValue="
            totalPaidSort = $event;
            handleFilterChange();
          "
        />
      </div>
    </div>
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
const statusFilter = ref("");
const memberTypeFilter = ref("");
const totalTimeSort = ref("");
const totalPaidSort = ref("");
const itemsPerPage = ref(10);

// Options for dropdowns
const sortOptions = [
  { name: "Ascending", id: "asc" },
  { name: "Descending", id: "desc" },
];

const statusOptions = [
  { name: "All Statuses", id: "all" },
  { name: "Pending", id: "pending" },
  { name: "Completed", id: "completed" },
  { name: "Cancelled", id: "cancelled" },
];

const memberTypeOptions = [
  { name: "All Types", id: "all" },
  { name: "Members", id: "member" },
  { name: "Non-Members", id: "non-member" },
];

// Initialize with props if provided
if (props.initialFilters) {
  searchQuery.value = props.initialFilters.searchQuery || "";
  dateFrom.value = props.initialFilters.dateFrom || "";
  dateTo.value = props.initialFilters.dateTo || "";
  statusFilter.value = props.initialFilters.statusFilter || "all";
  memberTypeFilter.value = props.initialFilters.memberTypeFilter || "all";
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
    statusFilter: statusFilter.value,
    memberTypeFilter: memberTypeFilter.value,
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
  statusFilter.value = "all";
  memberTypeFilter.value = "all";
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

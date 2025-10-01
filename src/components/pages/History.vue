<template>
  <div class="p-8 bg-background w-full overflow-x-hidden">
    <!-- Search and Filters Component -->
    <HistorySearchAndFilters
      :initialFilters="currentFilters"
      @filtersChanged="handleFiltersChanged"
      @search="handleSearch"
    />

    <!-- History List -->
    <div class="flex flex-col gap-4 w-full">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="text-lg text-gray-600">Loading history...</div>
      </div>

      <!-- No Results State -->
      <div
        v-else-if="paginatedHistory.length === 0"
        class="flex justify-center items-center py-12"
      >
        <div class="text-center">
          <div class="text-lg text-gray-600 mb-2">No history records found</div>
          <div class="text-sm text-gray-500">
            {{
              hasActiveFilters
                ? "Try adjusting your search or filters"
                : "No session history available yet"
            }}
          </div>
        </div>
      </div>

      <!-- History Cards -->
      <UserCard
        v-else
        v-for="user in paginatedHistory"
        :key="user.id"
        :user="user"
        :statusClass="getStatusClass(user.status)"
        :withActions="false"
        @click="handleCardClick(user)"
        class="cursor-pointer hover:shadow-md transition-shadow duration-200"
      />
    </div>

    <!-- Pagination Component -->
    <Pagination
      v-if="!isLoading && filteredHistory.length > 0"
      :currentPage="currentPage"
      :totalItems="filteredHistory.length"
      :itemsPerPage="currentFilters.itemsPerPage"
      @pageChanged="handlePageChanged"
      @itemsPerPageChanged="handleItemsPerPageChanged"
    />

    <!-- Session Details Modal -->
    <SessionDetailsModal ref="sessionDetailsModal" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import UserCard from "../composables/Cards/UserCard.vue";
import HistorySearchAndFilters from "../composables/Forms/HistorySearchAndFilters.vue";
import Pagination from "../shared/Navigation/Pagination.vue";
import SessionDetailsModal from "../composables/Dialogs/SessionDetailsModal.vue";
import { useTopbarButtonState } from "../../../store/vueStore/topbarButtonState";
import {
  getHistoryList,
  filterAndSortHistory,
  paginateHistory,
} from "../../../store/vueStore/History/historyList";
import {
  formatDateToTime,
  formatDate,
  formatDuration,
  sentenceCase,
  formatToMMDDYY,
} from "../../services/utils";

const historyList = ref([]);

// New state for filtering and pagination
const isLoading = ref(false);
const allHistory = ref([]);
const filteredHistory = ref([]);
const paginatedHistory = ref([]);
const currentPage = ref(1);
const sessionDetailsModal = ref(null);
const currentFilters = ref({
  searchQuery: "",
  dateFrom: "",
  dateTo: "",
  statusFilter: "all",
  memberTypeFilter: "all",
  totalTimeSort: "",
  totalPaidSort: "",
  itemsPerPage: 5,
});

const hasActiveFilters = computed(() => {
  return (
    currentFilters.value.searchQuery ||
    currentFilters.value.dateFrom ||
    currentFilters.value.dateTo ||
    (currentFilters.value.statusFilter &&
      currentFilters.value.statusFilter !== "all") ||
    (currentFilters.value.memberTypeFilter &&
      currentFilters.value.memberTypeFilter !== "all") ||
    currentFilters.value.totalTimeSort ||
    currentFilters.value.totalPaidSort
  );
});

const exportToCSV = async () => {
  try {
    // Get all history data (not just filtered/paginated)
    const allHistoryData = await getHistoryList();

    // Prepare CSV headers
    const headers = [
      "Full Name",
      "RFID",
      "Session Date",
      "Time In",
      "Time Out",
      "Duration",
      "Amount Paid",
      "Status",
      "Member Type",
    ];

    // Prepare CSV rows
    const rows = allHistoryData.map((record) => {
      // Format the data similar to how it's displayed
      const sessionDate = formatToMMDDYY(formatDate(record.created_at));
      const timeIn = record.time_in ? formatDateToTime(record.time_in) : "-";
      const timeOut = record.time_out ? formatDateToTime(record.time_out) : "-";
      const duration = record.duration ? formatDuration(record.duration) : "-";
      const amountPaid = record.amount_paid ? `PHP ${record.amount_paid}` : "-";
      const status = record.status ? sentenceCase(record.status) : "-";
      const memberType =
        record.full_name === "Non Member" ? "Non-Member" : "Member";

      return [
        record.full_name || "-",
        record.rfid || "-",
        sessionDate,
        timeIn,
        timeOut,
        duration,
        amountPaid,
        status,
        memberType,
      ];
    });

    // Convert to CSV format
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((field) =>
            // Escape fields that contain commas, quotes, or newlines
            typeof field === "string" &&
            (field.includes(",") || field.includes('"') || field.includes("\n"))
              ? `"${field.replace(/"/g, '""')}"`
              : field
          )
          .join(",")
      ),
    ].join("\n");

    // Create and download the file with proper UTF-8 BOM for Excel compatibility
    const BOM = "\uFEFF"; // UTF-8 BOM (Byte Order Mark)
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD format
      link.setAttribute("download", `history_export_${dateStr}.csv`);

      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Exported ${allHistoryData.length} history records to CSV`);
    }
  } catch (error) {
    console.error("Error exporting to CSV:", error);
  }
};

onMounted(async () => {
  useTopbarButtonState().setButtonState("Export Data", exportToCSV);
  await loadData();
});

const loadData = async () => {
  isLoading.value = true;
  try {
    const historyData = await getHistoryList();
    allHistory.value = historyData.map((user) => ({
      ...user,
      sessionDate: formatToMMDDYY(formatDate(user.created_at)),
      time_in: user.time_in ? formatDateToTime(user.time_in) : user.time_in,
      time_out: user.time_out ? formatDateToTime(user.time_out) : user.time_out,
      duration: user.duration ? formatDuration(user.duration) : user.duration,
      amount_paid_original: user.amount_paid, // Keep original numeric value for sorting
      amount_paid: user.amount_paid ? `₱${user.amount_paid}` : user.amount_paid, // Formatted for display
      status: user.status ? sentenceCase(user.status) : user.status,
    }));

    // Keep the original historyList ref for backward compatibility
    historyList.value = allHistory.value;

    // Apply current filters and pagination
    applyFiltersAndPagination();
  } catch (error) {
    console.error("Error loading history:", error);
  } finally {
    isLoading.value = false;
  }
};

const applyFiltersAndPagination = () => {
  // Apply filters and sorting
  filteredHistory.value = filterAndSortHistory(
    allHistory.value,
    currentFilters.value
  );

  // Apply pagination
  const paginationResult = paginateHistory(
    filteredHistory.value,
    currentPage.value,
    currentFilters.value.itemsPerPage
  );

  paginatedHistory.value = paginationResult.paginatedRecords;
};

const handleFiltersChanged = (filters) => {
  currentFilters.value = { ...filters };
  currentPage.value = 1; // Reset to first page when filters change
  applyFiltersAndPagination();
};

const handleSearch = (searchQuery) => {
  currentFilters.value.searchQuery = searchQuery;
  currentPage.value = 1; // Reset to first page when searching
  applyFiltersAndPagination();
};

const handlePageChanged = (page) => {
  currentPage.value = page;
  applyFiltersAndPagination();
};

const handleItemsPerPageChanged = (itemsPerPage) => {
  currentFilters.value.itemsPerPage = itemsPerPage;
  currentPage.value = 1; // Reset to first page when changing items per page
  applyFiltersAndPagination();
};

const handleCardClick = (sessionRecord) => {
  if (sessionDetailsModal.value && sessionRecord.id) {
    sessionDetailsModal.value.openModal(sessionRecord.id);
  }
};

// Status styling function
const getStatusClass = (status) => {
  const classes = {
    pending: "bg-warning-light text-warning",
    completed: "bg-success-light text-success",
    cancelled: "bg-danger-light text-danger",
  };
  return classes[status.toLowerCase()] || "bg-gray-100 text-gray-600";
};
</script>

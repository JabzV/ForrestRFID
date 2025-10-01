<template>
  <div class="p-8 bg-background w-full overflow-x-hidden">
    <!-- Search and Filters Component -->
    <SearchAndFilters
      :initialFilters="currentFilters"
      @filtersChanged="handleFiltersChanged"
      @search="handleSearch"
    />

    <!-- Users List -->
    <div class="flex flex-col gap-4 w-full">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="text-lg text-gray-600">Loading users...</div>
      </div>

      <!-- No Results State -->
      <div
        v-else-if="paginatedUsers.length === 0"
        class="flex justify-center items-center py-12"
      >
        <div class="text-center">
          <div class="text-lg text-gray-600 mb-2">No users found</div>
          <div class="text-sm text-gray-500">
            {{
              hasActiveFilters
                ? "Try adjusting your search or filters"
                : "No users have been added yet"
            }}
          </div>
        </div>
      </div>

      <!-- Users Cards -->
      <UserCard
        v-else
        v-for="user in paginatedUsers"
        :key="user.id"
        :user="user"
        @view="handleViewButton"
        @edit="handleEditButton"
        @delete="handleDeleteButton"
      />
    </div>

    <!-- Pagination Component -->
    <Pagination
      v-if="!isLoading && filteredUsers.length > 0"
      :currentPage="currentPage"
      :totalItems="filteredUsers.length"
      :itemsPerPage="currentFilters.itemsPerPage"
      @pageChanged="handlePageChanged"
      @itemsPerPageChanged="handleItemsPerPageChanged"
    />
    <CustomDialog
      :title="dynamicTitle"
      :closable="isScanning ? false : true"
      ref="inputDialog"
    >
      <CustomInput
        v-if="!isScanning && !isDeleting"
        :dialogFields="userListModalFields"
        :initialData="payload"
        :buttonText="isEditing ? 'Update' : 'Submit'"
        :buttonColor="isEditing ? 'bg-warning' : 'bg-primary1/95'"
        :buttonTextColor="isEditing ? 'text-white' : 'text-white'"
        :disabled="isViewing"
        :showSubmitButton="!isViewing"
        @submit:data="handleSubmit"
      />
      <DeleteDialog
        v-if="isDeleting"
        title="Delete User"
        message="Are you sure you want to delete this user?"
        @cancel="closeModal()"
        @proceed="handleDelete"
      />
      <div v-if="isScanning && !isDeleting">
        <input id="rfidInput" maxlength="10" class="opacity-0 h-1" />
        <ScanningDisplay :timeout="scanTimer" @timeout="handleScanTimeout" />
      </div>
    </CustomDialog>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";

import ScanningDisplay from "../composables/Display/ScanningDIsplay.vue";
import UserCard from "../composables/Cards/UserCard.vue";
import CustomDialog from "../composables/Dialogs/CustomDialog.vue";
import CustomInput from "../shared/Forms/CustomInput.vue";
import DeleteDialog from "../composables/Dialogs/DeleteDialog.vue";
import SearchAndFilters from "../composables/Forms/SearchAndFilters.vue";
import Pagination from "../shared/Navigation/Pagination.vue";
import {
  formatDate,
  formatToMMDDYY,
  formatDuration,
} from "../../services/utils";
import { useTopbarButtonState } from "../../../store/vueStore/topbarButtonState";
import { ipcHandle } from "../../../ipc/ipcHandler";
import { rfidScanner } from "../../services/utils";
import { useToast } from "../../services/useToast";

import {
  getUserList,
  updateUser,
  deleteUser,
  getUserListModalFields,
  filterAndSortUsers,
  paginateUsers,
} from "../../../store/vueStore/Users/userList";

let timerValue = 15000;
let rfidScannerPromise = null;

const isScanning = ref(false);
const isEditing = ref(false);
const isViewing = ref(false);
const isDeleting = ref(false);

const inputDialog = ref(null);
const { toast } = useToast();
const scanTimer = ref(timerValue); // 30 seconds timeout
const users = ref([]);
const userListModalFields = ref([]);
const payload = ref({});

// New state for filtering and pagination
const isLoading = ref(false);
const allUsers = ref([]);
const filteredUsers = ref([]);
const paginatedUsers = ref([]);
const currentPage = ref(1);
const currentFilters = ref({
  searchQuery: "",
  dateFrom: "",
  dateTo: "",
  totalTimeSort: "",
  totalPaidSort: "",
  itemsPerPage: 5,
});

const dynamicTitle = computed(() => {
  if (isScanning.value) {
    return "Scanning RFID";
  } else if (isEditing.value && !isScanning.value) {
    return "Edit User";
  } else if (isViewing.value && !isScanning.value) {
    return "View User";
  } else {
    return "Add User";
  }
});

const hasActiveFilters = computed(() => {
  return (
    currentFilters.value.searchQuery ||
    currentFilters.value.dateFrom ||
    currentFilters.value.dateTo ||
    currentFilters.value.totalTimeSort ||
    currentFilters.value.totalPaidSort
  );
});

onMounted(async () => {
  useTopbarButtonState().setButtonState("Add User", () => openModal("addMode"));
  userListModalFields.value = await getUserListModalFields();
  loadData();
});

const loadData = async () => {
  isLoading.value = true;
  try {
    const userData = await getUserList();
    allUsers.value = userData.map((user) => ({
      ...user,
      dateRegistered: formatToMMDDYY(formatDate(user.created_at)),
      total_time: user.total_time
        ? formatDuration(user.total_time)
        : user.total_time,
      total_paid: user.total_paid
        ? parseFloat(user.total_paid).toFixed(2)
        : user.total_paid,
    }));

    // Keep the original users ref for backward compatibility
    users.value = allUsers.value;

    // Apply current filters and pagination
    applyFiltersAndPagination();
  } catch (error) {
    toast("Error loading users", "danger");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const applyFiltersAndPagination = () => {
  // Apply filters and sorting
  filteredUsers.value = filterAndSortUsers(
    allUsers.value,
    currentFilters.value
  );

  // Apply pagination
  const paginationResult = paginateUsers(
    filteredUsers.value,
    currentPage.value,
    currentFilters.value.itemsPerPage
  );

  paginatedUsers.value = paginationResult.paginatedUsers;
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

const openModal = (mode) => {
  switch (mode) {
    case "addMode":
      isEditing.value = false;
      isViewing.value = false;
      isDeleting.value = false;
      payload.value = {};
      break;
    case "editMode":
      isEditing.value = true;
      isViewing.value = false;
      isDeleting.value = false;
      break;
    case "viewMode":
      isViewing.value = true;
      isEditing.value = false;
      isDeleting.value = false;
      break;
    case "deleteMode":
      isDeleting.value = true;
      isEditing.value = false;
      isViewing.value = false;
      break;
  }
  if (inputDialog.value) {
    console.log("Opening modal");
    inputDialog.value.openModal();
  }
};

const closeModal = () => {
  if (inputDialog.value) {
    inputDialog.value.closeModal();
  }
};

const handleSubmit = async (data) => {
  if (isEditing.value) {
    await updateUserFunction(data);
  } else {
    await createUserFunction(data);
  }
};

const updateUserFunction = async (data) => {
  try {
    await updateUser(data);
    closeModal();
    toast("User updated successfully", "success");
    await loadData();
  } catch (error) {
    toast("An error occurred while updating the user", "danger");
    console.error(error);
  } finally {
    loadData();
  }
};

const createUserFunction = async (data) => {
  isScanning.value = true;
  rfidScannerPromise = rfidScanner("rfidInput");

  rfidScannerPromise.then(
    async (rfid) => {
      if (!isScanning.value) return; // Check if scanning was cancelled

      data.rfid = rfid;
      const cleanData = JSON.parse(JSON.stringify(data));
      try {
        await ipcHandle("createUser", cleanData);
        closeModal();
        toast("User added successfully", "success");
        isScanning.value = false;
        document.getElementById("rfidInput").value = "";
        scanTimer.value = timerValue;
      } catch (error) {
        closeModal();
        isScanning.value = false;
        if (error.message.includes("UNIQUE constraint failed: users.rfid")) {
          toast("Card already used", "danger");
        } else {
          toast(error, "danger");
        }
      } finally {
        loadData();
      }
    },
    (error) => {
      if (!isScanning.value) return; // Check if scanning was cancelled

      inputDialog.value.closeModal();
      isScanning.value = false;
      toast(error, "danger");
      scanTimer.value = timerValue;
    }
  );
};

const handleDelete = async () => {
  try {
    await deleteUser(payload.value.id);
    closeModal();
    toast("User deleted successfully", "success");
    await loadData();
  } catch (error) {
    toast("An error occurred while deleting the user", "danger");
    console.error(error);
  } finally {
    loadData();
  }
};

const handleScanTimeout = () => {
  if (isScanning.value) {
    isScanning.value = false;
    inputDialog.value.closeModal();
    toast("Scanning timeout - Please try again", "danger");
  }
};

const handleViewButton = (user) => {
  payload.value = user;
  openModal("viewMode");
};

const handleEditButton = (user) => {
  payload.value = user;
  openModal("editMode");
};

const handleDeleteButton = (user) => {
  payload.value = user;
  openModal("deleteMode");
};
</script>

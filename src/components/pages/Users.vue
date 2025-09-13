<template>
  <div class="p-8 bg-background w-full overflow-x-hidden">
    <div class="flex flex-col gap-4 w-full">
      <UserCard
        v-for="user in users"
        :key="user.id"
        :user="user"
        @view="handleViewButton"
        @edit="handleEditButton"
        @delete="handleDeleteButton"
      />
    </div>
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

onMounted(async () => {
  useTopbarButtonState().setButtonState("Add User", () => openModal("addMode"));
  userListModalFields.value = await getUserListModalFields();
  loadData();
});

const loadData = async () => {
  users.value = await getUserList();
  users.value.forEach((user) => {
    user.dateRegistered = formatToMMDDYY(formatDate(user.created_at));
    if (user.total_time) {
      user.total_time = formatDuration(user.total_time);
    }
  });
  console.log(users.value);
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

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
      :title="isScanning ? 'Scanning RFID' : 'Create New User'"
      :closable="isScanning ? false : true"
      ref="inputDialog"
    >
      <CustomInput
        v-if="!isScanning"
        :dialogFields="userListModalFields"
        @submit:data="handleSubmit"
      />
      <div v-if="isScanning">
        <input id="rfidInput" maxlength="10" class="opacity-0 h-1" />
        <ScanningDisplay :timeout="scanTimer" @timeout="handleScanTimeout" />
      </div>
    </CustomDialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

import ScanningDisplay from "../composables/Display/ScanningDIsplay.vue";
import UserCard from "../composables/Cards/UserCard.vue";
import CustomDialog from "../composables/Dialogs/CustomDialog.vue";
import CustomInput from "../shared/Forms/CustomInput.vue";
import {
  formatDate,
  formatToMMDDYY,
  formatDuration,
} from "../../services/utils";
import { useUserFunctions } from "../../functions/userFunctions";
import { useTopbarButtonState } from "../../../store/vueStore/topbarButtonState";
import { ipcHandle } from "../../../ipc/ipcHandler";
import { rfidScanner } from "../../services/utils";
import { useToast } from "../../services/useToast";

import {
  getUserList,
  getUserListModalFields,
} from "../../../store/vueStore/Users/userList";

let timerValue = 15000;
let rfidScannerPromise = null;

const isScanning = ref(false);
const inputDialog = ref(null);
const { toast } = useToast();
const scanTimer = ref(timerValue); // 30 seconds timeout
const users = ref([]);
const userListModalFields = ref([]);

onMounted(async () => {
  useTopbarButtonState().setButtonState("Add User", openModal);
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

const openModal = () => {
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

const handleScanTimeout = () => {
  if (isScanning.value) {
    isScanning.value = false;
    inputDialog.value.closeModal();
    toast("Scanning timeout - Please try again", "danger");
  }
};

const handleViewButton = (user) => {
  console.log("View user:", user);
};
</script>

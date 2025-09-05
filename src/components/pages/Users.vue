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
        :dialogFields="sampleDialog"
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
import { onMounted, ref, nextTick } from "vue";

import ScanningDisplay from "../composables/Display/ScanningDIsplay.vue";
import UserCard from "../composables/Cards/UserCard.vue";
import CustomDialog from "../composables/Dialogs/CustomDialog.vue";
import CustomInput from "../shared/Forms/CustomInput.vue";

import { useUserFunctions } from "../../functions/userFunctions";
import { useTopbarButtonState } from "../../../store/vueStore/topbarButtonState";
import { ipcHandle } from "../../../ipc/ipcHandler";
import { rfidScanner } from "../../services/utils";
import { useToast } from "../../services/useToast";

const { users, handleViewButton, handleEditButton, handleDeleteButton } =
  useUserFunctions();

let timerValue = 15000;
let rfidScannerPromise = null;

const isScanning = ref(false);
const inputDialog = ref(null);
const { toast } = useToast();
const scanTimer = ref(timerValue); // 30 seconds timeout

onMounted(() => {
  useTopbarButtonState().setButtonState("Add User");
});

const handleSubmit = async (data) => {
  isScanning.value = true;
  rfidScannerPromise = rfidScanner("rfidInput");

  rfidScannerPromise.then(
    async (rfid) => {
      if (!isScanning.value) return; // Check if scanning was cancelled

      data.rfid = rfid;
      const cleanData = JSON.parse(JSON.stringify(data));
      try {
        const result = await ipcHandle("createUser", cleanData);
        inputDialog.value.closeModal();
        toast("User added successfully", "success");
        isScanning.value = false;
        document.getElementById("rfidInput").value = "";
        scanTimer.value = timerValue;
      } catch (error) {
        inputDialog.value.closeModal();
        isScanning.value = false;
        if (error.message.includes("UNIQUE constraint failed: users.rfid")) {
          toast("Card already used", "danger");
        } else {
          toast(error, "danger");
        }
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

const sampleAccountRoles = [
  {
    id: 1,
    name: "Member",
  },
  {
    id: 2,
    name: "Vip",
  },
  {
    id: 3,
    name: "Guest",
  },
];

const sampleDialog = [
  {
    field: "first_name",
    placeholder: "First Name",
    type: "text",
    label: "First Name",
    isRequired: true,
  },
  {
    field: "last_name",
    placeholder: "Last Name",
    type: "text",
    label: "Last Name",
    isRequired: true,
  },
  {
    field: "contact_number",
    placeholder: "09xxxxxxxxx",
    type: "tel",
    pattern: "^(09|\\+639)\\d{9}$",
    label: "Contact Number",
  },
  {
    field: "birthday",
    placeholder: "mm/dd/yyyy",
    type: "date",
    label: "Date of Birth",
  },
  {
    field: "gender",
    placeholder: "Select Gender",
    type: "dropdown",
    label: "Gender",
    options: ["Male", "Female"],
  },
  {
    field: "email",
    placeholder: "example@gmail.com",
    type: "email",
    label: "Email",
  },
  {
    field: "account_role_id",
    placeholder: "Select Account Role",
    type: "dropdown",
    label: "Account Role",
    divClass: "col-span-1 lg:col-span-2",
    options: sampleAccountRoles,

    isRequired: true,
  },
];
</script>

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
    <CustomDialog title="Create New User" :closable="true" ref="inputDialog">
      <CustomInput
        v-show="!isScanning"
        :dialogFields="sampleDialog"
        @submit:data="handleSubmit"
      />
      <div v-show="isScanning">
        <h1 class="text-2xl font-bold">SCANNING...</h1>
        <input id="rfidInput" maxlength="10" />
      </div>
    </CustomDialog>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from "vue";

import UserCard from "../composables/Cards/UserCard.vue";
import CustomDialog from "../composables/Dialogs/CustomDialog.vue";
import CustomInput from "../shared/Forms/CustomInput.vue";

import { useUserFunctions } from "../../functions/userFunctions";
import { useTopbarButtonState } from "../../../store/vueStore/topbarButtonState";
import { ipcHandle } from "../../../ipc/ipcHandler";
import { rfidScanner } from "../../services/utils";

const { users, handleViewButton, handleEditButton, handleDeleteButton } =
  useUserFunctions();

const isScanning = ref(false);
const inputDialog = ref(null);

onMounted(() => {
  useTopbarButtonState().setButtonState("Add User");
});

const handleSubmit = async (data) => {
  isScanning.value = true;
  rfidScanner("rfidInput").then(
    async (rfid) => {
      data.rfid = rfid;
      const cleanData = JSON.parse(JSON.stringify(data));
      try {
        const result = await ipcHandle("createUser", cleanData);
        inputDialog.value.closeModal();
        console.log("Success");
        isScanning.value = false;
        rfidInput.value = "";
      } catch (error) {
        isScanning.value = false;
        if (error.message.includes("UNIQUE constraint failed: users.rfid")) {
          console.log("RFID already exists");
        } else {
          console.log(error);
        }
      }
    },
    (error) => {
      isScanning.value = false;
      console.log(error);
    }
  );
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

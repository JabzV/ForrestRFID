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

    <CustomDialog title="Create New User" :dialogFields="sampleDialog" />
  </div>
</template>

<script setup>
import { onMounted } from "vue";

import UserCard from "../composables/Cards/UserCard.vue";
import CustomDialog from "../composables/Dialogs/CustomDialog.vue";
import { useUserFunctions } from "../../functions/userFunctions";
import { useTopbarButtonState } from "../../../store/topbarButtonState";

const { users, handleViewButton, handleEditButton, handleDeleteButton } =
  useUserFunctions();

onMounted(() => {
  useTopbarButtonState().setButtonState("Add User");
});

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
    field: "date_of_birth",
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
    customClass: "col-span-2",
  },

  {
    field: "account_role_id",
    placeholder: "Select Account Role",
    type: "dropdown",
    label: "Account Role",
    options: sampleAccountRoles,
    customClass: "col-span-2",
    isRequired: true,
  },
];
</script>

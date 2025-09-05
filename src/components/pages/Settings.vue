<template>
  <div class="p-8 bg-background w-full overflow-x-hidden">
    <div class="flex gap-6">
      <!-- Session Profiles -->
      <div class="flex-1">
        <div class="flex flex-col gap-7">
          <ConfigCard
            title="Session Profiles"
            icon-class="pi pi-clock"
            :show-add-button="true"
            add-button-text="Add Profile"
            @add="addProfile"
            max-height="max-h-96"
          >
            <!-- Table Header -->
            <CustomDataTable
              :headers="['Name', 'Rate', 'Unit', 'Date Created', 'Actions']"
              gap-class="gap-4"
            >
              <DataTableContentCard
                v-for="profile in sessionProfiles"
                :key="profile.id"
                :item="profile"
                :columnNumber="5"
                gap-class="gap-4"
                @edit="editProfile"
                @delete="deleteProfile"
              />
            </CustomDataTable>

            <div v-if="sessionProfiles.length === 0" class="text-center py-12">
              <i class="pi pi-clock text-4xl text-gray-300 mb-4"></i>
              <p class="text-gray-500">No session profiles created yet</p>
              <p class="text-sm text-gray-400">
                Click "Add Profile" to create your first session profile
              </p>
            </div>
          </ConfigCard>

          <ConfigCard
            title="Promo Management"
            icon-class="pi pi-tag"
            :show-add-button="true"
            add-button-text="Add Promo"
            @add="addPromo"
            max-height="max-h-96"
          >
            <CustomDataTable
              :headers="['Name', 'Date From', 'Date To', 'Discount', 'Actions']"
              gap-class="gap-4"
            >
            </CustomDataTable>
          </ConfigCard>
        </div>
      </div>

      <!-- Session Configuration -->
      <div class="w-2/5 flex flex-col gap-7">
        <ConfigCard
          title="Session Configuration"
          icon-class="pi pi-cog"
          :show-add-button="true"
          add-button-text="Save"
          @add="saveConfiguration"
          :disableButton="disableButton"
        >
          <SessionConfigForm
            :config="sessionConfig"
            @watch:payload="handleWatchPayload"
          />
        </ConfigCard>

        <ConfigCard
          title="Account Roles"
          icon-class="pi pi-user"
          :show-add-button="true"
          add-button-text="Add Role"
          @add="addRole"
        >
          <CustomDataTable
            :headers="['Name', 'Discount', 'Type', 'Actions']"
            gap-class="gap-4"
          >
            <DataTableContentCard
              v-for="role in accountRoles"
              :key="role.id"
              :item="role"
              :columnNumber="4"
              gap-class="gap-4"
              @edit="editRole"
              @delete="deleteRole"
            />
          </CustomDataTable>
        </ConfigCard>
      </div>
    </div>

    <CustomDialog :title="dynamicTitle" :closable="true" ref="customDialog">
      <CustomInput
        v-if="submitMode !== 'deleteProfile' && submitMode !== 'deleteRole'"
        :dialogFields="dynamicFields"
        :initialData="payload"
        @submit:data="handleSubmit"
      />
      <DeleteDialog
        v-if="submitMode === 'deleteProfile' || submitMode === 'deleteRole'"
        :title="warningTitle"
        :message="warningMessage"
        @cancel="customDialog.closeModal()"
        @proceed="handleSubmit"
      />
    </CustomDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ConfigCard from "../composables/Cards/ConfigCard.vue";
import SessionConfigForm from "../composables/Forms/SessionConfigForm.vue";
import { useTopbarButtonState } from "../../../store/vueStore/topbarButtonState";
import CustomDataTable from "../composables/DataTables/CustomDataTable.vue";
import DataTableContentCard from "../composables/Cards/DataTableContentCard.vue";
import CustomDialog from "../composables/Dialogs/CustomDialog.vue";
import CustomInput from "../shared/Forms/CustomInput.vue";
import DeleteDialog from "../composables/Dialogs/DeleteDialog.vue";

//Store Imports
import {
  getAllSessionProfiles,
  createSessionProfile,
  updateSessionProfile,
  deleteSessionProfile,
  sessionProfileModalFields,
} from "../../../store/vueStore/Settings/sessionProfile";
import {
  loadSessionConfiguration,
  updateSessionConfiguration,
} from "../../../store/vueStore/Settings/sessionConfiguration";
import {
  loadAccountRoles,
  accountRolesModalFields,
  createAccountRole,
  updateAccountRole,
  deleteAccountRole,
} from "../../../store/vueStore/Settings/accountRoles";
import { useToast } from "../../services/useToast";

const sessionConfig = ref([]);
const sessionProfiles = ref([]);
const accountRoles = ref([]);
const customDialog = ref(null);
const dynamicFields = ref([]);
const dynamicTitle = ref("");
const submitMode = ref(null);
const warningTitle = ref("");
const warningMessage = ref("");
const disableButton = ref(true);
const originalSessionConfig = ref({});
const sessionConfigPayload = ref({});
const payload = ref({});
const { toast } = useToast();

onMounted(async () => {
  useTopbarButtonState().setButtonState();
  await loadData();
});

const loadData = async () => {
  sessionProfiles.value = await getAllSessionProfiles();
  sessionConfig.value = await loadSessionConfiguration();
  accountRoles.value = await loadAccountRoles();

  // Store original config for comparison
  if (sessionConfig.value.length > 0) {
    originalSessionConfig.value = JSON.parse(
      JSON.stringify(sessionConfig.value[0])
    );
    // Reset button to disabled state when fresh data is loaded
    disableButton.value = true;
  }
};

const handleSubmit = async (data) => {
  try {
    switch (submitMode.value) {
      case "addProfile":
        await createSessionProfile(data);
        break;
      case "editProfile":
        await updateSessionProfile(data);
        break;
      case "deleteProfile":
        await deleteSessionProfile(payload.value.id);
        break;
      case "addRole":
        await createAccountRole(data);
        break;
      case "editRole":
        await updateAccountRole(data);
        break;
      case "deleteRole":
        await deleteAccountRole(payload.value.id);
        break;
    }
    toast("Session profile updated successfully", "success");
    customDialog.value.closeModal();
    await loadData();
  } catch (error) {
    toast("An error occurred while updating the session profile", "danger");
    console.error(error);
  }
};

const addProfile = () => {
  openModal("Add Profile", sessionProfileModalFields, {}, "addProfile");
};

const editProfile = (profile) => {
  openModal("Edit Profile", sessionProfileModalFields, profile, "editProfile");
};

const deleteProfile = (profile) => {
  openDeleteModal(
    "Delete Session Profile",
    "Are you sure you want to delete this profile?",
    profile,
    "deleteProfile"
  );
};

const addRole = () => {
  openModal("Add Role", accountRolesModalFields, {}, "addRole");
};

const editRole = (role) => {
  openModal("Edit Role", accountRolesModalFields, role, "editRole");
  console.log(payload.value);
};

const deleteRole = (role) => {
  openDeleteModal(
    "Delete Role",
    "Are you sure you want to delete this role?",
    role,
    "deleteRole"
  );
};

const saveConfiguration = async () => {
  try {
    await updateSessionConfiguration(sessionConfigPayload.value);
    toast("Session configuration saved successfully", "success");
    await loadData();
  } catch (error) {
    toast("An error occurred while saving the session configuration", "danger");
    console.error(error);
  }
};

const openModal = (title, fields, data, mode) => {
  dynamicTitle.value = title;
  dynamicFields.value = fields;
  payload.value = data;
  submitMode.value = mode;
  customDialog.value.openModal();
};

const openDeleteModal = (title, message, data, mode) => {
  dynamicTitle.value = title;
  warningTitle.value = title;
  warningMessage.value = message;
  payload.value = data;
  submitMode.value = mode;
  customDialog.value.openModal();
};

const handleWatchPayload = (currentData) => {
  // Compare current form data with original session config
  const hasChanges =
    JSON.stringify(currentData) !== JSON.stringify(originalSessionConfig.value);
  sessionConfigPayload.value = currentData;
  disableButton.value = !hasChanges;
};
</script>

<style scoped></style>
